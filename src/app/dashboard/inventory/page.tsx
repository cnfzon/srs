"use client";

import { useMemo, useState } from "react";
import {
  Download,
  LayoutDashboard,
  Plus,
  X,
  Save,
  Trash2,
  PackageSearch,
  Sparkles,
  MinusCircle,
  PlusCircle,
  PackageOpen,
} from "lucide-react";
import { InventoryCard } from "@/components/inventory/InventoryCard";
import { StatPanel } from "@/components/inventory/StatPanel";
import { useInventory } from "@/hooks/useInventory";
import { InventoryItem } from "@/types/inventory";
import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from "firebase/firestore";

export default function InventoryDashboardPage() {
  const { items, loading, lastUpdated } = useInventory();
  
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  // formData 初始化包含單位
  const [formData, setFormData] = useState({ 
    name: "", 
    category: "醫療物資",
    inventory: [] as { name: string; quantity: number; unit: string }[] 
  });

  // 自動加總邏輯：計算所有子項目的數量總和
  const totalQuantity = useMemo(() => {
    return formData.inventory.reduce((sum, sub) => sum + (Number(sub.quantity) || 0), 0);
  }, [formData.inventory]);

  const stats = useMemo(() => {
    const stable = items.filter((i) => i.status === "STABLE").length;
    const warning = items.filter((i) => i.status === "WARNING").length;
    const critical = items.filter((i) => i.status === "CRITICAL").length;
    const lastSyncMs = lastUpdated ? Math.max(0, Date.now() - lastUpdated) : null;
    return { stable, warning, critical, total: items.length, lastSyncMs };
  }, [items, lastUpdated]);

  const closeModal = () => {
    setSelectedItem(null);
    setIsAdding(false);
    setFormData({ name: "", category: "醫療物資", inventory: [] });
  };

  // 子項目更新邏輯（支援單位）
  const updateSubItem = (index: number, field: "name" | "quantity" | "unit", value: any) => {
    const newInventory = [...formData.inventory];
    newInventory[index] = { ...newInventory[index], [field]: value };
    setFormData({ ...formData, inventory: newInventory });
  };

  const removeSubItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      inventory: prev.inventory.filter((_, i) => i !== index)
    }));
  };

  // 處理更新或新增至 Firestore
  const handleSync = async () => {
    try {
      // 根據總數量自動決定狀態
      const dbStatus = totalQuantity > 50 ? "STABLE" : (totalQuantity > 0 ? "WARNING" : "CRITICAL");
      
      const payload = {
        name: formData.name,
        category: formData.category,
        inventory: formData.inventory, // 直接發送整個過濾（刪除）後的陣列，徹底同步
        quantity: totalQuantity, 
        status: dbStatus,
        updatedAt: serverTimestamp(),
      };

      if (isAdding) {
        await addDoc(collection(db, "stations"), { ...payload, createdAt: serverTimestamp() });
      } else if (selectedItem) {
        const docRef = doc(db, "stations", selectedItem.id);
        await updateDoc(docRef, payload);
      }
      closeModal();
    } catch (e) {
      console.error("同步失敗:", e);
    }
  };

  const handleDeleteNode = async (id: string) => {
    if (confirm("確定要撤除此資源站點嗎？")) {
      await deleteDoc(doc(db, "stations", id));
      closeModal();
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#020617] overflow-y-auto p-4 md:p-12 space-y-12 text-slate-200">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-3">
          <h1 className="text-4xl font-black text-white flex items-center gap-4 tracking-tighter">
            <LayoutDashboard className="h-10 w-10 text-blue-500" />
            即時動態庫存快照
          </h1>
          <p className="text-slate-400">數位孿生同步系統 - 子項目單位與數量即時同步</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="bg-blue-600 hover:bg-blue-500 px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-blue-900/40">
          <Plus className="h-5 w-5" /> 新增物資節點
        </button>
      </div>

      {/* 數據看板 */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <section className="xl:col-span-8 rounded-[3rem] border border-white/10 bg-slate-900/40 p-8 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Sparkles className="h-32 w-32 text-blue-500" />
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl font-black text-white">資源站點分佈監控</h2>
            <div className="grid grid-cols-3 gap-6 mt-8">
              <div className="bg-emerald-500/5 border border-emerald-500/20 p-8 rounded-[2rem] text-center">
                <p className="text-[10px] font-bold text-emerald-500 uppercase mb-2">穩定運行</p>
                <p className="text-5xl font-black text-white">{stats.stable}</p>
              </div>
              <div className="bg-amber-500/5 border border-amber-500/20 p-8 rounded-[2rem] text-center">
                <p className="text-[10px] font-bold text-amber-500 uppercase mb-2">庫存警戒</p>
                <p className="text-5xl font-black text-white">{stats.warning}</p>
              </div>
              <div className="bg-red-500/5 border border-red-500/20 p-8 rounded-[2rem] text-center">
                <p className="text-[10px] font-bold text-red-500 uppercase mb-2">嚴重短缺</p>
                <p className="text-5xl font-black text-white">{stats.critical}</p>
              </div>
            </div>
          </div>
        </section>
        <aside className="xl:col-span-4">
          <StatPanel {...stats} />
        </aside>
      </div>

      {/* 物資卡片列表 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-32">
        {loading ? (
          <p className="text-slate-500 font-bold animate-pulse">正在同步資料庫數據...</p>
        ) : (
          items.map((item) => (
            <InventoryCard 
              key={item.id} 
              item={item} 
              onEdit={(target) => {
                setSelectedItem(target);
                setFormData({ 
                  name: target.name, 
                  category: target.category || "醫療物資",
                  inventory: target.inventory || []
                });
              }}
            />
          ))
        )}
      </div>

      {/* 修正後的懸浮管理視窗 (Floating Sidebar) */}
      {(selectedItem || isAdding) && (
        <div className="fixed inset-0 z-[100] flex justify-end p-6 pointer-events-none">
          <div className="absolute inset-0 pointer-events-auto" onClick={closeModal} />
          
          <div className="relative w-full max-w-lg pointer-events-auto overflow-hidden rounded-[3.5rem] border border-white/10 bg-[#0b1220]/95 backdrop-blur-3xl shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="p-10 h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-600/20 p-3 rounded-2xl border border-blue-500/30 text-blue-400">
                    <PackageSearch className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-black text-white">站點物資管理</h2>
                </div>
                <button onClick={closeModal} className="p-2 hover:bg-white/10 text-slate-400 rounded-xl transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-8 custom-scrollbar">
                {/* 基礎站點資訊 */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">資源站名稱 (LABEL)</label>
                    <input 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full rounded-2xl bg-white/5 border border-white/10 p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">當前總庫存 (加總結果)</label>
                      <div className="w-full bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl text-2xl font-black text-blue-400 text-center">
                        {totalQuantity}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">主類別</label>
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full rounded-2xl bg-slate-900 border border-white/10 p-4 text-white outline-none"
                      >
                        <option className="bg-[#0b1220]">醫療物資</option>
                        <option className="bg-[#0b1220]">民生用水</option>
                        <option className="bg-[#0b1220]">糧食儲備</option>
                        <option className="bg-[#0b1220]">通訊設備</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 子項目清單 - 加入單位元件 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <label className="text-[11px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                      <PackageOpen className="h-4 w-4" /> 內容物細項清單
                    </label>
                    <button 
                      onClick={() => setFormData(p => ({...p, inventory: [...p.inventory, {name: "新物資", quantity: 0, unit: "個"}]}))}
                      className="text-[10px] font-bold bg-blue-600 px-4 py-2 rounded-full text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition-all"
                    >
                      + 新增品項
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {formData.inventory.map((subItem, index) => (
                      <div key={index} className="group flex flex-col gap-3 p-5 rounded-[2rem] bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all">
                        <div className="flex items-center justify-between">
                          <input 
                            value={subItem.name}
                            onChange={(e) => updateSubItem(index, "name", e.target.value)}
                            className="bg-transparent border-none outline-none text-sm font-bold text-slate-200 placeholder:text-slate-600"
                            placeholder="品項名稱 (如: 礦泉水)"
                          />
                          <button onClick={() => removeSubItem(index)} className="p-2 text-slate-600 hover:text-red-500 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {/* 數量控制 */}
                          <div className="flex items-center gap-2 bg-black/40 rounded-xl px-3 py-1.5 border border-white/10">
                            <button onClick={() => updateSubItem(index, "quantity", Math.max(0, subItem.quantity - 1))}>
                              <MinusCircle className="h-4 w-4 text-slate-500 hover:text-red-400" />
                            </button>
                            <input 
                              type="number"
                              value={subItem.quantity}
                              onChange={(e) => updateSubItem(index, "quantity", parseInt(e.target.value) || 0)}
                              className="w-10 bg-transparent text-center text-xs font-mono font-bold text-blue-400 outline-none"
                            />
                            <button onClick={() => updateSubItem(index, "quantity", subItem.quantity + 1)}>
                              <PlusCircle className="h-4 w-4 text-slate-500 hover:text-emerald-400" />
                            </button>
                          </div>
                          
                          {/* 單位輸入 */}
                          <div className="flex-1 flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 border border-white/5">
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">單位:</span>
                            <input 
                              value={subItem.unit || ""}
                              onChange={(e) => updateSubItem(index, "unit", e.target.value)}
                              className="flex-1 bg-transparent text-xs font-bold text-slate-300 outline-none"
                              placeholder="箱 / 瓶 / 個"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {formData.inventory.length === 0 && (
                      <div className="text-center py-10 border-2 border-dashed border-white/5 rounded-3xl opacity-40">
                        <p className="text-xs font-bold uppercase tracking-widest">目前無任何細項物資</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 底部操作 */}
              <div className="pt-8 border-t border-white/5 flex gap-4">
                {!isAdding && selectedItem && (
                  <button onClick={() => handleDeleteNode(selectedItem.id)} className="p-5 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                    <Trash2 className="h-6 w-6" />
                  </button>
                )}
                <button 
                  onClick={handleSync}
                  className="flex-1 flex items-center justify-center gap-3 rounded-3xl bg-blue-600 py-5 font-bold text-white hover:bg-blue-500 shadow-xl shadow-blue-900/40 transition-all active:scale-95"
                >
                  <Save className="h-5 w-5" /> 更新數位孿生同步
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}