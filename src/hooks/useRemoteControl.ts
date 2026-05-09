// src/hooks/useRemoteControl.ts
import { useState, useEffect, useRef } from 'react';
import { rtdb, db } from '@/lib/firebase';
import { ref, onValue, set, remove } from 'firebase/database';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
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
    // 1. 初始化 PeerConnection，建議加入多個 STUN 伺服器增加穿透率
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
      ]
    });

    // 2. 監聽連線狀態（除錯用，可在 Vercel F12 查看）
    pc.oniceconnectionstatechange = () => {
      console.log(`⚡ ICE 連線狀態: ${pc.iceConnectionState}`);
    };

    pc.onicegatheringstatechange = () => {
      console.log(`🔍 ICE 收集狀態: ${pc.iceGatheringState}`);
    };

    pc.ontrack = (event) => {
      console.log("🎬 接收到遠端串流");
      setStream(event.streams[0]);
    };

    pcRef.current = pc;

    // 3. 監聽 Python 端傳回的 Answer
    const answerRef = ref(rtdb, 'webrtc_signaling/answer');
    const unsubscribeAnswer = onValue(answerRef, async (snapshot) => {
      const answer = snapshot.val();
      if (answer && pc.signalingState === "have-local-offer") {
        console.log("✅ 收到 Answer，建立連線...");
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    // 4. 發起連線邏輯：必須等待 ICE 收集完成再發送 SDP
    const initiateCall = async () => {
      const offer = await pc.createOffer({ offerToReceiveVideo: true });
      await pc.setLocalDescription(offer);

      // 監聽 ICE 收集狀態，直到 'complete' 才將 Offer 寫入 Firebase
      // 這樣發出的 SDP 才會包含你的公網 IP 候選者
      const checkIceGathering = () => {
        if (pc.iceGatheringState === 'complete') {
          console.log("📡 ICE 收集完成，發送 Offer 至 Firebase");
          set(ref(rtdb, 'webrtc_signaling/offer'), {
            type: pc.localDescription?.type,
            sdp: pc.localDescription?.sdp
          });
          pc.removeEventListener('icegatheringstatechange', checkIceGathering);
        }
      };

      if (pc.iceGatheringState === 'complete') {
        checkIceGathering();
      } else {
        pc.addEventListener('icegatheringstatechange', checkIceGathering);
      }
    };

    initiateCall();

    return () => {
      unsubscribeAnswer();
      // 離開頁面時清理連線與 Firebase 節點，避免下次連線讀到舊數據
      remove(ref(rtdb, 'webrtc_signaling'));
      pc.close();
      pcRef.current = null;
    };
  }, []);

  // 遙測數據監聽 (維持不變)
  useEffect(() => {
    const bridgeRef = ref(rtdb, 'command_bridge');
    return onValue(bridgeRef, async (snapshot) => {
      const val = snapshot.val();
      if (val && val.payload) {
        try {
          const rawData: RawSensorData = JSON.parse(atob(val.payload));
          setTelemetry({
            status: rawData.status.toUpperCase(),
            coord: `(${rawData.coordinates.x}, ${rawData.coordinates.y}, ${rawData.coordinates.z})`,
            count: rawData.quantity,
            conf: "0.95",
            lastUpdate: rawData.timestamp
          });
        } catch (e) { console.error(e); }
      }
    });
  }, []);

  const updateCommands = (newCmd: Partial<ControlCommands>) => {
    setCommands(prev => ({ ...prev, ...newCmd }));
  };

  return { telemetry, stream, commands, updateCommands };
};