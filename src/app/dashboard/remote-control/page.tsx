// src/app/dashboard/remote-control/page.tsx
'use client';

import React from 'react';
import { useRemoteControl } from '@/hooks/useRemoteControl';
import { LiveCamera } from '@/components/remote-control/LiveCamera';
import { CommandPanel } from '@/components/remote-control/CommandPanel';
import { EmergencyStop } from '@/components/remote-control/EmergencyStop';
import { TelemetryOverlay } from '@/components/remote-control/TelemetryOverlay';

export default function RemoteControlPage() {
  const { 
    telemetry, 
    stream, 
    connStatus, 
    commands, 
    updateCommands, 
    triggerAction 
  } = useRemoteControl();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* 標題與連線狀態 */}
      <div className="flex justify-between items-center pb-2 border-b border-slate-700">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter">遠端操作 Mission Control</h1>
          <p className="text-slate-400 text-sm font-mono">RESILIENCE OPS - MISSION CONTROL INTERFACE <span className="text-sky-500/80">v2.1</span></p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Link Status</span>
            <span className={`font-mono text-xs ${connStatus === 'CONNECTED' ? 'text-green-400' : 'text-red-400'}`}>
              ● {connStatus}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左側：視覺監控與數據 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative group">
            <LiveCamera stream={stream} isOffline={!stream && connStatus !== 'CONNECTED'} />
            <TelemetryOverlay telemetry={telemetry} />
            
            {/* 交握提示 */}
            {connStatus === 'HANDSHAKING' && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm z-20 rounded-xl">
                <div className="text-white font-mono animate-pulse flex flex-col items-center">
                  <span className="text-2xl font-bold text-sky-400">⚡ INITIALIZING</span>
                  <span className="text-xs mt-2 text-slate-400">3-way Handshake in progress...</span>
                </div>
              </div>
            )}
          </div>
          
          {/* 數據看板 - 統一配色 */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="System Status" value={telemetry?.status || 'OFFLINE'} />
            <StatCard label="Live Coordinates (X, Y, Z)" value={telemetry?.coord || '(0, 0, 0)'} />
            <StatCard label="Target Count" value={telemetry?.count?.toString() || '00'} />
          </div>
        </div>

        {/* 右側：控制面板 */}
        <div className="space-y-6">
          <CommandPanel 
            commands={commands} 
            connStatus={connStatus}
            onUpdate={updateCommands} 
            onAction={triggerAction}
          />
          
          <EmergencyStop 
            isPressed={commands.eStop} 
            onToggle={(status) => {
              updateCommands({ eStop: status });
              if (status) triggerAction('RESET');
            }} 
          />
          
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <h4 className="text-sky-400 text-[10px] font-bold uppercase mb-2">Communication Log</h4>
            <div className="text-[10px] text-slate-500 font-mono space-y-1.5 h-16 overflow-y-auto">
              <p className="flex justify-between">
                <span>Handshake:</span>
                <span className={connStatus === 'CONNECTED' ? 'text-green-500' : 'text-slate-600'}>
                  {connStatus === 'CONNECTED' ? 'ESTABLISHED' : 'PENDING'}
                </span>
              </p>
              <p className="flex justify-between">
                <span>Video Stream:</span>
                <span className={stream ? 'text-green-500' : 'text-slate-600'}>
                  {stream ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </p>
              <p className="text-[9px] text-slate-600">
                {`> Waiting for A...`}
                {connStatus !== 'DISCONNECTED' && `> B Sent...`}
                {connStatus === 'CONNECTED' && `> C Confirmed.`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 統一配色後的 StatCard 元件
function StatCard({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
      <span className="text-[10px] text-slate-400 block mb-1 uppercase font-bold tracking-widest">{label}</span>
      <span className={`text-xl font-bold font-mono text-white`}>{value}</span>
    </div>
  );
}