"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Sidebar from "@/components/layout/Sidebar";
import { useHandshake } from "@/hooks/useHandshake"; // 引入我們建立的 Hook

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  // 1. 呼叫交握 Hook，取得目前連線狀態
  const { status } = useHandshake();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthenticated(true);
      } else {
        setAuthenticated(false);
        router.replace("/");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 font-medium tracking-widest uppercase text-[10px]">正在驗證身份...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-50 flex">
      {/* 側邊欄 */}
      <Sidebar />
      
      {/* 主要內容區 */}
      <main className="flex-1 relative overflow-y-auto">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-600/5 to-transparent pointer-events-none" />
        
        {/* 2. 新增：頂部狀態條 (用於監控與 Josh 的連線) */}
        <div className="relative z-20 px-8 pt-4 flex justify-end">
          <div className="flex items-center space-x-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700">
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              status === "Connected" ? "bg-green-500" : 
              status === "Handshaking..." ? "bg-yellow-500" : "bg-red-500"
            }`} />
            <span className="text-[10px] font-mono tracking-wider uppercase text-slate-300">
              Local Link: {status}
            </span>
          </div>
        </div>

        <div className="relative z-10 p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}