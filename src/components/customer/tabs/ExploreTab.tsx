import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { CATEGORIES } from '../../../data/initialData';
import { Vendor } from '../../../types';

interface Props {
  onOpenStore: (vendor: Vendor) => void;
  initialQuery?: string;
}

export const ExploreTab: React.FC<Props> = ({ onOpenStore, initialQuery = '' }) => {
  const { nearbyVendors, products, addToCart, cart } = useApp();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCat, setSelectedCat] = useState('All');

  const categories = ['All', ...Object.keys(CATEGORIES)];

  const q = searchQuery.trim().toLowerCase();

  // Matched products
  const matchedProducts = products.filter(p => {
    const matchesCat = selectedCat === 'All' || p.category.toLowerCase() === selectedCat.toLowerCase();
    const matchesText =
      !q ||
      p.product_name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);
    return matchesCat && matchesText;
  });

  // Matched vendors
  const matchedVendors = nearbyVendors.filter(v => {
    const matchesCat = selectedCat === 'All' || v.category.toLowerCase() === selectedCat.toLowerCase();
    const matchesText =
      !q ||
      v.business_name.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q) ||
      v.description.toLowerCase().includes(q);
    return matchesCat && matchesText;
  });

  const getProductCartQuantity = (productId: number) => {
    return cart.find(ci => ci.product.product_id === productId)?.quantity || 0;
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Search Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Explore Neighborhood</h2>
        <p className="text-xs text-slate-500 font-medium">Search for daily grocery essentials, medicines, fresh cakes and services</p>
      </div>

      {/* Input */}
      <div className="relative">
        <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search products or stores (e.g. Sourdough, Atta, Biryani)..."
          className="w-full bg-white border-2 border-rose-100 focus:border-rose-600 rounded-2xl pl-11 pr-4 py-3.5 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none shadow-sm transition"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
          >
            <i className="fa-solid fa-circle-xmark"></i>
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scroll">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
              selectedCat === cat
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Results */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
          <span>Products Found</span>
          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
            {matchedProducts.length}
          </span>
        </h3>

        {matchedProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-dashed border-slate-200 text-xs text-slate-400 font-medium">
            No products match "{searchQuery}" in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {matchedProducts.slice(0, 16).map(prod => {
              const vendor = nearbyVendors.find(v => v.vendor_id === prod.vendor_id);
              const qty = getProductCartQuantity(prod.product_id);

              return (
                <div
                  key={prod.product_id}
                  className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-sm flex gap-3 hover:border-rose-200 transition"
                >
                  <img
                    src={prod.image}
                    alt={prod.product_name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900 leading-tight">
                        {prod.product_name}
                      </h4>
                      {vendor && (
                        <p
                          onClick={() => onOpenStore(vendor)}
                          className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer mt-0.5 line-clamp-1"
                        >
                          {vendor.business_name} • {vendor.distance_formatted}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
                      <span className="font-black text-sm text-slate-900">₹{prod.price}</span>
                      {vendor && (
                        <button
                          onClick={() => addToCart(prod, vendor, 1)}
                          className="px-3 py-1 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white font-extrabold text-xs border border-rose-200 hover:border-transparent transition flex items-center gap-1 active:scale-95"
                        >
                          <i className="fa-solid fa-plus text-[10px]"></i>
                          <span>{qty > 0 ? `In Cart (${qty})` : 'Add'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Matched Vendors Section */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
          <span>Matching Local Stores</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
            {matchedVendors.length}
          </span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {matchedVendors.map(vendor => (
            <div
              key={vendor.vendor_id}
              onClick={() => onOpenStore(vendor)}
              className="bg-white rounded-2xl p-3 border border-slate-200/80 hover:border-rose-200 shadow-sm transition cursor-pointer flex items-center gap-3"
            >
              <img
                src={vendor.image}
                alt={vendor.business_name}
                className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="font-extrabold text-xs text-slate-900 truncate">
                    {vendor.business_name}
                  </h4>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                    ★ {vendor.rating}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">{vendor.category} • {vendor.address}</p>
                <p className="text-[11px] font-bold text-rose-600 mt-0.5">
                  <i className="fa-solid fa-person-walking mr-1"></i>
                  {vendor.time_estimate} ({vendor.distance_formatted})
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
