import React from 'react';
import { useApp } from '../../../context/AppContext';

interface Props {
  onOpenAuth: () => void;
  onOpenLocationChange: () => void;
}

export const ProfileTab: React.FC<Props> = ({ onOpenAuth, onOpenLocationChange }) => {
  const { currentUser, setCurrentUser, userLocation, setActiveRole, resetDemoData, showToast } = useApp();

  const handleLogout = () => {
    setCurrentUser(null);
    showToast('Signed out of customer account', 'info');
  };

  return (
    <div className="space-y-6 pb-24 max-w-xl mx-auto">
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Your Profile</h2>
        <p className="text-xs text-slate-500 font-medium">Manage preferences, delivery locations & role</p>
      </div>

      {/* Account Info Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center text-xl font-black shadow-md shadow-rose-500/25">
            {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 leading-tight">
              {currentUser?.name || 'Guest Shopper'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">{currentUser?.email || 'No email attached'}</p>
            {currentUser?.phone && (
              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                +91 {currentUser.phone}
              </span>
            )}
          </div>
        </div>

        {currentUser ? (
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs transition"
          >
            Sign Out
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-sm"
          >
            Sign In
          </button>
        )}
      </div>

      {/* Saved Delivery Doorstep */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
            <i className="fa-solid fa-house-chimney text-rose-600"></i> Current Delivery Doorstep
          </span>
          <button
            onClick={onOpenLocationChange}
            className="text-xs font-bold text-rose-600 hover:underline"
          >
            Edit Pin
          </button>
        </div>

        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 flex items-start gap-3">
          <i className="fa-solid fa-map-pin text-rose-600 text-base mt-0.5"></i>
          <div>
            <p className="text-xs font-bold text-slate-800">{userLocation.address}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Lat: {userLocation.lat.toFixed(4)}, Lon: {userLocation.lon.toFixed(4)} • {userLocation.city}
            </p>
          </div>
        </div>
      </div>

      {/* Role Navigation Portal */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
        <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
          LocalLift Governance & Business Portals
        </h4>

        <div className="space-y-2">
          <button
            onClick={() => setActiveRole('vendor')}
            className="w-full bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 p-3.5 rounded-2xl flex items-center justify-between transition text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-sm shadow-sm">
                <i className="fa-solid fa-store"></i>
              </div>
              <div>
                <h5 className="font-extrabold text-xs text-slate-900 group-hover:text-indigo-700">
                  Switch to Vendor Partner Portal
                </h5>
                <p className="text-[11px] text-slate-400">Manage orders, product catalog, AI tools and store offers</p>
              </div>
            </div>
            <i className="fa-solid fa-chevron-right text-xs text-slate-400 group-hover:text-indigo-600"></i>
          </button>

          <button
            onClick={() => setActiveRole('admin')}
            className="w-full bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 p-3.5 rounded-2xl flex items-center justify-between transition text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center text-sm shadow-sm">
                <i className="fa-solid fa-shield-halved text-rose-400"></i>
              </div>
              <div>
                <h5 className="font-extrabold text-xs text-slate-900 group-hover:text-rose-700">
                  Switch to Admin Control Center
                </h5>
                <p className="text-[11px] text-slate-400">Review vendor applications, govern catalog & monitor GMV</p>
              </div>
            </div>
            <i className="fa-solid fa-chevron-right text-xs text-slate-400 group-hover:text-rose-600"></i>
          </button>
        </div>
      </div>

      {/* Social Mission */}
      <div className="bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 rounded-3xl p-5 border border-rose-200 text-center space-y-2">
        <span className="text-xl">🌿</span>
        <h4 className="font-black text-sm text-slate-900">Why LocalLift?</h4>
        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          "Every ₹100 spent at a local shop keeps ₹68 in the neighborhood economy. Giant aggregators charge 25–35% commission. LocalLift charges 0%."
        </p>
        <button
          onClick={resetDemoData}
          className="mt-2 text-xs font-bold text-rose-700 hover:underline"
        >
          Reset Demo Data to Factory Defaults
        </button>
      </div>
    </div>
  );
};
