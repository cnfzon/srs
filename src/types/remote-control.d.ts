// src/types/remote-control.d.ts

export interface RawSensorData {
  timestamp: string;
  camera_coordinates?: { x: number; y: number };
  target_coordinates?: { x: number; y: number; z: number };
  total_quantity?: number;
  target_confidence?: number;
  status: string;
}

export interface TelemetryData {
  status: string;
  coord: string;
  count: number;
  conf: string;
  lastUpdate: string;
}

// 修正：對應腳本實際需要的參數 (移動距離)
export interface ControlCommands {
  moveDist: number; 
  threshold: number;
  eStop: boolean;
}

// 擴充：加入腳本中所有的按鈕動作
export type RobotAction = 
  | 'DETECT' | 'STANDBY' | 'TAKE' 
  | 'ROTATE_FRONT' | 'ROTATE_BACK' 
  | 'GRAB' | 'RELEASE' 
  | 'MOVE' | 'AUTO' | 'WORK' | 'RESET';

export interface ActionPayload {
  action: RobotAction;
  params: {
    dist?: number; // 傳遞移動距離參數
  };
  ts: number;
}