import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { CATEGORIES } from '../../../data/initialData';
import { Vendor } from '../../../types';

interface Props {
  onOpenStore: (vendor: Vendor) => void;
  onOpenLocationChange: () => void;
  onGoToExplore: (initialQuery?: string) => void;
}

const DISTANCE_CHIPS = [
  { label: 'All Distances', maxKm: 15.0 },
  { label: 'Within 500m', maxKm: 0.5 },
  { label: '1 km', maxKm: 1.0 },
  { label: '2 km', maxKm: 2.0 },
  { label: '5 km', maxKm: 5.0 }
];

export const HomeTab: React.FC<Props> = ({ onOpenStore, onOpenLocationChange, onGoToExplore }) => {
  const { userLocation, nearbyVendors, offers } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDistanceKm, setSelectedDistanceKm] = useState<number>(15.0);
  const [quickSearch, setQuickSearch] = useState('');

  const categoryKeys = Object.keys(CATEGORIES);

  // Filter vendors by category and distance
  const filteredVendors = nearbyVendors.filter(vendor => {
    const matchesCategory = selectedCategory === 'All' || vendor.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesDistance = (vendor.distance_km || 0) <= selectedDistanceKm;
    const matchesSearch =
      !quickSearch.trim() ||
      vendor.business_name.toLowerCase().includes(quickSearch.toLowerCase()) ||
      vendor.category.toLowerCase().includes(quickSearch.toLowerCase());

    return matchesCategory && matchesDistance && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-24">
      {/* Top Delivery Header Banner */}
      <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-pink-600 text-white p-4 sm:p-5 rounded-3xl shadow-xl shadow-rose-500/20 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-lg">
            <i className="fa-solid fa-location-dot"></i>
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-100 flex items-center gap-1">
              <span>Doorstep Delivery Area</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </span>
            <h2 className="text-sm sm:text-base font-extrabold truncate max-w-xs sm:max-w-md">
              {userLocation.locality || 'Local Market'}, {userLocation.city}
            </h2>
          </div>
        </div>

        <button
          onClick={onOpenLocationChange}
          className="px-3.5 py-1.5 rounded-xl bg-white text-rose-600 hover:bg-rose-50 font-black text-xs shadow-sm transition active:scale-95 flex items-center gap-1.5"
        >
          <i className="fa-solid fa-pen-to-square text-[11px]"></i>
          <span>Change Location</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
        <input
          type="text"
          value={quickSearch}
          onChange={e => setQuickSearch(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && quickSearch.trim()) {
              onGoToExplore(quickSearch.trim());
            }
          }}
          placeholder="Search neighborhood shops, bakery treats, medicines, dal..."
          className="w-full bg-white border-2 border-rose-100 focus:border-rose-600 rounded-2xl pl-11 pr-4 py-3.5 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none shadow-sm transition"
        />
        {quickSearch && (
          <button
            onClick={() => setQuickSearch('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
          >
            <i className="fa-solid fa-circle-xmark"></i>
          </button>
        )}
      </div>

      {/* Promotional Offers Carousel */}
      {offers.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <i className="fa-solid fa-bolt text-rose-600"></i>
              <span>Live Neighborhood Deals</span>
            </h3>
            <span className="text-[11px] font-bold text-rose-600">Zero Commission Savings</span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 hide-scroll -mx-4 px-4 sm:mx-0 sm:px-0">
            {offers.map(offer => {
              const vendor = nearbyVendors.find(v => v.vendor_id === offer.vendor_id);
              return (
                <div
                  key={offer.offer_id}
                  onClick={() => vendor && onOpenStore(vendor)}
                  className="flex-shrink-0 w-72 sm:w-80 bg-gradient-to-br from-rose-600 via-rose-500 to-pink-600 rounded-3xl p-4 text-white shadow-lg shadow-rose-500/20 cursor-pointer hover:scale-[1.02] transition transform flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <span className="bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-white/20">
                      {offer.discount}
                    </span>
                    <span className="text-[11px] font-bold text-rose-100">
                      {offer.business_name}
                    </span>
                  </div>

                  <div className="my-3">
                    <h4 className="font-black text-sm sm:text-base leading-snug">{offer.title}</h4>
                    <p className="text-xs text-rose-100 mt-1 line-clamp-1">{offer.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-white/20">
                    <span className="text-rose-100 text-[11px]">Tap to view offer</span>
                    <i className="fa-solid fa-arrow-right text-[11px]"></i>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 16 Marketplace Categories Carousel */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
            <i className="fa-solid fa-layer-group text-rose-600"></i>
            <span>All 16 Local Categories</span>
          </h3>
          {selectedCategory !== 'All' && (
            <button
              onClick={() => setSelectedCategory('All')}
              className="text-xs font-bold text-rose-600 hover:underline"
            >
              Reset Category
            </button>
          )}
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 hide-scroll -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`flex flex-col items-center gap-1.5 flex-shrink-0 p-2 rounded-2xl transition ${
              selectedCategory === 'All' ? 'bg-rose-50 scale-105' : 'hover:bg-slate-100'
            }`}
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg shadow-sm ${
                selectedCategory === 'All'
                  ? 'bg-rose-600 text-white'
                  : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              <i className="fa-solid fa-store"></i>
            </div>
            <span
              className={`text-[11px] font-bold tracking-tight text-center ${
                selectedCategory === 'All' ? 'text-rose-600' : 'text-slate-600'
              }`}
            >
              All Shops
            </span>
          </button>

          {categoryKeys.map(catKey => {
            const cat = CATEGORIES[catKey];
            const isSelected = selectedCategory === catKey;
            return (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`flex flex-col items-center gap-1.5 flex-shrink-0 p-2 rounded-2xl transition ${
                  isSelected ? 'bg-rose-50 scale-105' : 'hover:bg-slate-100'
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg shadow-sm ${
                    isSelected
                      ? 'bg-rose-600 text-white'
                      : `${cat.color} text-white`
                  }`}
                >
                  <i className={`fa-solid ${cat.icon}`}></i>
                </div>
                <span
                  className={`text-[11px] font-bold tracking-tight text-center max-w-[65px] truncate ${
                    isSelected ? 'text-rose-600' : 'text-slate-600'
                  }`}
                >
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Distance Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scroll">
        <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider mr-1 flex-shrink-0">
          Radius:
        </span>
        {DISTANCE_CHIPS.map(chip => (
          <button
            key={chip.label}
            onClick={() => setSelectedDistanceKm(chip.maxKm)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
              selectedDistanceKm === chip.maxKm
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Nearby Shops List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-base sm:text-lg text-slate-900 tracking-tight">
              Verified Shops Near You ({filteredVendors.length})
            </h3>
            <p className="text-xs text-slate-500 font-medium">Sorted strictly by walking distance</p>
          </div>
        </div>

        {filteredVendors.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-rose-200 space-y-3">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500">
              <i className="fa-solid fa-shop-slash text-2xl"></i>
            </div>
            <h4 className="font-extrabold text-slate-800">No shops found matching filters</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try expanding your distance filter or selecting "All Shops" to see all verified businesses in your city.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedDistanceKm(15.0);
                setQuickSearch('');
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredVendors.map(vendor => (
              <div
                key={vendor.vendor_id}
                onClick={() => onOpenStore(vendor)}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 hover:border-rose-300 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col group"
              >
                {/* Image & Badges */}
                <div className="relative h-40 w-full overflow-hidden">
                  <img
                    src={vendor.image}
                    alt={vendor.business_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />

                  {/* Top tags */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white font-extrabold text-[10px] uppercase tracking-wider border border-white/20">
                      {vendor.category}
                    </span>

                    <span className="px-2.5 py-1 rounded-full bg-white/95 text-slate-900 font-extrabold text-[11px] flex items-center gap-1 shadow-sm">
                      <i className="fa-solid fa-star text-amber-500 text-[10px]"></i>
                      <span>{vendor.rating}</span>
                    </span>
                  </div>

                  {/* Distance & Time badge */}
                  <div className="absolute bottom-3 left-3 text-white flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-rose-600/95 font-black text-xs flex items-center gap-1 shadow-sm">
                      <i className="fa-solid fa-person-walking text-[11px]"></i>
                      <span>{vendor.time_estimate || '5 min walk'}</span>
                    </span>
                    <span className="text-xs text-rose-100 font-bold drop-shadow">
                      {vendor.distance_formatted || `${vendor.distance_km} km`}
                    </span>
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-rose-600 transition leading-snug">
                        {vendor.business_name}
                      </h4>
                      {vendor.is_open ? (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex-shrink-0">
                          Open
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full flex-shrink-0">
                          Closed
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1 font-medium">
                      {vendor.address}, {vendor.city}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      {vendor.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400">
                      <i className="fa-solid fa-clock mr-1"></i> {vendor.opening_hours} - {vendor.closing_time}
                    </span>
                    <span className="text-xs font-black text-rose-600 group-hover:translate-x-0.5 transition flex items-center gap-1">
                      <span>Enter Store</span>
                      <i className="fa-solid fa-arrow-right text-[10px]"></i>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
