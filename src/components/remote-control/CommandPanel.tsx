// src/components/remote-control/CommandPanel.tsx
import React from 'react';
import { ControlCommands } from '@/types/remote-control';

interface Props {
  commands: ControlCommands;
  onUpdate: (cmd: Partial<ControlCommands>) => void;
}

export const CommandPanel: React.FC<Props> = ({ commands, onUpdate }) => {
  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <span>⚙️</span> 機構參數設定
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-slate-400">目標 X 座標</label>
          <input 
            type="number" 
            value={commands.targetX}
            onChange={(e) => onUpdate({ targetX: parseInt(e.target.value) })}
            className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-blue-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate-400">目標 Y 座標</label>
          <input 
            type="number" 
            value={commands.targetY}
            onChange={(e) => onUpdate({ targetY: parseInt(e.target.value) })}
            className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between">
          <label className="text-sm text-slate-400">YOLO 置信度閾值</label>
          <span className="text-blue-400 font-mono">{commands.threshold.toFixed(2)}</span>
        </div>
        <input 
          type="range" min="0.01" max="1.0" step="0.05"
          value={commands.threshold}
          onChange={(e) => onUpdate({ threshold: parseFloat(e.target.value) })}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>
    </div>
  );
};