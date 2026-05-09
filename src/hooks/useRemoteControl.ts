// src/hooks/useRemoteControl.ts
import { useState, useEffect } from 'react';
import { rtdb, db } from '@/lib/firebase'; // 確保有匯出 rtdb 和 db
import { ref, onValue } from 'firebase/database'; // RTD 函式
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'; // Firestore 函式
import { TelemetryData, ControlCommands, RawSensorData } from '@/types/remote-control';

export const useRemoteControl = () => {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [commands, setCommands] = useState<ControlCommands>({
    targetX: 320,
    targetY: 240,
    threshold: 0.2,
    eStop: false,
  });

  useEffect(() => {
    // 1. 監聽 Realtime Database 的 command_bridge 節點
    const bridgeRef = ref(rtdb, 'command_bridge');
    
    const unsubscribe = onValue(bridgeRef, async (snapshot) => {
      const val = snapshot.val();
      if (val && val.payload) {
        try {
          // === [解密步驟] ===
          // 1. Base64 解碼 (atob 是瀏覽器原生支援)
          const decodedString = atob(val.payload);
          // 2. 解析 JSON
          const rawData: RawSensorData = JSON.parse(decodedString);

          // === [格式化呈現數據] ===
          const formattedData: TelemetryData = {
            status: rawData.status.toUpperCase(),
            coord: `(${rawData.coordinates.x}, ${rawData.coordinates.y}, ${rawData.coordinates.z})`,
            count: rawData.quantity,
            conf: "0.95", // 假設或從 rawData 取得
            lastUpdate: rawData.timestamp
          };

          // 即時更新前端狀態
          setTelemetry(formattedData);

          // === [存入 Firestore DB 作為歷史紀錄] ===
          // 這裡以 timestamp 為 ID 存入 logs 集合中
          const logId = rawData.timestamp.replace(/[:.]/g, '-');
          await setDoc(doc(db, 'telemetry_logs', logId), {
            ...formattedData,
            raw_payload: val.payload, // 也可以存原始加密字串備份
            server_received_at: serverTimestamp()
          });

        } catch (error) {
          console.error("解碼或解析資料失敗:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // 更新指令的部分 (維持原本邏輯)
  const updateCommands = async (newCmd: Partial<ControlCommands>) => {
    const updated = { ...commands, ...newCmd };
    setCommands(updated);
    // 實務上建議指令也寫回 RTD 讓 Python 端能即時讀取
    // set(ref(rtdb, 'command_bridge/commands'), updated);
  };

  return { telemetry, commands, updateCommands };
};