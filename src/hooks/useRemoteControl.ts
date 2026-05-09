// src/hooks/useRemoteControl.ts
import { useState, useEffect, useRef } from 'react';
import { rtdb, db } from '@/lib/firebase';
import { ref, onValue, set } from 'firebase/database';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { TelemetryData, ControlCommands, RawSensorData } from '@/types/remote-control';

export const useRemoteControl = () => {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  // 修正：必須提供初始值，否則 CommandPanel 的 toFixed(2) 會崩潰
  const [commands, setCommands] = useState<ControlCommands>({
    targetX: 320,
    targetY: 240,
    threshold: 0.2,
    eStop: false,
  });

  const pcRef = useRef<RTCPeerConnection | null>(null);

  // WebRTC 邏輯 (維持不變...)
  useEffect(() => {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    pc.ontrack = (event) => setStream(event.streams[0]);
    pcRef.current = pc;

    const answerRef = ref(rtdb, 'webrtc_signaling/answer');
    onValue(answerRef, async (snapshot) => {
      const answer = snapshot.val();
      if (answer && pc.signalingState === "have-local-offer") {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    const initiateCall = async () => {
      const offer = await pc.createOffer({ offerToReceiveVideo: true });
      await pc.setLocalDescription(offer);
      await set(ref(rtdb, 'webrtc_signaling/offer'), { type: offer.type, sdp: offer.sdp });
    };
    initiateCall();
    return () => pc.close();
  }, []);

  // 遙測數據監聽 (維持不變...)
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

  // 修正：定義接收參數的函式，解決「應有 0 個引數」的問題
  const updateCommands = (newCmd: Partial<ControlCommands>) => {
    setCommands(prev => ({ ...prev, ...newCmd }));
    // 如果需要寫回 Firebase 可在此處加上 set(ref(rtdb, ...), ...)
  };

  return { telemetry, stream, commands, updateCommands };
};