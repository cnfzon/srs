"use client";

import { useState } from "react";
import { Download, Cpu, Plus, Minus, Rotate3d, Layers, BarChart3, Activity } from "lucide-react";

export default function ThreeDViewPage() {
  const [modelRotation, setModelRotation] = useState(50);

  const storageAreas = [
    { id: "a1", name: "Storage Area A-1", level: 88, status: "Healthy" },
    { id: "b4", name: "Bulk Distribution B-4", level: 42, status: "Attention" },
    { id: "c12", name: "Cold Chain C-12", level: 12, status: "Critical" },
  ];

  const activityLog = [
    { time: "14:32", action: "Drone resupply dispatched to A-1" },
    { time: "14:18", action: "Low stock alert triggered at C-12" },
    { time: "14:05", action: "Realtime telemetry synchronized" },
    { time: "13:50", action: "Sensor calibration completed" },
  ];

  const getStatusColor = (level: number) => {
    if (level >= 70) return "#22c55e";
    if (level >= 40) return "#f59e0b";
    return "#ef4444";
  };

  const getStatusLabel = (level: number) => {
    if (level >= 70) return "Healthy";
    if (level >= 40) return "Attention";
    return "Critical";
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">數位孿生啟用</p>
          <h1 className="text-4xl font-black text-white">倉庫 Station Alpha-9</h1>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" /> 即時遙測同步（延遲 0.4ms）
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10 transition">
            <Download className="h-4 w-4" /> 匯出報告
          </button>
          <button className="inline-flex items-center gap-2 rounded-2xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-400 transition">
            <Cpu className="h-4 w-4" /> 啟動感應器
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 rounded-[2rem] border border-white/10 bg-slate-950/85 shadow-glow overflow-hidden">
          <div className="relative h-[720px] bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_20%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_18%)]" />
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-20" />
            <div className="absolute inset-0 bg-black/40" />

            <div className="relative z-10 flex h-full flex-col justify-between p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">3D Resource Point</p>
                  <h2 className="text-3xl font-black text-white">高科技監控視圖</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button className="rounded-2xl bg-white/10 p-3 text-slate-200 hover:bg-white/20 transition">
                    <Plus className="h-4 w-4" />
                  </button>
                  <button className="rounded-2xl bg-white/10 p-3 text-slate-200 hover:bg-white/20 transition">
                    <Minus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {storageAreas.map((area) => (
                  <div key={area.id} className="rounded-[2rem] border border-white/10 bg-white/5 p-4 text-white">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-sm font-bold">{area.name}</p>
                        <p className="text-xs text-slate-400">{getStatusLabel(area.level)}</p>
                      </div>
                      <span className={`h-3.5 w-3.5 rounded-full ${area.level >= 70 ? "bg-emerald-400" : area.level >= 40 ? "bg-amber-400" : "bg-red-400"}`} />
                    </div>
                    <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full" style={{ width: `${area.level}%`, backgroundColor: getStatusColor(area.level) }} />
                    </div>
                    <div className="mt-3 text-sm font-semibold text-white">{area.level}%</div>
                  </div>
                ))}
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-4 text-slate-300">
                <div className="flex items-center gap-3 mb-4">
                  <Rotate3d className="h-5 w-5 text-blue-300" />
                  <span className="font-semibold text-white">數位孿生模型</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-slate-200">
                    <span>攝影機位置</span>
                    <span>45.2, -12.8, 104.0</span>
                  </div>
                  <div className="flex justify-between text-slate-200">
                    <span>渲染比例</span>
                    <span>1:1000m</span>
                  </div>
                  <div className="flex justify-between text-slate-200">
                    <span>模型旋轉</span>
                    <span>{modelRotation}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-4 space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/85 p-6 shadow-glow backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="h-5 w-5 text-blue-300" />
              <h3 className="text-lg font-bold text-white">庫存統計</h3>
            </div>
            <div className="space-y-4">
              {storageAreas.map((area) => (
                <div key={area.id} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-white">{area.name}</p>
                      <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{getStatusLabel(area.level)}</p>
                    </div>
                    <span className="text-sm font-bold text-slate-200">{area.level}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full" style={{ width: `${area.level}%`, backgroundColor: getStatusColor(area.level) }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-950/85 p-6 shadow-glow backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4">
              <Cpu className="h-5 w-5 text-blue-300" />
              <h3 className="text-lg font-bold text-white">性能指標</h3>
            </div>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex justify-between">
                <span>溫度</span>
                <span className="font-semibold text-white">18.5°C</span>
              </div>
              <div className="flex justify-between">
                <span>濕度</span>
                <span className="font-semibold text-white">45%</span>
              </div>
              <div className="flex justify-between">
                <span>光照度</span>
                <span className="font-semibold text-white">500 lux</span>
              </div>
              <div className="flex justify-between">
                <span>網路延遲</span>
                <span className="font-semibold text-white">0.4ms</span>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-950/85 p-6 shadow-glow backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="h-5 w-5 text-blue-300" />
              <h3 className="text-lg font-bold text-white">活動日誌</h3>
            </div>
            <div className="space-y-3 text-slate-300">
              {activityLog.map((event) => (
                <div key={event.time} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-xs uppercase tracking-[0.35em] text-slate-400">{event.time}</span>
                    <span className="rounded-full bg-blue-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-blue-200">Live</span>
                  </div>
                  <p className="mt-3 text-sm text-white">{event.action}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
