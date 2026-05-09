import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { InventoryItem } from "@/types/inventory";

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  useEffect(() => {
    // 監聽 stations 集合
    const q = query(collection(db, "stations"), orderBy("updatedAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const inventoryData = snapshot.docs.map((doc) => {
        const data = doc.data();
        
        // 狀態相容性處理：支援中文與英文
        let mappedStatus: "STABLE" | "WARNING" | "CRITICAL" = "STABLE";
        if (data.status === "充足" || data.status === "STABLE") mappedStatus = "STABLE";
        else if (data.status === "警戒" || data.status === "WARNING") mappedStatus = "WARNING";
        else if (data.status === "短缺" || data.status === "CRITICAL") mappedStatus = "CRITICAL";

        return {
          id: doc.id,
          name: data.name || "未命名站點",
          // 核心修正：優先取加總後的 quantity
          quantity: data.quantity ?? 0, 
          category: data.category || "資源站點",
          status: mappedStatus,
          inventory: data.inventory || [],
          lastUpdated: data.updatedAt?.toDate?.()?.getTime() || Date.now(),
        } as InventoryItem;
      });

      setItems(inventoryData);
      setLastUpdated(Date.now());
      setLoading(false);
    }, (error) => {
      console.error("Firestore 監聽失敗:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { items, loading, lastUpdated };
}