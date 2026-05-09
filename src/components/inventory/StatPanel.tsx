"use client";

import { Activity, AlertTriangle, CircleCheck, Radio } from "lucide-react";

export type StatPanelProps = {
  total: number;
  stable: number;
  warning: number;
  critical: number;
  lastSyncMs?: number | null;
};

function StatChip({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  tone: "blue" | "green" | "amber" | "red";
}) {
  const toneClass =
    tone === "green"
      ? "text-emerald-300 border-emerald-500/30 bg-emerald-500/10"
      : tone === "amber"
        ? "text-amber-300 border-amber-500/30 bg-amber-500/10"
        : tone === "red"
          ? "text-alert-400 border-alert-500/30 bg-alert-500/10"
          : "text-brand-blue border-brand-blue/30 bg-brand-blue/10";

  return (
    <div className="rounded-2xl border border-brand-border bg-[#0b1220]/50 backdrop-blur p-4 shadow-glow">
      <div className="flex items-center justify-between">
        <div className="text-xs tracking-widest text-slate-400">{label}</div>
        <div className={`h-9 w-9 rounded-xl border flex items-center justify-center ${toneClass}`}>
          {icon}
        </div>
      </div>
      <div className="mt-2 text-2xl font-black text-slate-50">{value}</div>
    </div>
  );
}

export function StatPanel({ total, stable, warning, critical, lastSyncMs }: StatPanelProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
      <StatChip label="TOTAL ITEMS" value={total} icon={<Activity className="h-4 w-4" />} tone="blue" />
      <StatChip label="STABLE" value={stable} icon={<CircleCheck className="h-4 w-4" />} tone="green" />
      <StatChip label="WARNING" value={warning} icon={<AlertTriangle className="h-4 w-4" />} tone="amber" />
      <StatChip label="CRITICAL" value={critical} icon={<AlertTriangle className="h-4 w-4" />} tone="red" />
      <StatChip
        label="REALTIME SYNC"
        value={lastSyncMs == null ? "—" : `${lastSyncMs}ms`}
        icon={<Radio className="h-4 w-4" />}
        tone="blue"
      />
    </div>
  );
}

