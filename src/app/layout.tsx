import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SRS - Resilience Ops",
  description: "智能物資調度與倉儲監控系統",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW" className="scroll-smooth">
      <body 
        className={`${inter.className} bg-[#020617] text-slate-50 antialiased min-h-screen`}
        style={{
          // 確保在縮放情況下，body 總是能根據內容延伸高度
          display: 'flex',
          flexDirection: 'column',
          overflowX: 'hidden' 
        }}
      >
        {/* 提示：如果你的頁面依然無法捲動，請檢查 page.tsx 
            的最外層容器是否誤用了 "h-screen" 而非 "min-h-screen"。
        */}
        {children}
      </body>
    </html>
  );
}