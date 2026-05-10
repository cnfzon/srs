// src/components/remote-control/TelemetryOverlay.tsx
import React from 'react';
import { TelemetryData } from '@/types/remote-control';

interface Props {
  telemetry: TelemetryData | null;
}

export const TelemetryOverlay: React.FC<Props> = ({ telemetry }) => {
  if (!telemetry) return null;

  // 解析座標字串 (x, y, depth)
  const coords = telemetry.coord.replace(/[()]/g, '').split(',').map(s => s.trim());
  const [x, y, depth] = coords;

  return (
    <div className="absolute inset-0 pointer-events-none p-4 font-mono z-10">
      {/* 右上角：數據標籤 - 統一配色 */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
        <div className="bg-slate-800/90 text-sky-300 px-2 py-1 rounded text-xs border border-slate-700 shadow-md">
          CONF: {telemetry.conf}
        </div>
        <div className="bg-slate-800/90 text-sky-300 px-2 py-1 rounded text-xs border border-slate-700 shadow-md">
          COUNT: {telemetry.count}
        </div>
      </div>

      {/* 畫面中央十字標線 */}
      {telemetry.status !== 'IDLE' && x && y && (
        <div 
          className="absolute border-2 border-sky-400 rounded-full w-12 h-12 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center animate-pulse"
          style={{ 
            left: `${(parseInt(x) / 640) * 100}%`, 
            top: `${(parseInt(y) / 480) * 100}%` 
          }}
        >
          <div className="w-1 h-1 bg-sky-400 rounded-full"></div>
          <div className="absolute -bottom-6 text-[10px] text-sky-400 font-bold bg-black/60 px-1 rounded">
            TARGET: {telemetry.status}
          </div>
        </div>
      )}

      {/* 左下角：深度資訊 HUD - 統一配色 */}
      <div className="absolute bottom-4 left-4 bg-slate-900/90 border-l-4 border-sky-500 p-2 text-[10px] rounded shadow-xl">
        <div className="text-sky-400 uppercase tracking-widest mb-1 font-black">Depth Telemetry</div>
        <div className="text-slate-300 flex gap-3">
          <span>X: <b className="text-white">{x || '0'}</b></span>
          <span>Y: <b className="text-white">{y || '0'}</b></span>
          <span>Z: <b className="text-white">{depth || '0'} mm</b></span>
        </div>
      </div>
    </div>
  );
};