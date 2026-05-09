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
  selectedId: string;
  onAddStation: (newStation: any) => void;
  onMarkerClick: (id: string) => void;
  onMapClick?: (lat: number, lng: number) => void;
}

function MapEvents({ onAddStation }: { onAddStation: (newStation: any) => void }) {
  const [clickedPos, setClickedPos] = useState<L.LatLng | null>(null);
  const [formData, setFormData] = useState({ name: "", desc: "", inventory: "" });

  useMapEvents({
    click(e) {
      setClickedPos(e.latlng);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clickedPos) return;

    onAddStation({
      id: `new-${Date.now()}`,
      name: formData.name || "未命名點位",
      lat: clickedPos.lat,
      lng: clickedPos.lng,
      status: "NORMAL",
      inventory: formData.inventory || "0 Units",
      desc: formData.desc || "手動新增的點位說明",
    });

    setClickedPos(null);
    setFormData({ name: "", desc: "", inventory: "" });
  };

  // react-leaflet v4 的 Popup 支援直接傳入 position
  return clickedPos ? (
    <Popup 
      position={clickedPos} 
      minWidth={200}
      eventHandlers={{
        remove: () => setClickedPos(null)
      }}
    >
      <div className="p-2 flex flex-col gap-2 bg-[#0b1220] text-white">
        <h3 className="text-sm font-bold border-b border-white/10 pb-1 mb-1 text-blue-400">新增物資點</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 uppercase">座標</span>
            <code className="text-[10px] bg-white/5 p-1 rounded italic">
              {clickedPos.lat.toFixed(4)}, {clickedPos.lng.toFixed(4)}
            </code>
          </div>
          <input
            autoFocus
            className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 outline-none text-white"
            placeholder="點位名稱..."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input
            className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 outline-none text-white"
            placeholder="物資數量 (e.g. 100 Units)..."
            value={formData.inventory}
            onChange={(e) => setFormData({ ...formData, inventory: e.target.value })}
          />
          <textarea
            className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 outline-none resize-none text-white"
            placeholder="點位簡介..."
            rows={2}
            value={formData.desc}
            onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 rounded text-[10px] transition-colors mt-1"
          >
            確認新增
          </button>
        </form>
      </div>
    </Popup>
  ) : null;
}

function MapAutoCenter({ stations, selectedId }: { stations: any[], selectedId: string }) {
  const map = useMap();
  useEffect(() => {
    const selected = stations.find(s => s.id === selectedId);
    if (selected && map) {
      map.flyTo([selected.lat, selected.lng], map.getZoom(), { animate: true });
    }
  }, [selectedId, map, stations]);
  return null;
}

export default function MapComponent({ stations, selectedId, onAddStation, onMarkerClick, onMapClick }: MapProps) {
  if (typeof window === "undefined") return null;

  return (
    <div className="h-full w-full">
      <MapContainer 
        center={[25.0433, 121.5348]} 
        zoom={15} 
        className="h-full w-full" 
        zoomControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        <MapEvents onAddStation={onAddStation} />
        <MapAutoCenter stations={stations} selectedId={selectedId} />
        {stations.map((station) => (
          <Marker
            key={station.id}
            position={[station.lat, station.lng]}
            icon={MARKER_ICON}
            eventHandlers={{ click: () => onMarkerClick(station.id) }}
          />
        ))}
      </MapContainer>
    </div>
  );
}