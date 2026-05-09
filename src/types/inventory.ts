export interface InventorySubItem {
  name: string;
  quantity: number;
  unit: string; // 新增單位欄位
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number; // 這是所有 sub-items 的總和
  category: string;
  status: "STABLE" | "WARNING" | "CRITICAL";
  lastUpdated?: number;
  inventory: InventorySubItem[];
}