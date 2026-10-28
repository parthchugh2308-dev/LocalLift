import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenPinConfirm: (coords: { lat: number; lon: number; address: string; locality: string; city: string }) => void;
}

const PRESET_SPOTS = [
  { name: 'Model Town Ludhiana', lat: 30.9010, lon: 75.8573, addr: 'Model Town Market, Ludhiana, Punjab' },
  { name: 'Connaught Place', lat: 28.6304, lon: 77.2177, addr: 'Connaught Place, New Delhi, Delhi' },
  { name: 'Indiranagar', lat: 12.9784, lon: 77.6408, addr: 'Indiranagar 100ft Rd, Bengaluru, Karnataka' },
  { name: 'Bandra West', lat: 19.0596, lon: 72.8295, addr: 'Hill Road, Bandra West, Mumbai, Maharashtra' },
  { name: 'Sector 18 Noida', lat: 28.5708, lon: 77.3261, addr: 'Atta Market, Sector 18, Noida, Uttar Pradesh' }
];

export const LocationModal: React.FC<Props> = ({ isOpen, onClose, onOpenPinConfirm }) => {
  const { setUserLocation, showToast, reverseGeocode, geocodeQuery } = useApp();
  const [isLocating, setIsLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  if (!isOpen) return null;

  const handleUseLiveGPS = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'error');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const geoInfo = await reverseGeocode(lat, lon);
        setIsLocating(false);
        onOpenPinConfirm({
          lat,
          lon,
          address: geoInfo.address,
          locality: geoInfo.locality,
          city: geoInfo.city
        });
      },
      err => {
        console.warn('GPS error, using default location:', err);
        setIsLocating(false);
        showToast('Could not access GPS. Please choose a preset or search below.', 'info');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    const result = await geocodeQuery(searchQuery);
    setIsSearching(false);

    if (result) {
      const geoInfo = await reverseGeocode(result.lat, result.lon);
      onOpenPinConfirm({
        lat: result.lat,
        lon: result.lon,
        address: geoInfo.address,
        locality: geoInfo.locality,
        city: geoInfo.city
      });
    } else {
      showToast('Could not locate that address. Try popular neighborhoods below.', 'error');
    }
  };

  const handleSelectPreset = async (spot: typeof PRESET_SPOTS[0]) => {
    const geoInfo = await reverseGeocode(spot.lat, spot.lon);
    setUserLocation({
      lat: spot.lat,
      lon: spot.lon,
      address: spot.addr,
      locality: spot.name,
      city: spot.addr.split(',').slice(-2, -1)[0]?.trim() || 'Local City'
    });
    showToast(`Location set to ${spot.name}! Finding nearby shops...`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-rose-200/60 shadow-inner">
            <i className="fa-solid fa-location-dot text-rose-600 text-2xl animate-bounce"></i>
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Where should we deliver?</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">We find verified local shops within 500m – 5km of your exact doorstep.</p>
        </div>

        <div className="flex flex-col gap-3.5">
          <button
            onClick={handleUseLiveGPS}
            disabled={isLocating}
            className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition shadow-lg shadow-rose-500/25"
          >
            <i className={`fa-solid ${isLocating ? 'fa-spinner fa-spin' : 'fa-location-crosshairs text-lg'}`}></i>
            <span>{isLocating ? 'Detecting GPS Satellite...' : 'Use My Exact Live Location'}</span>
          </button>

          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search colony, street or landmark..."
              className="flex-1 bg-white border-2 border-rose-100 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-rose-600"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="bg-slate-900 hover:bg-slate-800 text-white px-5 rounded-2xl font-bold text-xs active:scale-95 transition flex items-center gap-1.5"
            >
              {isSearching ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-magnifying-glass"></i>}
              <span>Find</span>
            </button>
          </form>
        </div>

        <div className="mt-6 pt-5 border-t border-rose-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Popular Neighborhoods:</p>
          <div className="flex flex-wrap gap-2">
            {PRESET_SPOTS.map(spot => (
              <button
                key={spot.name}
                onClick={() => handleSelectPreset(spot)}
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 font-bold text-xs active:scale-95 transition flex items-center gap-1.5"
              >
                <i className="fa-solid fa-map-pin text-[10px]"></i>
                <span>{spot.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
