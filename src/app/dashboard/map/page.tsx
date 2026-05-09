"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Plus, Search, Navigation, Info, Trash2, Pencil, Check, X } from "lucide-react";
import type { MapProps } from "@/components/MapComponent";

const MapComponent = dynamic<MapProps>(
  () => import("@/components/MapComponent"),
  { 
    ssr: false, 
    loading: () => <div className="h-full w-full bg-[#0b1220]" /> 
  }
);

export default function ResourceMapPage() {
  const [selectedStation, setSelectedStation] = useState("station-alpha");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const listRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const [stations, setStations] = useState([
    { id: "station-alpha", name: "北科實驗室", lat: 25.0433, lng: 121.5348, status: "NORMAL", inventory: "24 Units", desc: "主要位於北側工業區，負責化學物資儲備。" },
    { id: "medical-west", name: "光華中心", lat: 25.0445, lng: 121.5325, status: "LOW_STOCK", inventory: "14%", desc: "西區醫療核心，目前抗生素庫存偏低。" },
    { id: "station-beta", name: "忠孝新生觀測站", lat: 25.0421, lng: 121.5360, status: "NORMAL", inventory: "Sufficient", desc: "高地觀測站，目前通訊與電力供應穩定。" },
    { id: "station-abc", name: "電神照聲的家", lat: 25.0434, lng: 121.5402, status: "NORMAL", inventory: "Sufficient", desc: "太電了 輕鬆科秒 " },
  ]);

  const handleAddStation = (newStation: any) => {
    setStations((prev) => [...prev, newStation]);
    setSelectedStation(newStation.id);
  };

  const handleDeleteStation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("確定要刪除此物資點嗎？")) {
      setStations((prev) => prev.filter((s) => s.id !== id));
      if (selectedStation === id) setSelectedStation("");
    }
  };

  const startEditing = (e: React.MouseEvent, station: any) => {
    e.stopPropagation();
    setEditingId(station.id);
    setEditName(station.name);
  };

  const saveEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStations(prev => prev.map(s => s.id === editingId ? { ...s, name: editName } : s));
    setEditingId(null);
  };

  useEffect(() => {
    if (selectedStation && listRefs.current[selectedStation]) {
      listRefs.current[selectedStation]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedStation]);

  return (
    <div className="flex h-screen w-full bg-[#0b1220] overflow-hidden" suppressHydrationWarning>
      
      {/* 1. 地圖區域 */}
      <main className="relative flex-1 h-full overflow-hidden">
        <MapComponent 
          stations={stations} 
          selectedId={selectedStation} 
          onAddStation={handleAddStation}
          onMarkerClick={setSelectedStation}
        />

        {/* 狀態列保留於地圖內 */}
        <div className="absolute bottom-6 left-6 z-30">
          <div className="bg-[#0b1220]/80 backdrop-blur-xl border border-white/10 p-4 rounded-[1.5rem] shadow-2xl">
            <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">System Status</h3>
            <div className="flex gap-6 text-[10px] font-bold text-slate-300">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                正常運作
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 2. 設施列表區域 */}
      <aside className="w-[24rem] h-full flex flex-col bg-[#0b1220] border-l border-white/5 shadow-[-20px_0_40px_rgba(0,0,0,0.4)] z-40">
        <div className="p-8 border-b border-white/5">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">設施列表</h2>
              <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mt-1">Infrastructure Control</p>
            </div>
            
            {/* 新增按鈕：取代原本的圖層圖示 */}
            <button 
              onClick={() => alert("請在地圖上點擊位置以部署新點位")}
              className="group h-11 w-11 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex flex-col items-center justify-center hover:bg-blue-600 transition-all duration-300 shadow-lg shadow-blue-900/20"
              title="部署新點位"
            >
              <Plus className="h-5 w-5 text-blue-400 group-hover:text-white" />
              <span className="text-[7px] font-bold text-blue-400 group-hover:text-white uppercase mt-0.5">Add</span>
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input 
              className="w-full rounded-2xl bg-white/5 border border-white/5 py-3.5 pl-12 pr-4 text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none" 
              placeholder="搜尋物資站點..." 
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {stations.map((station) => (
            <div 
              key={station.id}
              ref={el => { listRefs.current[station.id] = el }}
              onClick={() => setSelectedStation(station.id)}
              className={`group relative p-5 rounded-3xl cursor-pointer transition-all duration-500 border ${
                selectedStation === station.id 
                ? "bg-blue-600 border-blue-400 shadow-xl scale-[1.02]" 
                : "bg-white/[0.03] border-white/5 hover:bg-white/[0.08]"
              }`}
            >
              {/* 操作按鈕組 */}
              <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => startEditing(e, station)}
                  className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={(e) => handleDeleteStation(e, station.id)}
                  className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="flex justify-between items-start pr-16">
                <div className="w-full">
                  {editingId === station.id ? (
                    <div className="flex items-center gap-2 mb-1" onClick={e => e.stopPropagation()}>
                      <input 
                        autoFocus
                        className="bg-black/40 border border-white/20 rounded px-2 py-1 text-sm text-white w-full outline-none focus:border-white"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                      />
                      <button onClick={saveEdit} className="text-emerald-400 p-1"><Check size={16}/></button>
                      <button onClick={() => setEditingId(null)} className="text-red-400 p-1"><X size={16}/></button>
                    </div>
                  ) : (
                    <h4 className={`font-bold tracking-tight transition-colors ${selectedStation === station.id ? "text-white" : "text-slate-200"}`}>
                      {station.name}
                    </h4>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Navigation className={`h-3 w-3 ${selectedStation === station.id ? "text-blue-200" : "text-blue-500"}`} />
                    <span className={`text-[10px] font-mono ${selectedStation === station.id ? "text-blue-100" : "text-slate-400"}`}>
                      {station.lat.toFixed(4)}, {station.lng.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedStation === station.id && (
                <div className="mt-4 pt-4 border-t border-white/20 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-start gap-3 mb-4 bg-black/20 p-3 rounded-2xl">
                    <Info className="h-4 w-4 text-blue-200 shrink-0 mt-0.5" />
                    <p className="text-xs leading-relaxed text-blue-100 italic">{station.desc}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="bg-white/20 text-[9px] px-2.5 py-1 rounded-lg font-bold text-white uppercase">庫存: {station.inventory}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}