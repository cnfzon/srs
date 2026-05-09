"use client";

import { useMemo } from "react";
import {
  ArrowUpRight,
  Download,
  ShieldCheck,
  Sparkles,
  LayoutDashboard,
} from "lucide-react";
import { InventoryCard } from "@/components/inventory/InventoryCard";
import { StatPanel } from "@/components/inventory/StatPanel";
import { useInventory } from "@/hooks/useInventory";

export default function InventoryDashboardPage() {
  const { items, loading, lastUpdated } = useInventory();

  const stats = useMemo(() => {
    const stable = items.filter((item) => item.status === "STABLE").length;
    const warning = items.filter((item) => item.status === "WARNING").length;
    const critical = items.filter((item) => item.status === "CRITICAL").length;
    const lastSyncMs = lastUpdated ? Math.max(0, Date.now() - lastUpdated) : null;
    return { stable, warning, critical, total: items.length, lastSyncMs };
  }, [items, lastUpdated]);

  return (
    /** * 核心修正：
     * 1. 確保使用 min-h-screen 而非 h-screen
     * 2. 增加 overflow-y-auto 確保容器本身可滾動
     * 3. 確保 bg 固定或隨內容延伸
     */
    <div className="min-h-screen w-full bg-[#020617] overflow-y-auto overflow-x-hidden p-4 md:p-8 space-y-8">
      
      {/* Header Area */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
            System Live Sync: Active
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white flex items-center gap-3">
            <LayoutDashboard className="h-8 w-8 text-blue-500" />
            物資分配指揮中心
          </h1>
          <p className="text-slate-400 max-w-xl text-sm md:text-base">
            當前正在監控全域資源調度。此界面由數位孿生系統驅動，即時同步來自影像辨識端與前端的數據。
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-5 py-2.5 text-sm font-bold text-slate-300 hover:bg-white/10 transition-all">
            <Download className="h-4 w-4" /> 報表導出
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-900/20 transition-all">
            <ShieldCheck className="h-4 w-4" /> 安全查核
          </button>
        </div>
      </div>

      {/* Main Content Grid - 修復高度塌陷導致的跑版 */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 auto-rows-min">
        
        {/* Left Side: Monitor */}
        <section className="xl:col-span-8 group relative rounded-[2.5rem] border border-white/10 bg-slate-900/40 p-1 backdrop-blur-3xl transition-all hover:border-white/20 overflow-hidden">
          <div className="m-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">Real-time Topographic</span>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-400" /> 資源站點拓樸監控
                </h2>
              </div>
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 w-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] text-slate-400 font-bold">
                    OP{i}
                  </div>
                ))}
              </div>
            </div>

            {/* 可視化數據主體 - 修正寬度與高度比例 */}
            <div className="relative min-h-[300px] lg:min-h-[400px] w-full rounded-[2rem] border border-white/5 bg-[#0a0f1e] overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
              
              <div className="relative z-10 p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col justify-between rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-md min-h-[140px]">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Normal Nodes</span>
                  <div className="mt-4">
                    <span className="text-5xl font-black text-white leading-none">{stats.stable}</span>
                    <p className="text-emerald-400 text-xs mt-3 flex items-center gap-1 font-bold">↑ 運作正常</p>
                  </div>
                </div>
                <div className="flex flex-col justify-between rounded-3xl border border-amber-500/20 bg-amber-500/5 p-6 backdrop-blur-md min-h-[140px]">
                  <span className="text-xs font-bold text-amber-500/50 uppercase tracking-widest">Warnings</span>
                  <div className="mt-4">
                    <span className="text-5xl font-black text-amber-400 leading-none">{stats.warning}</span>
                    <p className="text-amber-500/70 text-xs mt-3 font-bold">需注意庫存</p>
                  </div>
                </div>
                <div className="flex flex-col justify-between rounded-3xl border border-red-500/20 bg-red-500/5 p-6 backdrop-blur-md min-h-[140px]">
                  <span className="text-xs font-bold text-red-500/50 uppercase tracking-widest">Critical</span>
                  <div className="mt-4">
                    <span className="text-5xl font-black text-red-400 leading-none">{stats.critical}</span>
                    <p className="text-red-400 text-xs mt-3 font-bold">物資嚴重短缺</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Side: Stats Panel */}
        <aside className="xl:col-span-4 flex flex-col h-full">
          <div className="flex-1 rounded-[2.5rem] border border-white/10 bg-slate-900/40 p-6 backdrop-blur-3xl transition-all hover:border-white/20 min-h-[400px]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-white tracking-tight">系統健康度分析</h3>
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <ArrowUpRight className="h-5 w-5" />
              </div>
            </div>
            
            <StatPanel
              total={stats.total}
              stable={stats.stable}
              warning={stats.warning}
              critical={stats.critical}
              lastSyncMs={stats.lastSyncMs}
            />
          </div>
        </aside>
      </div>

      {/* Inventory Snapshot Section - 即時動態庫存快照 */}
      <div className="space-y-6 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-2 gap-4">
          <div className="flex items-center gap-4">
            <h3 className="text-2xl font-black text-white tracking-tight">即時動態庫存快照</h3>
            <span className="rounded-lg bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400 border border-blue-500/20 whitespace-nowrap">
              Total: {stats.total}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            Auto-refreshing every 3.0s
          </div>
        </div>

        {/* 捲動內容容器 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-[2rem] border border-white/5 bg-white/5 shadow-inner" />
            ))
          ) : items.length > 0 ? (
            items.map((item) => (
              <div key={item.id} className="transition-transform duration-300 hover:scale-[1.02]">
                <InventoryCard item={item} />
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center rounded-[2rem] border border-dashed border-white/10 bg-white/5">
              <p className="text-slate-500 font-medium italic">目前無活躍資源站點數據</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}