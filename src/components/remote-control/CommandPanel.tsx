// src/components/remote-control/CommandPanel.tsx
import React from 'react';
import { ControlCommands, RobotAction } from '@/types/remote-control';

interface Props {
  commands: ControlCommands;
  connStatus: string;
  onUpdate: (cmd: Partial<ControlCommands>) => void;
  onAction: (action: RobotAction) => void;
}

export const CommandPanel: React.FC<Props> = ({ commands, connStatus, onUpdate, onAction }) => {
  const isConnected = connStatus === 'CONNECTED';

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-5 shadow-lg">
      <div className="flex justify-between items-center pb-2 border-b border-slate-700/50">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span> </span> 機構遠端操控
        </h3>
        <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
          isConnected ? 'bg-green-950 text-green-400 border border-green-800' : 'bg-red-950 text-red-400 border border-red-800'
        }`}>
          {connStatus}
        </span>
      </div>
      
      {/* 第一層：基礎動作 */}
      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => onAction('DETECT')} disabled={!isConnected} className="py-2 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 text-white rounded text-xs font-bold transition-all">
          偵測 (Detect)
        </button>
        <button onClick={() => onAction('STANDBY')} disabled={!isConnected} className="py-2 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 text-white rounded text-xs font-bold transition-all">
          待機 (Standby)
        </button>
        <button onClick={() => onAction('TAKE')} disabled={!isConnected} className="py-2 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 text-white rounded text-xs font-bold transition-all">
          拿取 (Take)
        </button>
      </div>

      {/* 第二層：轉向與夾爪 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase text-slate-400 font-bold">轉向控制</label>
          <div className="flex gap-2">
            <button onClick={() => onAction('ROTATE_FRONT')} disabled={!isConnected} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600/60 disabled:border-slate-800 text-sky-200 rounded text-xs font-bold transition-all">前 (Front)</button>
            <button onClick={() => onAction('ROTATE_BACK')} disabled={!isConnected} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600/60 disabled:border-slate-800 text-sky-200 rounded text-xs font-bold transition-all">後 (Back)</button>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase text-slate-400 font-bold">夾爪控制</label>
          <div className="flex gap-2">
            <button onClick={() => onAction('RELEASE')} disabled={!isConnected} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600/60 disabled:border-slate-800 text-sky-200 rounded text-xs font-bold transition-all">放開</button>
            <button onClick={() => onAction('GRAB')} disabled={!isConnected} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600/60 disabled:border-slate-800 text-sky-200 rounded text-xs font-bold transition-all">夾緊</button>
          </div>
        </div>
      </div>

      {/* 第三層：精確移動 */}
      <div className="space-y-1.5 pt-2 border-t border-slate-700/50">
        <label className="text-[10px] uppercase text-slate-400 font-bold">距離 (Dist) - 正右/負左</label>
        <div className="flex gap-2">
          <input 
            type="number" 
            value={commands.moveDist}
            onChange={(e) => onUpdate({ moveDist: parseFloat(e.target.value) })}
            className="w-1/3 bg-slate-950 border border-slate-700/80 rounded p-2 text-white font-mono outline-none focus:border-sky-500 text-center"
          />
          <button 
            onClick={() => onAction('MOVE')}
            disabled={!isConnected}
            className="w-2/3 bg-slate-200 hover:bg-white text-slate-900 disabled:bg-slate-700 disabled:text-slate-500 rounded font-black transition-all tracking-widest"
          >
            執行移動 (MOVE)
          </button>
        </div>
      </div>

      {/* 第四層：自動化程序 */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button onClick={() => onAction('AUTO')} disabled={!isConnected} className="py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 text-white rounded-lg font-bold transition-all shadow-md">
          執行 Auto
        </button>
        <button onClick={() => onAction('WORK')} disabled={!isConnected} className="py-3 bg-red-600 hover:bg-red-500 disabled:bg-slate-700 text-white rounded-lg font-bold transition-all shadow-md">
          執行 Work
        </button>
      </div>

      {/* 閾值設定 */}
      {/*<div className="space-y-3 pt-4 border-t border-slate-700/50">
        <div className="flex justify-between text-[10px] uppercase text-slate-400 font-bold">
          <span>YOLO Confidence Threshold</span>
          <span className="text-sky-300 font-mono text-xs">{commands.threshold.toFixed(2)}</span>
        </div>
        <input 
          type="range" min="0.01" max="1.0" step="0.05"
          value={commands.threshold}
          onChange={(e) => onUpdate({ threshold: parseFloat(e.target.value) })}
          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
        />
      </div>*/}
    </div>
  );
};