export type InventoryStatus = "STABLE" | "WARNING" | "CRITICAL";

export interface InventoryItem {
  id: string;        // 對應 Firestore Document ID
  name: string;      // 物資名稱 (如: 礦泉水)
  quantity: number;  // 數量
  unit: string;      // 單位 (如: 箱)
  category: string;  // 分類 (用於影像辨識對照)
  status: InventoryStatus; // 狀態 (可由數量判斷)
  updatedAt: number; // 更新時間戳記
}