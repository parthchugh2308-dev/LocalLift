import React from 'react';
import { useApp } from '../context/AppContext';

export const RoleSwitcher: React.FC = () => {
  const { activeRole, setActiveRole, resetDemoData } = useApp();

  return (
    <div className="bg-slate-950 text-white text-xs px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 z-50 sticky top-0 shadow-md">
      <div className="flex items-center gap-2 font-bold">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        <span className="text-slate-400">LocalLift Role Switcher:</span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setActiveRole('customer')}
          className={`px-3 py-1.5 rounded-lg transition font-bold flex items-center gap-1.5 text-xs ${
            activeRole === 'customer'
              ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-sm'
              : 'bg-slate-900 hover:bg-rose-600 hover:text-white text-slate-300 border border-slate-800'
          }`}
        >
          <i className="fa-solid fa-basket-shopping text-rose-300"></i>
          <span>Customer App</span>
        </button>

        <button
          onClick={() => setActiveRole('vendor')}
          className={`px-3 py-1.5 rounded-lg transition font-bold flex items-center gap-1.5 text-xs ${
            activeRole === 'vendor'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
              : 'bg-slate-900 hover:bg-indigo-600 hover:text-white text-slate-300 border border-slate-800'
          }`}
        >
          <i className="fa-solid fa-store text-indigo-300"></i>
          <span>Vendor Portal</span>
        </button>

        <button
          onClick={() => setActiveRole('admin')}
          className={`px-3 py-1.5 rounded-lg transition font-bold flex items-center gap-1.5 text-xs ${
            activeRole === 'admin'
              ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white border border-rose-500/50 shadow-sm'
              : 'bg-slate-900 hover:bg-slate-800 hover:text-white text-slate-300 border border-slate-800'
          }`}
        >
          <i className="fa-solid fa-shield-halved text-rose-400"></i>
          <span>Admin Center</span>
        </button>

        <button
          onClick={resetDemoData}
          title="Reset to sample data"
          className="ml-2 px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-[11px] font-semibold flex items-center gap-1"
        >
          <i className="fa-solid fa-rotate-right text-[10px]"></i>
          <span>Reset Demo</span>
        </button>
      </div>
    </div>
  );
};
