// src/hooks/useRemoteControl.ts
import { useState, useEffect, useRef } from 'react';
import { rtdb } from '@/lib/firebase';
import { ref, onValue, update, remove, serverTimestamp } from 'firebase/database';
import { 
  TelemetryData, 
  ControlCommands, 
  RawSensorData, 
  RobotAction, 
  ActionPayload 
} from '@/types/remote-control';

export const useRemoteControl = () => {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [connStatus, setConnStatus] = useState<'DISCONNECTED' | 'HANDSHAKING' | 'CONNECTED'>('DISCONNECTED');
  const [commands, setCommands] = useState<ControlCommands>({
    moveDist: 15.0, // 修正：預設移動距離
    threshold: 0.20,
    eStop: false,
  });

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const bridgeRef = ref(rtdb, 'command_bridge');

  // ==========================================
  // 1. WebRTC 影像連線邏輯
  // ==========================================
  useEffect(() => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    pc.oniceconnectionstatechange = () => {
      console.log(`⚡ ICE 狀態變更: ${pc.iceConnectionState}`);
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        setStream(null);
      }
    };

    pc.ontrack = (event) => {
      console.log("🎥 成功接收到 WebRTC 影像軌道:", event.streams[0]);
      setStream(event.streams[0]);
    };

    pcRef.current = pc;
    const answerRef = ref(rtdb, 'webrtc_signaling/answer');
    
    const unsubscribeAnswer = onValue(answerRef, async (snapshot) => {
      const answer = snapshot.val();
      if (answer && pc.signalingState === "have-local-offer") {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          console.log("✅ WebRTC Answer 設定成功");
        } catch (err) {
          console.error("❌ WebRTC Answer 設定失敗:", err);
        }
      }
    });

    const initiateCall = async () => {
      try {
        const offer = await pc.createOffer({ offerToReceiveVideo: true });
        await pc.setLocalDescription(offer);

        await new Promise<void>((resolve) => {
          if (pc.iceGatheringState === 'complete') {
            resolve();
          } else {
            const checkIce = () => {
              if (pc.iceGatheringState === 'complete') {
                pc.removeEventListener('icegatheringstatechange', checkIce);
                resolve();
              }
            };
            pc.addEventListener('icegatheringstatechange', checkIce);
            setTimeout(() => {
              pc.removeEventListener('icegatheringstatechange', checkIce);
              resolve(); 
            }, 2000); 
          }
        });

        await update(ref(rtdb), {
          'webrtc_signaling/offer': {
            type: pc.localDescription?.type,
            sdp: pc.localDescription?.sdp
          }
        });
      } catch (err) {
        console.error("❌ 發起連線失敗:", err);
      }
    };

    remove(ref(rtdb, 'webrtc_signaling')).then(() => initiateCall());

    return () => {
      unsubscribeAnswer();
      pc.close();
      pcRef.current = null;
    };
  }, []);

  // ==========================================
  // 2. Firebase 交握連線與遙測數據 (RTDB)
  // ==========================================
  useEffect(() => {
    return onValue(bridgeRef, (snapshot) => {
      const val = snapshot.val();
      if (!val) return;

      if (val.cmd === 'A' && val.src === 'local') {
        setConnStatus('HANDSHAKING');
        update(bridgeRef, { cmd: 'B', src: 'web', ts: serverTimestamp() });
      } else if (val.cmd === 'C' && val.src === 'local') {
        setConnStatus('CONNECTED');
      }

      if (val.payload) {
        try {
          const rawData: RawSensorData = JSON.parse(atob(val.payload));
          
          const tX = rawData.target_coordinates?.x ?? 0;
          const tY = rawData.target_coordinates?.y ?? 0;
          const tZ = rawData.target_coordinates?.z ?? 0;
          const qty = rawData.total_quantity ?? 0;
          const conf = rawData.target_confidence ? rawData.target_confidence.toFixed(2) : "N/A";
          const status = rawData.status ? rawData.status.toUpperCase() : "IDLE";

          setTelemetry({
            status: status,
            coord: `(${tX}, ${tY}, ${tZ})`,
            count: qty,
            conf: conf,
            lastUpdate: rawData.timestamp || ""
          });
        } catch (e) {
          console.error("遙測解析錯誤:", e);
        }
      }
    });
  }, []);

  // ==========================================
  // 3. 動作指令發送
  // ==========================================
  const triggerAction = async (action: RobotAction) => {
    if (connStatus !== 'CONNECTED' && action !== 'RESET') {
      console.warn("⚠️ 設備未連線，無法執行動作");
      return;
    }

    const payload: ActionPayload = {
      action,
      params: { dist: commands.moveDist }, // 修正：帶上距離參數
      ts: Date.now()
    };

    const base64Payload = btoa(JSON.stringify(payload));

    try {
      await update(bridgeRef, {
        action_cmd: base64Payload,
        last_action: action,
        ts: serverTimestamp()
      });
      console.log(`✅ 指令已送出: ${action}`);
    } catch (err) {
      console.error("❌ 送出動作指令失敗:", err);
    }
  };

  const updateCommands = (newCmd: Partial<ControlCommands>) => {
    setCommands(prev => ({ ...prev, ...newCmd }));
  };

  return { telemetry, stream, connStatus, commands, updateCommands, triggerAction };
};