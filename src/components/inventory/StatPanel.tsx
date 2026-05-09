"use client";

import React from "react";
import { Activity, AlertTriangle, CircleCheck, Radio, Timer } from "lucide-react";

export type StatPanelProps = {
  total: number;
  stable: number;
  warning: number;
  critical: number;
  lastSyncMs?: number | null;
};

export function StatPanel({ total, stable, warning, critical, lastSyncMs }: StatPanelProps) {
  // 格式化同步時間顯示邏輯
  const syncDisplay = lastSyncMs !== null && lastSyncMs !== undefined
    ? lastSyncMs < 1000 ? `${lastSyncMs}ms` : `${(lastSyncMs / 1000).toFixed(1)}s`
    : "---";

  const stats = [
    { label: "總項目", value: total, icon: Activity, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { label: "運作正常", value: stable, icon: CircleCheck, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { label: "庫存警戒", value: warning, icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { label: "緊急缺料", value: critical, icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* 核心指標網格：改為 2x2 佈局防止橫向擠壓 */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <div 
            key={stat.label} 
            className="flex flex-col p-4 rounded-3xl border border-white/5 bg-[#0b1220]/50 backdrop-blur-md shadow-glow"
          >
            <div className={`w-9 h-9 ${stat.bg} ${stat.border} border rounded-xl flex items-center justify-center mb-3 transition-transform hover:scale-110`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">
              {stat.label}
            </span>
            <span className={`text-2xl font-black mt-1 tracking-tight ${stat.color}`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* 即時同步狀態列：獨立出來以解決文字重疊問題 */}
      <div className="flex items-center justify-between p-4 rounded-2xl border border-blue-500/10 bg-blue-500/5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Firestore Real-time Sync
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Timer className="w-3 h-3 text-blue-400" />
          <span className="text-sm font-black text-white font-mono">
            {syncDisplay}
          </span>
        </div>
      </div>
    </div>
  );
}