// src/components/remote-control/LiveCamera.tsx
import React, { useRef, useEffect } from 'react';

interface Props {
  stream: MediaStream | null; // 改為接收 WebRTC 串流
  isOffline: boolean;
}

export const LiveCamera: React.FC<Props> = ({ stream, isOffline }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // 當串流更新時，將其掛載到 video 標籤
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
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