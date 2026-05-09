// src/types/station.ts
export interface InventoryItem {
  name: string;
  quantity: number;
  unit: string;
}

export interface Station {
  id: string; // 這是 Firebase 自動產生的那個 ID
  name: string;
  description: string;
  status: string;
  location: {
    latitude: number;
    longitude: number;
  };
  inventory: InventoryItem[];
}