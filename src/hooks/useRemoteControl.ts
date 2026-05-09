// src/hooks/useRemoteControl.ts
import { useState, useEffect, useRef } from 'react';
import { rtdb } from '@/lib/firebase';
import { ref, onValue, set, remove } from 'firebase/database';
import { TelemetryData, ControlCommands, RawSensorData } from '@/types/remote-control';

export const useRemoteControl = () => {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [commands, setCommands] = useState<ControlCommands>({
    targetX: 320,
    targetY: 240,
    threshold: 0.2,
    eStop: false,
  });

  const pcRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
      ],
      iceCandidatePoolSize: 10, // 預先收集候選者加速連線
    });

    pc.oniceconnectionstatechange = () => {
      console.log(`⚡ ICE 連線狀態: ${pc.iceConnectionState}`);
      // 若連線中斷，清除畫面
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        setStream(null);
      }
    };

    pc.ontrack = (event) => {
      console.log("🎬 接收到遠端影像軌道");
      setStream(event.streams[0]);
    };

    pcRef.current = pc;

    const answerRef = ref(rtdb, 'webrtc_signaling/answer');
    const unsubscribeAnswer = onValue(answerRef, async (snapshot) => {
      const answer = snapshot.val();
      // 核心修正：增加對 signalingState 的檢查，避免重複觸發
      if (answer && pc.signalingState === "have-local-offer") {
        console.log("✅ 收到 Answer，嘗試建立連線...");
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (err) {
          console.error("❌ 設定遠端描述失敗:", err);
        }
      }
    });

    const initiateCall = async () => {
      try {
        const offer = await pc.createOffer({ offerToReceiveVideo: true });
        await pc.setLocalDescription(offer);

        // 核心修正：確保只有在收集到公網 IP (非 127.0.0.1) 後才發送 Offer
        const checkIce = () => {
          if (pc.iceGatheringState === 'complete') {
            console.log("📡 ICE 收集完成，將 Offer 傳送至 Firebase");
            set(ref(rtdb, 'webrtc_signaling/offer'), {
              type: pc.localDescription?.type,
              sdp: pc.localDescription?.sdp
            });
            pc.removeEventListener('icegatheringstatechange', checkIce);
          }
        };

        if (pc.iceGatheringState === 'complete') {
          checkIce();
        } else {
          pc.addEventListener('icegatheringstatechange', checkIce);
        }
      } catch (err) {
        console.error("❌ 發起連線失敗:", err);
      }
    };

    // 先清除舊的信令資料再發起
    remove(ref(rtdb, 'webrtc_signaling')).then(() => initiateCall());

    return () => {
      unsubscribeAnswer();
      remove(ref(rtdb, 'webrtc_signaling'));
      pc.close();
      pcRef.current = null;
    };
  }, []);

  // 遙測數據解析邏輯保持不變...
  useEffect(() => {
    const bridgeRef = ref(rtdb, 'command_bridge');
    return onValue(bridgeRef, (snapshot) => {
      const val = snapshot.val();
      if (val?.payload) {
        try {
          const rawData: RawSensorData = JSON.parse(atob(val.payload));
          setTelemetry({
            status: rawData.status.toUpperCase(),
            coord: `(${rawData.coordinates.x}, ${rawData.coordinates.y}, ${rawData.coordinates.z})`,
            count: rawData.quantity,
            conf: "N/A",
            lastUpdate: rawData.timestamp
          });
        } catch (e) { console.error("遙測解析錯誤:", e); }
      }
    });
  }, []);

  const updateCommands = (newCmd: Partial<ControlCommands>) => {
    setCommands(prev => ({ ...prev, ...newCmd }));
  };

  return { telemetry, stream, commands, updateCommands };
};