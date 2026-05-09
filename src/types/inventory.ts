export type InventoryStatus = "STABLE" | "WARNING" | "CRITICAL";

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  category: string;
  status: InventoryStatus;
  lastUpdated: number; // epoch ms (or Firestore Timestamp.toMillis() mapped upstream)
}

