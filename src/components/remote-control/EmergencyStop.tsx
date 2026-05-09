// src/components/remote-control/EmergencyStop.tsx
import React from 'react';

interface Props {
  isPressed: boolean;
  onToggle: (status: boolean) => void;
}

export const EmergencyStop: React.FC<Props> = ({ isPressed, onToggle }) => {
  return (
    <button 
      onClick={() => onToggle(!isPressed)}
      className={`w-full py-6 rounded-xl text-2xl font-black transition-all duration-300 border-b-8 active:border-b-0 active:translate-y-1 ${
        isPressed 
        ? 'bg-slate-700 border-slate-900 text-slate-500 cursor-not-allowed' 
        : 'bg-red-600 border-red-800 text-white hover:bg-red-500 shadow-lg shadow-red-900/40'
      }`}
    >
      {isPressed ? 'SYSTEM HALTED' : 'EMERGENCY STOP'}
    </button>
  );
};