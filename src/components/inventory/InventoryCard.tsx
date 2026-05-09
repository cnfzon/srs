"use client";

import { Package, ShieldAlert, TriangleAlert } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { InventoryItem } from "@/types/inventory";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function statusIcon(status: InventoryItem["status"]) {
  switch (status) {
    case "CRITICAL":
      return <ShieldAlert className="h-5 w-5 text-alert-400" />;
    case "WARNING":
      return <TriangleAlert className="h-5 w-5 text-amber-300" />;
    default:
      return <Package className="h-5 w-5 text-brand-blue" />;
  }
}

export function InventoryCard({ item }: { item: InventoryItem }) {
  const percent = clamp(item.quantity, 0, 100);
  const barColor =
    item.status === "CRITICAL"
      ? "bg-alert-500"
      : item.status === "WARNING"
        ? "bg-amber-400"
        : "bg-brand-blue";

  return (
    <div className="rounded-2xl border border-brand-border bg-[#0b1220]/50 backdrop-blur p-5 shadow-glow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/5 border border-brand-border flex items-center justify-center">
            {statusIcon(item.status)}
          </div>
          <div className="min-w-0">
            <div className="text-sm text-slate-400">{item.category}</div>
            <div className="text-base font-bold text-slate-50 truncate">{item.name}</div>
          </div>
        </div>
        <StatusBadge status={item.status} />
      </div>

      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <div className="text-3xl font-black tracking-tight text-slate-50">
            {item.quantity.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            LAST UPDATE{" "}
            <span className="font-mono text-slate-300">
              {new Date(item.lastUpdated).toLocaleString()}
            </span>
          </div>
        </div>
        <div className="w-28 text-right">
          <div className="text-[10px] tracking-widest text-slate-500">CAPACITY</div>
          <div className="text-sm font-semibold text-slate-200">{percent}%</div>
        </div>
      </div>

      <div className="mt-4">
        <div className="h-2 rounded-full bg-white/5 border border-brand-border overflow-hidden">
          <div className={`h-full ${barColor}`} style={{ width: `${percent}%` }} />
        </div>
      </div>
    </div>
  );
}

