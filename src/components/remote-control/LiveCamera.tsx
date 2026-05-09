// src/components/remote-control/LiveCamera.tsx
import React, { useRef, useEffect } from 'react';

interface Props {
  stream: MediaStream | null;
  isOffline: boolean;
}

export const LiveCamera: React.FC<Props> = ({ stream, isOffline }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      // 嘗試手動觸發播放以應對部分瀏覽器的嚴格策略
      videoRef.current.play().catch(err => {
        console.warn("自動播放受限:", err);
      });
    }
  }, [stream]);

  return (
    <div className="relative w-full aspect-video bg-slate-900 rounded-xl overflow-hidden border-2 border-slate-700 flex items-center justify-center">
      {isOffline ? (
        <div className="text-slate-500 flex flex-col items-center">
          <span className="text-4xl mb-2">📷</span>
          <p>CAMERA SENSOR OFFLINE</p>
        </div>
      ) : (
        <video 
          ref={videoRef}
          autoPlay 
          playsInline 
          muted  // 核心修正：必須靜音才能在大多數瀏覽器中成功自動播放
          className="w-full h-full object-contain"
        />
      )}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
        <span className="text-xs font-mono text-white bg-black/50 px-2 py-1 rounded">RTC LIVE FEED</span>
      </div>
    </div>
  );
};