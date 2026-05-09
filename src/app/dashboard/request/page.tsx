// src/app/request/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { QRCodeSVG } from 'qrcode.react';
import { 
  CheckCircle2, 
  ClipboardList, 
  Copy, 
  MapPin, 
  Clock3, 
  ClipboardCheck, 
  Minus, 
  Plus,
  Loader2,
  AlertCircle
} from "lucide-react";

// Firestore 相關匯入
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { useStations } from "@/hooks/useStations";
import { Station, InventoryItem } from "@/types/station";

export default function QRDispatchPage() {
  // 1. 取得所有站點資料
  const { stations, loading: stationsLoading } = useStations();
  
  // 2. 狀態管理
  const [selectedStationId, setSelectedStationId] = useState<string>("");
  const [requestItems, setRequestItems] = useState<InventoryItem[]>([]);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(1800);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 3. 當選擇站點時，初始化該站點的物資選取清單
  const currentStation = useMemo(() => 
    stations.find(s => s.id === selectedStationId), 
    [stations, selectedStationId]
  );

  useEffect(() => {
    if (currentStation) {
      // 初始化選取數量為 0
      const initialItems = currentStation.inventory.map(item => ({
        ...item,
        selected: 0 // 擴充型別用於 UI 控制
      }));
      setRequestItems(initialItems as any);
    }
  }, [currentStation]);

  // 4. 倒數計時邏輯
  useEffect(() => {
    if (!requestSubmitted || timeRemaining <= 0) return;
    const timer = setInterval(() => setTimeRemaining(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [requestSubmitted, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 5. 數量增減控制
  const updateQuantity = (index: number, delta: number) => {
    const newItems = [...requestItems];
    const item = newItems[index] as any;
    const newCount = (item.selected || 0) + delta;
    
    if (newCount >= 0 && newCount <= item.quantity) {
      item.selected = newCount;
      setRequestItems(newItems);
    }
  };

  // 6. 提交申請至 Firestore
  const handleSubmitRequest = async () => {
    const selectedList = requestItems.filter((item: any) => item.selected > 0);
    if (selectedList.length === 0) {
      setError("請至少選擇一項物資");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const docRef = await addDoc(collection(db, "requests"), {
        stationId: selectedStationId,
        stationName: currentStation?.name,
        items: selectedList,
        status: "PENDING",
        createdAt: serverTimestamp(),
        expireAt: new Date(Date.now() + 1800 * 1000), // 30分鐘後過期
      });

      setTransactionId(docRef.id);
      setRequestSubmitted(true);
      setTimeRemaining(1800);
    } catch (err) {
      console.error("提交錯誤:", err);
      setError("提交失敗，請檢查網路連線");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (stationsLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4 pb-20">
      {/* 標題區域 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-blue-400">
          <ClipboardCheck className="h-5 w-5" />
          <span className="text-xs font-bold uppercase tracking-widest">Supply Dispatch</span>
        </div>
        <h1 className="text-3xl font-black text-white">物資領取申請</h1>
        <p className="text-slate-400">選擇鄰近站點並預約您需要的物資，系統將產生核銷 QR Code。</p>
      </div>

      {!requestSubmitted ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* 左側：站點與物資選擇 */}
          <div className="space-y-6 lg:col-span-8">
            {/* 站點選擇 */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
              <label className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-300">
                <MapPin className="h-4 w-4 text-blue-400" /> 選擇領取站點
              </label>
              <select
                value={selectedStationId}
                onChange={(e) => setSelectedStationId(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="" disabled>請選擇站點...</option>
                {stations.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
                ))}
              </select>
            </div>

            {/* 物資清單 */}
            {selectedStationId && (
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 px-2 text-sm font-bold text-slate-300">
                  <ClipboardList className="h-4 w-4 text-blue-400" /> 可用物資清單
                </h3>
                <div className="grid gap-3">
                  {requestItems.map((item: any, index) => (
                    <div key={item.name} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10">
                      <div>
                        <p className="font-bold text-white">{item.name}</p>
                        <p className="text-xs text-slate-500">庫存餘額: {item.quantity} {item.unit}</p>
                      </div>
                      <div className="flex items-center gap-4 bg-black/20 p-1 rounded-xl">
                        <button 
                          onClick={() => updateQuantity(index, -1)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white hover:bg-white/10"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-mono font-bold text-blue-400">{item.selected || 0}</span>
                        <button 
                          onClick={() => updateQuantity(index, 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-500"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 右側：確認資訊 */}
          <div className="lg:col-span-4">
            <div className="sticky top-8 rounded-3xl border border-blue-500/20 bg-blue-500/5 p-6 backdrop-blur-xl">
              <h3 className="mb-4 text-lg font-bold text-white">申請摘要</h3>
              <div className="space-y-3 border-b border-white/10 pb-4">
                {requestItems.filter((i: any) => i.selected > 0).map((item: any) => (
                  <div key={item.name} className="flex justify-between text-sm">
                    <span className="text-slate-400">{item.name}</span>
                    <span className="font-mono text-white">x{item.selected}</span>
                  </div>
                ))}
                {requestItems.filter((i: any) => i.selected > 0).length === 0 && (
                  <p className="text-center text-xs text-slate-500 py-4">尚未選擇物資</p>
                )}
              </div>
              
              {error && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-500/10 p-3 text-xs text-red-400">
                  <AlertCircle className="h-4 w-4" /> {error}
                </div>
              )}

              <button
                onClick={handleSubmitRequest}
                disabled={!selectedStationId || isSubmitting}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 font-bold text-white transition-all hover:bg-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "確認提交申請"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* 申請成功 - QR Code 顯示 */
        <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-black text-white">申請已生效</h2>
            <p className="text-slate-400 text-sm">請向站點工作人員出示此代碼進行核銷</p>
          </div>

          <div className="relative rounded-[2.5rem] bg-white p-8 shadow-[0_0_50px_-12px_rgba(59,130,246,0.5)]">
            <QRCodeSVG value={transactionId} size={200} level="H" />
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-[10px] font-bold text-white shadow-lg">
              VALID TOKEN
            </div>
          </div>

          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">交易單號</span>
                <span className="font-mono font-semibold text-white">#{transactionId.slice(-8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">剩餘效期</span>
                <span className="flex items-center gap-1 font-mono font-semibold text-red-400">
                  <Clock3 className="h-3 w-3" /> {formatTime(timeRemaining)}
                </span>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setRequestSubmitted(false);
                  setTransactionId("");
                }}
                className="rounded-2xl bg-white/5 px-4 py-3 text-xs font-bold text-white hover:bg-white/10 transition"
              >
                返回修改
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(transactionId);
                  alert("憑證已複製");
                }}
                className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-xs font-bold text-white hover:bg-blue-500 transition"
              >
                <Copy className="h-3 w-3" /> 複製憑證
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}