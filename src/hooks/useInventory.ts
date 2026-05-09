"use client";

import { useMemo } from "react";
import { collection, orderBy, query } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "@/lib/firebase";
import type { InventoryItem } from "@/types/inventory";

/**
 * 即時監聽 Firestore `resources` 集合。
 * 後續要串接影像辨識，只要把辨識結果寫入同一集合，UI 會自動即時更新。
 */
export function useInventory() {
  const q = query(collection(db, "resources"), orderBy("lastUpdated", "desc"));
  const [snapshot, loading, error] = useCollection(q);

  const items = useMemo<InventoryItem[]>(() => {
    if (!snapshot) return [];
    return snapshot.docs.map((d) => {
      const data = d.data() as Omit<InventoryItem, "id">;
      return { id: d.id, ...data };
    });
  }, [snapshot]);

  const lastUpdated = items[0]?.lastUpdated ?? null;

  return { items, loading, error, lastUpdated };
}

