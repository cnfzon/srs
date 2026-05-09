// src/components/inventory/InventoryCard.tsx
"use client";

import { Package, ShieldAlert, TriangleAlert, Edit3 } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { InventoryItem } from "@/types/inventory";

interface InventoryCardProps {
  item: InventoryItem;
  onEdit?: (item: InventoryItem) => void;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function statusIcon(status: InventoryItem["status"]) {
  switch (status) {
    case "CRITICAL":
      return <ShieldAlert className="h-5 w-5 text-red-400" />;
    case "WARNING":
      return <TriangleAlert className="h-5 w-5 text-amber-300" />;
    default:
      return <Package className="h-5 w-5 text-blue-400" />;
  }
}

export function InventoryCard({ item, onEdit }: InventoryCardProps) {
  const percent = clamp(item.quantity, 0, 100);

  return (
    <div 
      onClick={() => onEdit?.(item)}
      className="group relative rounded-[2.5rem] border border-white/5 bg-[#0b1220]/50 backdrop-blur-xl p-6 shadow-2xl transition-all duration-300 hover:border-blue-500/30 cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            {statusIcon(item.status)}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{item.category}</div>
            <div className="text-lg font-black text-white truncate tracking-tight">{item.name}</div>
          </div>
        </div>
        <StatusBadge status={item.status} />
      </div>

      <div className="mt-8 flex items-end justify-between">
        <div>
          <div className="text-4xl font-black tracking-tighter text-white">
            {item.quantity.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-tighter">
            Last Sync: <span className="text-slate-400 font-mono">
              {item.lastUpdated ? new Date(item.lastUpdated).toLocaleTimeString() : "N/A"}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Capacity</div>
          <div className={`text-sm font-black ${percent > 80 ? 'text-emerald-400' : 'text-blue-400'}`}>{percent}%</div>
        </div>
      </div>

      <div className="mt-4 h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${
            item.status === 'CRITICAL' ? 'bg-red-500' : item.status === 'WARNING' ? 'bg-amber-400' : 'bg-blue-500'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}