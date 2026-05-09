// src/app/dashboard/remote-control/page.tsx
'use client';

import React from 'react';
import { useRemoteControl } from '@/hooks/useRemoteControl';
import { LiveCamera } from '@/components/remote-control/LiveCamera';
import { CommandPanel } from '@/components/remote-control/CommandPanel';
import { EmergencyStop } from '@/components/remote-control/EmergencyStop';
import { TelemetryOverlay } from '@/components/remote-control/TelemetryOverlay';

export default function RemoteControlPage() {
  const { telemetry, commands, updateCommands } = useRemoteControl();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white">遠端操作系統</h1>
          <p className="text-slate-400">RESILIENCE OPS - REMOTE CONTROL INTERFACE</p>
        </div>
        <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
          <span className="text-xs text-slate-500 block uppercase">System Latency</span>
          <span className="text-green-400 font-mono">24ms</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左側：影像與遙測數據 */}
        <div className="lg:col-span-2 space-y-6">
          <LiveCamera isOffline={!telemetry} />
          
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="目前狀態" value={telemetry?.status || 'IDLE'} color="text-blue-400" />
            <StatCard label="座標 (X, Y, Depth)" value={telemetry?.coord || '(0, 0, 0)'} color="text-emerald-400" />
            <StatCard label="偵測數量" value={telemetry?.count?.toString() || '0'} color="text-amber-400" />
          </div>
        </div>

        {/* 右側：控制面板 */}
        <div className="space-y-6">
          <CommandPanel commands={commands} onUpdate={updateCommands} />
          <EmergencyStop 
            isPressed={commands.eStop} 
            onToggle={(status) => updateCommands({ eStop: status })} 
          />
          
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 italic text-xs text-slate-500">
            * 警告：遠端操作指令具有物理執行效力，請確保現場安全。
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
      <span className="text-xs text-slate-500 block mb-1">{label}</span>
      <span className={`text-xl font-bold font-mono ${color}`}>{value}</span>
    </div>
  );
}