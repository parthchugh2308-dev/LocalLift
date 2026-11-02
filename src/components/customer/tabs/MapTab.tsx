import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useApp } from '../../../context/AppContext';
import { CATEGORIES } from '../../../data/initialData';
import { Vendor } from '../../../types';

interface Props {
  onOpenStore: (vendor: Vendor) => void;
}

export const MapTab: React.FC<Props> = ({ onOpenStore }) => {
  const { userLocation, nearbyVendors } = useApp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [userLocation.lat, userLocation.lon],
      zoom: 15,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // User's location pulsing marker
    const userIcon = L.divIcon({
      className: 'user-gps-marker',
      html: `
        <div style="transform: translate(-50%, -50%);">
          <div class="user-gps-dot"></div>
        </div>
      `,
      iconSize: [0, 0]
    });

    L.marker([userLocation.lat, userLocation.lon], { icon: userIcon })
      .bindPopup(`<b>Your Doorstep Location</b><br/>${userLocation.locality}`)
      .addTo(map);

    // Add pins for all nearby vendors
    nearbyVendors.forEach(vendor => {
      const catMeta = CATEGORIES[vendor.category] || CATEGORIES['Grocery'];
      const pinColor = vendor.category === 'Bakery' ? '#d97706' : vendor.category === 'Grocery' ? '#059669' : '#e11d48';

      const shopIcon = L.divIcon({
        className: 'shop-marker',
        html: `
          <div style="transform: translate(-50%, -100%);">
            <div style="background: ${pinColor}; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3); cursor: pointer;">
              <i class="fa-solid ${catMeta.icon}" style="transform: rotate(45deg); color: white; font-size: 13px;"></i>
            </div>
          </div>
        `,
        iconSize: [0, 0]
      });

      const marker = L.marker([vendor.latitude, vendor.longitude], { icon: shopIcon }).addTo(map);
      marker.on('click', () => {
        setSelectedVendor(vendor);
        map.panTo([vendor.latitude, vendor.longitude]);
      });
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [userLocation, nearbyVendors]);

  const handleCenterUser = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lon], 16);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-140px)] rounded-3xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100 mb-20">
      {/* Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top Floating Controls */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex items-center justify-between pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-200/80 text-xs font-bold text-slate-800 shadow-md flex items-center gap-2 pointer-events-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
          <span>{nearbyVendors.length} Verified Stores Around You</span>
        </div>

        <button
          onClick={handleCenterUser}
          className="w-10 h-10 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 text-slate-700 hover:text-rose-600 shadow-md flex items-center justify-center transition active:scale-95 pointer-events-auto"
          title="Center on my doorstep"
        >
          <i className="fa-solid fa-location-crosshairs text-base"></i>
        </button>
      </div>

      {/* Selected Store Card Popup */}
      {selectedVendor && (
        <div className="absolute bottom-6 left-4 right-4 z-[1000] max-w-md mx-auto bg-white rounded-3xl p-4 shadow-2xl border border-rose-200 flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-200">
          <img
            src={selectedVendor.image}
            alt={selectedVendor.business_name}
            className="w-20 h-20 rounded-2xl object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-black uppercase text-rose-600 tracking-wider">
                {selectedVendor.category}
              </span>
              <span className="text-[11px] font-bold text-amber-500 flex items-center gap-0.5">
                <i className="fa-solid fa-star text-[10px]"></i> {selectedVendor.rating}
              </span>
            </div>
            <h4 className="font-extrabold text-sm text-slate-900 truncate">
              {selectedVendor.business_name}
            </h4>
            <p className="text-xs text-slate-500 font-medium">
              <i className="fa-solid fa-person-walking mr-1 text-rose-500"></i>
              {selectedVendor.time_estimate} ({selectedVendor.distance_formatted})
            </p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => onOpenStore(selectedVendor)}
                className="flex-1 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-extrabold text-xs active:scale-95 shadow-sm"
              >
                Open Store Menu →
              </button>
              <button
                onClick={() => setSelectedVendor(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
