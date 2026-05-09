// src/hooks/useStations.ts
import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  QuerySnapshot, 
  QueryDocumentSnapshot, 
  DocumentData 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Station } from '@/types/station';

export function useStations() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 在參數明確加上 Firebase 的型別定義，徹底解決 ts(7006) 報錯
    const unsubscribe = onSnapshot(collection(db, 'stations'), (snapshot: QuerySnapshot<DocumentData>) => {
      const stationsData = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          description: data.description || '',
          status: data.status || '',
          location: {
            latitude: data.location?.latitude || 0,
            longitude: data.location?.longitude || 0
          },
          inventory: data.inventory || []
        } as Station;
      });
      
      setStations(stationsData);
      setLoading(false);
    });

    // 元件卸載時取消監聽，避免 memory leak
    return () => unsubscribe();
  }, []);

  return { stations, loading };
}