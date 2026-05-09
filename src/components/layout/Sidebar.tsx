"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  ClipboardList,
  Box,
  LayoutDashboard,
  MapPin,
  Settings,
  Siren,
  TrendingUp,
  LogOut,
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard/inventory", label: "物資看板", icon: <Boxes className="h-5 w-5" /> },
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
    <aside className="flex h-screen w-72 flex-col border-r border-white/10 bg-brand-dark/90 backdrop-blur-md text-slate-100 shadow-xl shadow-black/30">
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
            <Siren className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-white">SRS</h1>
            <p className="text-[10px] uppercase tracking-widest text-blue-400 font-bold">Resilience Ops</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                active
                  ? "bg-blue-500/10 text-white border border-blue-500/20"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className={active ? "text-blue-300" : "text-slate-400"}>{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-3">
        <button
          type="button"
          className="w-full rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 flex items-center justify-center gap-2 shadow-lg shadow-red-900/30 transition-transform active:scale-[0.98]"
        >
          <Siren className="h-5 w-5" />
          緊急警報
        </button>
        <button
          onClick={handleSignOut}
          type="button"
          className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 px-4 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white flex items-center justify-center gap-2 transition-all"
        >
          <LogOut className="h-4 w-4" />
          安全登出
        </button>
      </div>
    </aside>
  );
}