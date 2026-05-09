// src/hooks/useInventory.ts
import { useState, useEffect } from 'react';
import { collection, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { InventoryItem, InventoryStatus } from '@/types/inventory';

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  useEffect(() => {
    // 監聽 stations 集合
    const unsubscribe = onSnapshot(collection(db, 'stations'), (snapshot: QuerySnapshot<DocumentData>) => {
      const allItems: InventoryItem[] = [];
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const stationInventory = data.inventory || [];
        
        stationInventory.forEach((inv: any) => {
          // 根據數量判斷狀態 (可依需求調整邏輯)
          let status: InventoryStatus = "STABLE";
          if (inv.quantity < 20) status = "CRITICAL";
          else if (inv.quantity < 50) status = "WARNING";

          allItems.push({
            id: `${doc.id}-${inv.name}`, // 組合 ID 確保唯一性
            name: inv.name,
            quantity: inv.quantity,
            unit: inv.unit,
            category: inv.category || 'general',
            status: status,
            updatedAt: Date.now()
          });
        });
      });

      setItems(allItems);
      setLastUpdated(Date.now());
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { items, loading, lastUpdated };
}