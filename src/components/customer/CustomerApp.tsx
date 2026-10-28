import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, Vendor } from '../../types';
import { CartDrawer } from './CartDrawer';
import { CustomerAuthModal } from './CustomerAuthModal';
import { LocationModal } from './LocationModal';
import { OrderSuccessModal } from './OrderSuccessModal';
import { PinConfirmMapModal } from './PinConfirmMapModal';
import { StoreModal } from './StoreModal';
import { ExploreTab } from './tabs/ExploreTab';
import { HomeTab } from './tabs/HomeTab';
import { MapTab } from './tabs/MapTab';
import { OrdersTab } from './tabs/OrdersTab';
import { ProfileTab } from './tabs/ProfileTab';

type CustomerNavTab = 'home' | 'explore' | 'map' | 'orders' | 'profile';

export const CustomerApp: React.FC = () => {
  const { cartItemCount } = useApp();

  const [activeTab, setActiveTab] = useState<CustomerNavTab>('home');
  const [selectedVendorForStore, setSelectedVendorForStore] = useState<Vendor | null>(null);
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isPinConfirmOpen, setIsPinConfirmOpen] = useState(false);
  const [pinConfirmCoords, setPinConfirmCoords] = useState<{ lat: number; lon: number; address: string; locality: string; city: string } | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [recentOrderSuccess, setRecentOrderSuccess] = useState<Order | null>(null);
  const [exploreQuery, setExploreQuery] = useState('');

  const handleOpenStore = (vendor: Vendor) => {
    setSelectedVendorForStore(vendor);
    setIsStoreOpen(true);
  };

  const handleOpenPinConfirm = (coords: { lat: number; lon: number; address: string; locality: string; city: string }) => {
    setIsLocationModalOpen(false);
    setPinConfirmCoords(coords);
    setIsPinConfirmOpen(true);
  };

  const handleGoToExplore = (query = '') => {
    setExploreQuery(query);
    setActiveTab('explore');
  };

  return (
    <div className="min-h-screen bg-[#fdf8f8] flex flex-col justify-between">
      {/* Main Screen Content Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 pt-5 pb-6">
        {activeTab === 'home' && (
          <HomeTab
            onOpenStore={handleOpenStore}
            onOpenLocationChange={() => setIsLocationModalOpen(true)}
            onGoToExplore={handleGoToExplore}
          />
        )}

        {activeTab === 'explore' && (
          <ExploreTab onOpenStore={handleOpenStore} initialQuery={exploreQuery} />
        )}

        {activeTab === 'map' && <MapTab onOpenStore={handleOpenStore} />}

        {activeTab === 'orders' && <OrdersTab />}

        {activeTab === 'profile' && (
          <ProfileTab
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onOpenLocationChange={() => setIsLocationModalOpen(true)}
          />
        )}
      </main>

      {/* Persistent Bottom Floating Cart Pill if Cart has items */}
      {cartItemCount > 0 && !isCartOpen && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-slate-950 hover:bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl flex items-center justify-between border border-slate-800 transition active:scale-95 animate-in slide-in-from-bottom-3"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-rose-600 text-white font-black text-xs flex items-center justify-center">
                {cartItemCount}
              </span>
              <span className="text-xs font-bold">Items in Cart</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-black text-rose-400">
              <span>View Cart</span>
              <i className="fa-solid fa-arrow-right"></i>
            </div>
          </button>
        </div>
      )}

      {/* Bottom Sticky Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-2 max-w-lg mx-auto sm:rounded-t-3xl shadow-lg">
        <div className="flex items-center justify-around">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition ${
              activeTab === 'home' ? 'text-rose-600 font-extrabold' : 'text-slate-400 hover:text-slate-700 font-medium'
            }`}
          >
            <i className={`fa-solid fa-house text-base ${activeTab === 'home' ? 'scale-110' : ''}`}></i>
            <span className="text-[10px]">Home</span>
          </button>

          <button
            onClick={() => setActiveTab('explore')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition ${
              activeTab === 'explore' ? 'text-rose-600 font-extrabold' : 'text-slate-400 hover:text-slate-700 font-medium'
            }`}
          >
            <i className={`fa-solid fa-compass text-base ${activeTab === 'explore' ? 'scale-110' : ''}`}></i>
            <span className="text-[10px]">Explore</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition ${
              activeTab === 'map' ? 'text-rose-600 font-extrabold' : 'text-slate-400 hover:text-slate-700 font-medium'
            }`}
          >
            <i className={`fa-solid fa-map-location-dot text-base ${activeTab === 'map' ? 'scale-110' : ''}`}></i>
            <span className="text-[10px]">Map</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition relative ${
              activeTab === 'orders' ? 'text-rose-600 font-extrabold' : 'text-slate-400 hover:text-slate-700 font-medium'
            }`}
          >
            <i className={`fa-solid fa-receipt text-base ${activeTab === 'orders' ? 'scale-110' : ''}`}></i>
            <span className="text-[10px]">Orders</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition ${
              activeTab === 'profile' ? 'text-rose-600 font-extrabold' : 'text-slate-400 hover:text-slate-700 font-medium'
            }`}
          >
            <i className={`fa-solid fa-user text-base ${activeTab === 'profile' ? 'scale-110' : ''}`}></i>
            <span className="text-[10px]">Profile</span>
          </button>
        </div>
      </nav>

      {/* Modals & Drawers */}
      <StoreModal
        vendor={selectedVendorForStore}
        isOpen={isStoreOpen}
        onClose={() => setIsStoreOpen(false)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderSuccess={order => setRecentOrderSuccess(order)}
        onOpenLocationChange={() => setIsLocationModalOpen(true)}
      />

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onOpenPinConfirm={handleOpenPinConfirm}
      />

      {isPinConfirmOpen && (
        <PinConfirmMapModal
          initialCoords={pinConfirmCoords}
          onClose={() => setIsPinConfirmOpen(false)}
          onConfirmed={() => setIsPinConfirmOpen(false)}
        />
      )}

      <CustomerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <OrderSuccessModal
        order={recentOrderSuccess}
        onClose={() => setRecentOrderSuccess(null)}
        onViewOrders={() => {
          setRecentOrderSuccess(null);
          setActiveTab('orders');
        }}
      />
    </div>
  );
};
