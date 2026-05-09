// src/hooks/useStations.ts
import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Station } from '@/types/station';

export function useStations() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 監聽 stations 集合
    const unsubscribe = onSnapshot(collection(db, 'stations'), (snapshot) => {
      try {
        const stationsData = snapshot.docs.map(doc => {
          const data = doc.data();
          
          // 確保 location 存在且能正確讀取緯經度
          // Firestore GeoPoint 使用 .latitude 和 .longitude
          const lat = data.location?.latitude ?? 0;
          const lng = data.location?.longitude ?? 0;

          return {
            id: doc.id,
            name: data.name || '未命名站點',
            description: data.description || '',
            status: data.status || '充足',
            location: {
              latitude: lat,
              longitude: lng
            },
            inventory: data.inventory || []
          } as Station;
        });
        
        console.log("Firestore 即時數據更新:", stationsData); // 加入 Debug Log
        setStations(stationsData);
      } catch (error) {
        console.error("解析 Firestore 數據時出錯:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return { stations, loading };
}