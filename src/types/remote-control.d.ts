// src/types/remote-control.ts

// 對應 Python 傳出的原始 JSON 結構
export interface RawSensorData {
  timestamp: string;
  coordinates: { x: number; y: number; z: number };
  quantity: number;
  status: string;
}

export interface TelemetryData {
  status: string;      // 辨識狀態 (如: detection)
  coord: string;       // 格式化後的座標字串 "(x, y, z)"
  count: number;       // 對應 quantity
  conf: string;        // 置信度 (Python 目前沒傳，先預設為 "N/A")
  lastUpdate: string;  // 時間戳記
}

export interface ControlCommands {
  targetX: number;
  targetY: number;
  threshold: number;
  eStop: boolean;
}