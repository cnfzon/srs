// src/components/MapComponent.tsx
"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// 修正：使用更符合環保主題的綠色標記（可自定義 Icon）
const MARKER_ICON = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export interface MapProps {
  stations: any[];
  selectedId?: string;
  onAddStation: (newStation: any) => void;
  onMarkerClick: (id: string) => void;
}

function MapEvents({ onAddStation }: { onAddStation: (newStation: any) => void }) {
  const [clickedPos, setClickedPos] = useState<L.LatLng | null>(null);
  const [formData, setFormData] = useState({ 
    name: "", 
    description: "", 
    status: "STABLE" 
  });

  useMapEvents({
    click(e) { setClickedPos(e.latlng); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (clickedPos) {
      onAddStation({
        name: formData.name,
        description: formData.description,
        status: formData.status,
        lat: clickedPos.lat,
        lng: clickedPos.lng,
      });
      setClickedPos(null);
      setFormData({ name: "", description: "", status: "STABLE" });
    }
  };

  return clickedPos ? (
    <Popup 
      position={clickedPos} 
      eventHandlers={{ remove: () => setClickedPos(null) }}
    >
      <div className="p-3 min-w-[220px] bg-slate-900 text-white rounded-lg">
        <h3 className="font-bold text-emerald-400 mb-3 text-sm flex items-center gap-2">
          ♻️ 新增循環據點
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">站點名稱 (如: 台北車站 A 站)</label>
            <input
              type="text"
              placeholder="輸入據點名稱..."
              className="w-full text-[12px] p-2 bg-slate-800 border border-white/10 rounded mt-1 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">站點位置備註</label>
            <textarea
              placeholder="說明具體位置 (如: 東二門入口旁)..."
              className="w-full text-[12px] p-2 bg-slate-800 border border-white/10 rounded mt-1 text-white h-16 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">初始容器狀態</label>
            <select 
              className="w-full text-[12px] p-2 bg-slate-800 border border-white/10 rounded mt-1 text-white focus:outline-none"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="STABLE">潔淨儲備充足 (Stable)</option>
              <option value="WARNING">回收桶接近全滿 (Warning)</option>
              <option value="CRITICAL">潔淨容器耗盡 (Critical)</option>
            </select>
          </div>

          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded text-xs transition-all mt-2 shadow-lg shadow-emerald-500/20"
          >
            確認部署據點
          </button>
        </form>
      </div>
    </Popup>
  ) : null;
}

function MapAutoCenter({ stations, selectedId }: { stations: any[], selectedId?: string }) {
  const map = useMap();
  useEffect(() => {
    if (!selectedId) return;
    const selected = stations.find(s => s.id === selectedId);
    if (selected && map) {
      map.flyTo([selected.lat, selected.lng], map.getZoom(), { animate: true });
    }
  }, [selectedId, map, stations]);
  return null;
}

export default function MapComponent({ stations, selectedId, onAddStation, onMarkerClick }: MapProps) {
  if (typeof window === "undefined") return null;

  return (
    <div className="h-full w-full">
      <MapContainer center={[25.0433, 121.5348]} zoom={15} className="h-full w-full" zoomControl={false}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        <MapEvents onAddStation={onAddStation} />
        <MapAutoCenter stations={stations} selectedId={selectedId} />
        {stations.map((station) => (
          <Marker
            key={station.id}
            position={[station.lat, station.lng]}
            icon={MARKER_ICON}
            eventHandlers={{ click: () => onMarkerClick(station.id) }}
          >
            <Popup>
              <div className="text-sm font-bold text-slate-800">
                {station.name}
                <div className="text-[10px] text-slate-500 font-normal mt-1">{station.description}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}