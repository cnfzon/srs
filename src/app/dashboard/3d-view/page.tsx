"use client";

import React from "react";
import dynamic from "next/dynamic";

// @/components/MapComponent
const GripperScene = dynamic(() => import("@/components/3d-view/GripperScene"), { 
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-black">
      <div className="text-center">
        <p className="text-white font-mono animate-pulse tracking-tighter text-sm">
          SYNCING 3D ASSETS...
        </p>
        <div className="mt-4 h-1 w-48 bg-gray-900 overflow-hidden">
          <div className="h-full bg-green-500 animate-loading-bar w-1/2"></div>
        </div>
      </div>
    </div>
  )
});

export default function Ascii3DViewPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-black overflow-hidden relative">
      <div className="w-full h-screen">
        <GripperScene />
      </div>

      {/* 儀表板 UI 裝飾 */}
      <div className="absolute bottom-10 left-10 text-white z-10 pointer-events-none font-mono">
        <div className="flex flex-col space-y-1">
          <h1 className="text-xl font-black tracking-tighter opacity-90">
            RESOURCE STATION // V1.0
          </h1>
          <div className="flex items-center space-x-2 border-t border-white/20 pt-2">
            <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
            <p className="text-[10px] opacity-50 uppercase tracking-widest">
              Live Mechanism Telemetry
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}