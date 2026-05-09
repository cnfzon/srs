// src/hooks/useHandshake.ts
import { useEffect, useState } from "react";
import { ref, onValue, set, serverTimestamp } from "firebase/database";
import { rtdb } from "@/lib/firebase";

export const useHandshake = () => {
  const [status, setStatus] = useState<"Disconnected" | "Handshaking..." | "Connected">("Disconnected");
  const [lastCmd, setLastCmd] = useState<string>("");

  useEffect(() => {
    const cmdRef = ref(rtdb, 'command_bridge');

    const unsubscribe = onValue(cmdRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const { cmd, src } = data;
      setLastCmd(cmd);

      // --- 4-bit ASCII 交握邏輯 ---
      
      // 1. 收到 Josh 的請求 (A)
      if (src === "local" && cmd === "A") {
        setStatus("Handshaking...");
        // 秒回 B
        set(cmdRef, {
          cmd: "B",
          src: "web",
          ts: serverTimestamp()
        });
      }

      // 2. 收到 Josh 的確認 (C)
      if (src === "local" && cmd === "C") {
        setStatus("Connected");
        console.log("🚀 通訊鏈路已建立 (Handshake Complete)");
      }
    });

    return () => unsubscribe();
  }, []);

  return { status, lastCmd };
};