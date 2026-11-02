import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useApp } from '../../context/AppContext';

interface Props {
  initialCoords: { lat: number; lon: number; address: string; locality: string; city: string } | null;
  onClose: () => void;
  onConfirmed: () => void;
}

export const PinConfirmMapModal: React.FC<Props> = ({ initialCoords, onClose, onConfirmed }) => {
  const { setUserLocation, showToast, reverseGeocode } = useApp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [coords, setCoords] = useState(
    initialCoords || { lat: 30.9010, lon: 75.8573, address: 'Model Town, Ludhiana', locality: 'Model Town', city: 'Ludhiana' }
  );
  const [addressDisplay, setAddressDisplay] = useState(coords.address);
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [coords.lat, coords.lon],
      zoom: 16,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const pinIcon = L.divIcon({
      className: 'user-pin-marker',
      html: `
        <div style="transform: translate(-50%, -100%);">
          <div style="background: #e11d48; width: 42px; height: 42px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 8px 20px rgba(225, 29, 72, 0.45);">
            <i class="fa-solid fa-house" style="transform: rotate(45deg); color: white; font-size: 16px;"></i>
          </div>
        </div>
      `,
      iconSize: [0, 0]
    });

    const marker = L.marker([coords.lat, coords.lon], {
      icon: pinIcon,
      draggable: true
    }).addTo(map);

    marker.on('dragend', async () => {
      const pos = marker.getLatLng();
      setIsUpdatingAddress(true);
      const geo = await reverseGeocode(pos.lat, pos.lng);
      setIsUpdatingAddress(false);
      setCoords({
        lat: pos.lat,
        lon: pos.lng,
        address: geo.address,
        locality: geo.locality,
        city: geo.city
      });
      setAddressDisplay(geo.address);
    });

    map.on('click', async e => {
      marker.setLatLng(e.latlng);
      setIsUpdatingAddress(true);
      const geo = await reverseGeocode(e.latlng.lat, e.latlng.lng);
      setIsUpdatingAddress(false);
      setCoords({
        lat: e.latlng.lat,
        lon: e.latlng.lng,
        address: geo.address,
        locality: geo.locality,
        city: geo.city
      });
      setAddressDisplay(geo.address);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  const handleConfirm = () => {
    setUserLocation(coords);
    showToast(`Doorstep confirmed at ${coords.locality || coords.address}!`, 'success');
    onConfirmed();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-hidden animate-in fade-in">
      <div className="w-full max-w-xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] border border-rose-100">
        {/* Top Header */}
        <div className="px-5 py-4 bg-white border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <i className="fa-solid fa-map-location-dot"></i>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">Confirm Pin Location</h3>
              <p className="text-[11px] text-slate-500 font-medium">Drag the pin or click on map to pinpoint your exact gate</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Map Container */}
        <div className="relative w-full h-72 sm:h-80 bg-slate-100">
          <div ref={mapContainerRef} className="w-full h-full" />
          <div className="absolute top-3 left-3 z-[1000] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 shadow-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <span>Drag marker to adjust doorstep</span>
          </div>
        </div>

        {/* Bottom Address confirmation */}
        <div className="p-5 bg-white flex flex-col gap-3">
          <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-3.5 flex items-start gap-3">
            <i className="fa-solid fa-location-dot text-rose-600 text-lg mt-0.5"></i>
            <div className="flex-1">
              <span className="text-[10px] font-extrabold uppercase text-rose-600 tracking-wider">Confirmed Address</span>
              <p className="text-sm font-bold text-slate-800 leading-snug">
                {isUpdatingAddress ? 'Fetching street address...' : addressDisplay}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                GPS: {coords.lat.toFixed(5)}, {coords.lon.toFixed(5)} • {coords.city}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-3 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-extrabold py-3 rounded-2xl shadow-lg shadow-rose-500/25 active:scale-95 transition text-sm flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-check"></i>
              <span>Confirm Location & Discover Shops</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
