"use client";

import { useMemo } from "react";
import {
  ArrowUpRight,
  Download,
  RefreshCcw,
  Plus,
  Minus,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { InventoryCard } from "@/components/inventory/InventoryCard";
import { StatPanel } from "@/components/inventory/StatPanel";
import { useInventory } from "@/hooks/useInventory";
import type { InventoryItem } from "@/types/inventory";

export default function InventoryDashboardPage() {
  const { items, loading, error, lastUpdated } = useInventory();

  const stats = useMemo(() => {
    const stable = items.filter((item) => item.status === "STABLE").length;
    const warning = items.filter((item) => item.status === "WARNING").length;
    const critical = items.filter((item) => item.status === "CRITICAL").length;
    const lastSyncMs = lastUpdated ? Math.max(0, Date.now() - lastUpdated) : null;
    return { stable, warning, critical, total: items.length, lastSyncMs };
  }, [items, lastUpdated]);

  const displayItems: InventoryItem[] = loading ? [] : items;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-500/30" />
            Real-time Sync
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Digital Twin Active</p>
            <h1 className="mt-2 text-4xl font-black text-white">Warehouse Station Alpha-9</h1>
          </div>
          <p className="max-w-2xl text-slate-300">
            即時物資看板正在監控所有倉儲與配送節點，並於 Firestore 中同步庫存狀態。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 hover:bg-white/10 transition">
            <Download className="h-4 w-4" /> 匯出報告
          </button>
          <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-blue-500/15 px-4 py-3 text-sm font-semibold text-blue-200 hover:bg-blue-500/20 transition">
            <ShieldCheck className="h-4 w-4" /> 安全巡檢
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <section className="xl:col-span-8 space-y-6 rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur-xl">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/80 px-3 py-2 text-xs uppercase tracking-[0.32em] text-slate-300">
                <Sparkles className="h-4 w-4 text-emerald-300" /> High-tech Command Center
              </div>
              <h2 className="text-2xl font-black text-white">智能工廠與倉儲監控</h2>
              <p className="max-w-2xl text-slate-400">
                即時資源地圖、庫存警報與物資狀態一目了然。利用大數據與數位孿生，提升災難應變效率。
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 hover:bg-white/10 transition">
                <Plus className="h-4 w-4" /> Add Node
              </button>
              <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 hover:bg-white/10 transition">
                <Minus className="h-4 w-4" /> Remove
              </button>
              <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-blue-500/15 px-4 py-3 text-sm font-semibold text-blue-100 hover:bg-blue-500/20 transition">
                <RefreshCcw className="h-4 w-4" /> Refresh
              </button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 overflow-hidden shadow-inner">
            <div className="relative h-[420px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.24),transparent_20%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.18),transparent_22%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(15,23,42,0.7),rgba(15,23,42,0.95))]" />
              <div className="relative z-10 h-full w-full p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Warehouse Topology</p>
                    <h3 className="text-xl font-black text-white">Resource Point Alpha-9</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-2 text-sm text-emerald-200">
                      <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" /> Realtime Sync
                    </div>
                  </div>
                </div>
                <div className="mt-8 grid grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="rounded-3xl border border-white/10 bg-white/5 p-4 text-slate-200">
                      <div className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Zone {index + 1}</div>
                      <div className="mt-4 flex h-24 items-end justify-center rounded-3xl bg-slate-800/80">
                        <span className="text-3xl font-black">{index === 0 ? "88%" : index === 1 ? "42%" : "12%"}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 rounded-3xl border border-white/10 bg-slate-950/70 p-4 grid grid-cols-3 gap-4 text-slate-200 text-[10px] uppercase tracking-[0.2em]">
                  <div className="rounded-3xl bg-slate-900/80 p-3">Camera Pos: 45.2, -12.8, 104.0</div>
                  <div className="rounded-3xl bg-slate-900/80 p-3">Render Scale: 1:1000m</div>
                  <div className="rounded-3xl bg-slate-900/80 p-3">Active Feed</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="xl:col-span-4 space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Performance Overview</p>
                <h2 className="mt-2 text-2xl font-black text-white">Resource Health</h2>
              </div>
              <ArrowUpRight className="h-5 w-5 text-emerald-300" />
            </div>
            <div className="mt-6">
              <StatPanel
                total={stats.total}
                stable={stats.stable}
                warning={stats.warning}
                critical={stats.critical}
                lastSyncMs={stats.lastSyncMs}
              />
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white mb-5">Station Status</h3>
            <div className="space-y-4">
              {[
                { name: "Storage Area A-1", label: "Healthy", ratio: 88, tone: "emerald" },
                { name: "Bulk Distribution B-4", label: "Attention", ratio: 42, tone: "amber" },
                { name: "Cold Chain C-12", label: "Critical", ratio: 12, tone: "red" },
              ].map((stat) => (
                <div key={stat.name} className="rounded-3xl border border-white/10 bg-slate-950/80 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-white">{stat.name}</p>
                      <p className="text-xs text-slate-400">Status overview</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.25em] ${
                      stat.tone === "emerald"
                        ? "bg-emerald-500/10 text-emerald-300"
                        : stat.tone === "amber"
                        ? "bg-amber-500/10 text-amber-300"
                        : "bg-red-500/10 text-red-300"
                    }`}>{stat.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full ${stat.tone === "emerald" ? "bg-emerald-400" : stat.tone === "amber" ? "bg-amber-400" : "bg-red-400"}`}
                        style={{ width: `${stat.ratio}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-300">{stat.ratio}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Resource Cards</p>
            <h3 className="text-2xl font-black text-white">動態庫存快照</h3>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
            共 {stats.total} 項目
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-60 animate-pulse rounded-3xl border border-white/10 bg-white/5" />
            ))
          ) : displayItems.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-white/10 bg-white/5 p-8 text-slate-300">
              目前 Firestore 資料庫中的 resources 尚無資料，請先建立 sample 資料後重新整理。
            </div>
          ) : (
            displayItems.map((item) => <InventoryCard key={item.id} item={item} />)
          )}
        </div>
      </div>
    </div>
  );
}