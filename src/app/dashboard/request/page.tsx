"use client";

import { FormEvent, useEffect, useState } from "react";
// 修正匯入方式
import { QRCodeSVG } from 'qrcode.react'; 
// 將 Task 替換為 ClipboardCheck，這在物資申請情境很合適
import { CheckCircle2, ClipboardList, Copy, MapPin, ShieldCheck, Clock3, ClipboardCheck, Minus, Plus } from "lucide-react";

interface SupplyItem {
  id: string;
  name: string;
  available: number;
  selected: number;
}

export default function QRDispatchPage() {
  const [station, setStation] = useState("taipei-zhongshan");
  const [items, setItems] = useState<SupplyItem[]>([
    { id: "water", name: "瓶裝水", available: 100, selected: 5 },
    { id: "noodles", name: "泡麵", available: 50, selected: 2 },
    { id: "blanket", name: "毛毯", available: 20, selected: 1 },
  ]);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(1800);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!requestSubmitted || timeRemaining <= 0) return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [requestSubmitted, timeRemaining]);

  const handleQuantityChange = (itemId: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newQty = Math.max(0, Math.min(item.available, item.selected + delta));
          return { ...item, selected: newQty };
        }
        return item;
      })
    );
  };

  const handleSubmitRequest = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const selectedItems = items.filter((item) => item.selected > 0);
    if (selectedItems.length === 0) {
      setError("請選擇至少一項物資");
      setLoading(false);
      return;
    }

    try {
      const txId = `RO-${Math.floor(Math.random() * 100000)}-TX`;
      setTransactionId(txId);
      setTimeRemaining(1800);
      setRequestSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "申請失敗，請重試");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const stationNames: Record<string, string> = {
    "taipei-zhongshan": "台北中山資源站",
    "newtaipei-banqiao": "新北板橋配送中心",
    "taoyuan-depot": "桃園區域倉庫",
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Supply Request</p>
            <h1 className="text-4xl font-black text-white">物資申請</h1>
          </div>
          <p className="max-w-2xl text-slate-300">
            生成安全的 QR 碼以從本地配送中心快速領取物資。
          </p>
        </div>
      </div>

      {!requestSubmitted ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleSubmitRequest} className="rounded-[2rem] border border-white/10 bg-slate-950/85 p-6 shadow-glow backdrop-blur-xl">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-[0.35em] text-slate-400 mb-3">選擇物資點</label>
                  <div className="relative">
                    <select
                      value={station}
                      onChange={(e) => setStation(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                    >
                      {Object.entries(stationNames).map(([key, name]) => (
                        <option key={key} value={key} className="bg-slate-950 text-white">
                          {name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                      <MapPin className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-[0.35em] text-slate-400 mb-3">選擇所需物資</label>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-500/10 text-blue-300">
                            {item.id === "water" && <MapPin className="h-5 w-5" />}
                            {item.id === "noodles" && <ClipboardList className="h-5 w-5" />}
                            {item.id === "blanket" && <ShieldCheck className="h-5 w-5" />}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{item.name}</p>
                            <p className="text-sm text-slate-400">可用：{item.available}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 rounded-full bg-slate-950/90 px-2 py-1">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item.id, -1)}
                            className="rounded-full bg-white/5 p-2 text-slate-200 hover:bg-white/10 transition"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center text-lg font-bold text-white">{item.selected}</span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item.id, 1)}
                            className="rounded-full bg-white/5 p-2 text-slate-200 hover:bg-white/10 transition"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-200">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-blue-500 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-400 disabled:opacity-60"
                >
                  <ClipboardCheck className="inline-block h-4 w-4 mr-2" /> {loading ? "生成中..." : "生成 QR 碼"}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-5 rounded-[2rem] border border-dashed border-blue-400/30 bg-slate-950/85 p-8 text-center shadow-glow backdrop-blur-xl relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 opacity-10">
              <MapPin className="h-[200px] w-[200px] text-blue-500/20" />
            </div>
            <div className="relative z-10 mx-auto flex h-48 w-48 items-center justify-center rounded-[2rem] bg-slate-900/80 border border-white/10">
              <MapPin className="h-16 w-16 text-blue-400/70" />
            </div>
            <div className="mt-8 space-y-4">
              <p className="text-lg font-bold text-white">QR 申請預覽</p>
              <p className="text-slate-400">系統將會於生成後建立一組安全憑證，並於右側顯示 QR Code。</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/85 p-6 shadow-glow backdrop-blur-xl">
              <h2 className="text-2xl font-bold text-white mb-4">申請詳情</h2>
              <div className="space-y-4 text-sm text-slate-300">
                <div className="flex justify-between">
                  <span>物資站</span>
                  <span className="font-semibold text-white">{stationNames[station]}</span>
                </div>
                <div>
                  <span className="block text-slate-500 mb-2">所選物資</span>
                  <div className="space-y-2">
                    {items.filter((item) => item.selected > 0).map((item) => (
                      <div key={item.id} className="flex justify-between text-white/90">
                        <span>{item.name}</span>
                        <span>× {item.selected}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/85 p-5 text-slate-300">
                <div className="flex items-center gap-3 text-blue-300 mb-3">
                  <MapPin className="h-5 w-5" />
                  <span className="font-semibold text-white">站點導航</span>
                </div>
                <p className="text-sm">依照指示前往最近的資源點完成領取。</p>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/85 p-5 text-slate-300">
                <div className="flex items-center gap-3 text-amber-300 mb-3">
                  <Clock3 className="h-5 w-5" />
                  <span className="font-semibold text-white">30 分鐘限制</span>
                </div>
                <p className="text-sm">請於 30 分鐘內出示 QR 碼，以完成收貨流程。</p>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/85 p-5 text-slate-300">
              <div className="flex items-center gap-3 text-emerald-300 mb-3">
                <ShieldCheck className="h-5 w-5" />
                <span className="font-semibold text-white">安全驗證</span>
              </div>
              <p className="text-sm">出示此 QR 碼予站務人員進行領取確認。</p>
            </div>
          </div>

          <div className="lg:col-span-3 rounded-[2rem] border border-white/10 bg-slate-950/85 p-6 shadow-glow backdrop-blur-xl flex flex-col items-center text-center">
            <div className="rounded-3xl bg-white p-5 shadow-inner">
              {/* 這裡修正為 QRCodeSVG */}
              <QRCodeSVG
                value={`${transactionId}|${station}|${items
                  .filter((item) => item.selected > 0)
                  .map((item) => `${item.id}:${item.selected}`)
                  .join(",")}`}
                size={220}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="mt-6 space-y-4 text-left w-full">
              <span className="inline-flex rounded-full bg-emerald-500/15 px-3 py-1 text-xs uppercase tracking-[0.25em] text-emerald-300">
                <CheckCircle2 className="h-4 w-4 mr-2" /> 有效憑證
              </span>
              <p className="text-lg font-bold text-white">請在 30 分鐘內前往資源站領取，並向管理員出示此 QR Code。</p>
              <p className="text-sm text-slate-400 italic">Please present this QR code to the station administrator within 30 minutes to complete your collection.</p>
              <div className="space-y-3 border-t border-white/10 pt-4 text-sm text-slate-300">
                <div className="flex justify-between">
                  <span>交易編號</span>
                  <span className="font-semibold text-white">#{transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span>有效期限</span>
                  <span className="font-semibold text-red-300">{formatTime(timeRemaining)}</span>
                </div>
              </div>
            </div>
            <div className="mt-6 grid w-full grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setRequestSubmitted(false);
                  setTransactionId("");
                }}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
              >
                新增申請
              </button>
              <button
                onClick={() => {
                  const qrContent = `${transactionId}|${station}|${items
                    .filter((item) => item.selected > 0)
                    .map((item) => `${item.id}:${item.selected}`)
                    .join(",")}`;
                  navigator.clipboard.writeText(qrContent);
                  alert("已複製到剪貼板");
                }}
                className="rounded-2xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-400 transition"
              >
                <Copy className="inline-block h-4 w-4 mr-2" /> 複製憑證
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}