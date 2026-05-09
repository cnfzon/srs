// src/components/MapComponent.tsx
"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const MARKER_ICON = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
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
    status: "充足" 
  });

  useMapEvents({
    click(e) { setClickedPos(e.latlng); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (clickedPos) {
      // 發送結構化的資料給 page.tsx
      onAddStation({
        name: formData.name,
        description: formData.description,
        status: formData.status,
        lat: clickedPos.lat,
        lng: clickedPos.lng,
      });
      setClickedPos(null);
      setFormData({ name: "", description: "", status: "充足" });
    }
  };

  return clickedPos ? (
    <Popup 
      position={clickedPos} 
      eventHandlers={{ remove: () => setClickedPos(null) }}
    >
      <div className="p-3 min-w-[220px] bg-slate-900 text-white rounded-lg">
        <h3 className="font-bold text-blue-400 mb-3 text-sm flex items-center gap-2">
          📍 新增部署站點
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold">站點名稱</label>
            <input
              type="text"
              placeholder="請輸入站點名稱..."
              className="w-full text-[12px] p-2 bg-slate-800 border border-white/10 rounded mt-1 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold">站點描述</label>
            <textarea
              placeholder="請輸入備註..."
              className="w-full text-[12px] p-2 bg-slate-800 border border-white/10 rounded mt-1 text-white h-20 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold">初始狀態</label>
            <select 
              className="w-full text-[12px] p-2 bg-slate-800 border border-white/10 rounded mt-1 text-white focus:outline-none"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="充足">充足 (Stable)</option>
              <option value="吃緊">吃緊 (Warning)</option>
              <option value="短缺">短缺 (Critical)</option>
            </select>
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded text-xs transition-all mt-2 shadow-lg shadow-blue-500/20"
          >
            確認部署到此座標
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
            <Popup><div className="text-sm font-bold text-slate-800">{station.name}</div></Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}