// src/components/remote-control/TelemetryOverlay.tsx
import React from 'react';
import { TelemetryData } from '@/types/remote-control';

interface Props {
  telemetry: TelemetryData | null;
}

export const TelemetryOverlay: React.FC<Props> = ({ telemetry }) => {
  if (!telemetry) return null;

  // 從字串解析出數值供視覺定位
  const coords = telemetry.coord.replace(/[()]/g, '').split(',').map(s => parseFloat(s.trim()));
  const [x, y] = coords;

  return (
    <div className="absolute inset-0 pointer-events-none p-4 font-mono">
      {/* 狀態 HUD */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
        <div className="bg-blue-600/80 text-white px-2 py-1 rounded text-xs border border-blue-400">
          CONF: {telemetry.conf}
        </div>
        <div className="bg-emerald-600/80 text-white px-2 py-1 rounded text-xs border border-emerald-400">
          COUNT: {telemetry.count}
        </div>
      </div>

      {/* 目標定位點 (以 640x480 為基準縮放) */}
      {telemetry.status === 'DETECTION' && (
        <div 
          className="absolute border-2 border-red-500 rounded-full w-12 h-12 -translate-x-1/2 -translate-y-1/2"
          style={{ 
            left: `${(x / 640) * 100}%`, 
            top: `${(y / 480) * 100}%` 
          }}
        >
          <div className="absolute -bottom-6 text-[10px] text-red-500 font-bold bg-black/50 px-1 whitespace-nowrap">
            TARGET: {telemetry.status}
          </div>
        </div>
      )}
    </div>
  );
};