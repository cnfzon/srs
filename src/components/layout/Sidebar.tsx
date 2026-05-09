// src/components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  ClipboardList,
  Box,
  LayoutDashboard,
  MapPin,
  TrendingUp,
  LogOut,
  Recycle,
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard/inventory", label: "物資看板", icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: "/dashboard/map", label: "資源地圖", icon: <MapPin className="h-5 w-5" /> },
  { href: "/dashboard/request", label: "QR 調度", icon: <ClipboardList className="h-5 w-5" /> },
  { href: "/dashboard/3d-view", label: "3D 檢視", icon: <Box className="h-5 w-5" /> },
  { href: "/dashboard/remote-control", label: "遠端操作", icon: <TrendingUp className="h-5 w-5" /> },
];

export default function Sidebar() {
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("登出失敗:", error);
    }
  };

  return (
    <aside className="flex h-screen w-72 flex-col border-r border-white/10 bg-[#0b1220]/90 backdrop-blur-md text-slate-100 shadow-xl shadow-black/30">
      {/* Logo 區域 - 保持綠色系循環主題 */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-900/20">
            <Recycle className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-white leading-tight">SRS</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-black">Resilience Ops</p>
          </div>
        </div>
      </div>

      {/* 導航選單 */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300 ${
                active
                  ? "bg-emerald-500/10 text-white border border-emerald-500/20 shadow-lg shadow-emerald-900/10"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className={`transition-colors ${active ? "text-emerald-400" : "text-slate-500"}`}>
                {item.icon}
              </span>
              <span className="truncate tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* 底部按鈕區 - 已移除緊急警報按鈕，僅保留安全登出 */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleSignOut}
          type="button"
          className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 px-4 text-xs font-bold text-slate-400 hover:bg-white/10 hover:text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <LogOut className="h-4 w-4" />
          安全登出
        </button>
      </div>
    </aside>
  );
}