import React from 'react';
import { useApp } from '../context/AppContext';

export const Toast: React.FC = () => {
  const { toast } = useApp();

  if (!toast.show) return null;

  return (
    <div
      className={`fixed top-12 left-1/2 -translate-x-1/2 z-[9999] w-[92%] max-w-md px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold backdrop-blur-md transition-all duration-300 transform animate-in fade-in slide-in-from-top-4 ${
        toast.type === 'success'
          ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white border border-rose-400 shadow-rose-500/20'
          : toast.type === 'error'
          ? 'bg-rose-700/95 text-white border border-rose-400 shadow-rose-900/30'
          : 'bg-slate-900/95 text-white border border-slate-700 shadow-slate-900/30'
      }`}
    >
      <i
        className={`fa-solid ${
          toast.type === 'success'
            ? 'fa-heart text-white animate-pulse'
            : toast.type === 'error'
            ? 'fa-circle-exclamation text-rose-200'
            : 'fa-circle-info text-rose-300'
        }`}
      ></i>
      <span className="flex-1">{toast.message}</span>
    </div>
  );
};
