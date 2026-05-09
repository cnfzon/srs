// src/app/dashboard/map/page.tsx
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Search, Navigation, Recycle, Loader2, Info, MapPin } from "lucide-react";
import type { MapProps } from "@/components/MapComponent";
import { useStations } from "@/hooks/useStations";
import { db } from "@/lib/firebase";
import { collection, addDoc, GeoPoint, serverTimestamp } from "firebase/firestore";

// 動態載入地圖組件以避免 SSR 問題
const MapComponent = dynamic<MapProps>(
  () => import("@/components/MapComponent"),
  { 
    ssr: false, 
    loading: () => (
      <div className="h-full w-full bg-[#0b1220] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
      </div>
    ) 
  }
);

export default function ResourceMapPage() {
  const { stations, loading } = useStations();
  const [selectedStationId, setSelectedStationId] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 自動選擇列表中的第一個站點作為初始焦點
  useEffect(() => {
    if (stations.length > 0 && !selectedStationId) {
      setSelectedStationId(stations[0].id);
    }
  }, [stations, selectedStationId]);

  const filteredStations = stations.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const currentStation = stations.find(s => s.id === selectedStationId);

  // 修正：對接循環經濟主題的欄位寫入
  const handleAddStation = async (newStation: { 
    name: string; 
    description: string; 
    lat: number; 
    lng: number; 
    status: string;
  }) => {
    if (!newStation.name) return;

    try {
      setIsSubmitting(true);
      
      const docRef = await addDoc(collection(db, "stations"), {
        name: newStation.name,
        description: newStation.description || "",
        location: new GeoPoint(newStation.lat, newStation.lng),
        status: newStation.status || "充足",
        category: "智慧循環站", // 契合主題類別
        inventory: [
          { name: "循環杯", quantity: 0, unit: "個" },
          { name: "循環餐盒", quantity: 0, unit: "個" }
        ],
        quantity: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log("✅ 循環據點已成功建立，ID: ", docRef.id);
      setSelectedStationId(docRef.id); 
    } catch (error) {
      console.error("❌ 新增據點失敗:", error);
      alert("部署失敗，請檢查權限設定或網路連線");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-[calc(100vh-120px)] min-h-[600px]">
      {/* 左側：據點列表控制面板 */}
      <aside className="xl:col-span-4 flex flex-col gap-6 overflow-hidden">
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] flex flex-col gap-6 overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Recycle className="h-5 w-5 text-emerald-400" /> 循環據點監控
              </h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                Real-time Circular Hub Distribution
              </p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              <span className="text-xs font-bold text-emerald-400">Total Hubs: {stations.length}</span>
            </div>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
            <input 
              type="text"
              placeholder="搜尋站點名稱或地址..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/20 border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {loading ? (
              <div className="h-24 animate-pulse bg-white/5 rounded-3xl" />
            ) : filteredStations.map((station) => (
              <button
                key={station.id}
                onClick={() => setSelectedStationId(station.id)}
                className={`w-full text-left p-4 rounded-3xl transition-all duration-300 border ${
                  selectedStationId === station.id 
                    ? "bg-emerald-600 border-emerald-400 shadow-lg shadow-emerald-900/20" 
                    : "bg-white/5 border-white/5 hover:bg-white/10"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-white">{station.name}</h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    station.status === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-white/20 text-white'
                  }`}>
                    {station.status === 'STABLE' ? '潔淨充足' : station.status === 'WARNING' ? '回收桶將滿' : '缺料中'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Navigation className="h-3 w-3 text-slate-400" />
                  <span className="text-[10px] font-mono text-slate-400">
                    {station.location.latitude.toFixed(4)}, {station.location.longitude.toFixed(4)}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-1">
              <Info className="h-4 w-4 text-emerald-400" />
              <p className="text-[10px] text-emerald-400 font-bold uppercase">管理提示</p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              點擊地圖任意位置可新增「回收發放點」。請根據現場容器周轉狀況更新狀態。
            </p>
          </div>
        </div>
      </aside>

      {/* 右側：地圖區域 */}
      <section className="xl:col-span-8 relative rounded-[2.5rem] border border-white/10 bg-slate-900/40 p-2 overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="absolute top-6 left-6 z-10">
          <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 p-3 rounded-2xl shadow-xl flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-xl">
              <MapPin className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Active Hub</p>
              <h2 className="text-lg font-black text-white">{currentStation?.name || "未選取據點"}</h2>
            </div>
          </div>
        </div>

        <div className="h-full w-full rounded-[2rem] overflow-hidden border border-white/5">
          <MapComponent 
            stations={stations.map(s => ({
              id: s.id,
              name: s.name,
              lat: s.location.latitude,
              lng: s.location.longitude,
              status: s.status,
              description: s.description 
            }))}
            selectedId={selectedStationId}
            onMarkerClick={(id) => setSelectedStationId(id)}
            onAddStation={handleAddStation}
          />
        </div>
        
        {isSubmitting && (
          <div className="absolute inset-0 z-[1000] bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl flex flex-col items-center gap-4 shadow-2xl">
              <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
              <p className="text-sm font-bold text-white tracking-widest">正在更新循環據點網路...</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}