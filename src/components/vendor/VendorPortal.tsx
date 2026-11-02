import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { AddProductModal } from './AddProductModal';
import { AICatalogModal } from './AICatalogModal';
import { CreateOfferModal } from './CreateOfferModal';
import { VendorAuth } from './VendorAuth';

type VendorTab = 'dashboard' | 'products' | 'orders' | 'promotions' | 'settings';

export const VendorPortal: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    currentVendor,
    setCurrentVendor,
    vendors,
    products,
    orders,
    offers,
    updateOrderStatus,
    toggleProductStock,
    deleteProduct,
    deleteOffer,
    updateVendorDetails,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<VendorTab>('dashboard');
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isCreateOfferOpen, setIsCreateOfferOpen] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'preparing' | 'delivered'>('all');

  // Store settings form state
  const [editName, setEditName] = useState(currentVendor?.business_name || '');
  const [editOwner, setEditOwner] = useState(currentVendor?.owner_name || '');
  const [editPhone, setEditPhone] = useState(currentVendor?.phone || '');
  const [editAddress, setEditAddress] = useState(currentVendor?.address || '');
  const [editOpenHours, setEditOpenHours] = useState(currentVendor?.opening_hours || '8:00 AM');
  const [editCloseHours, setEditCloseHours] = useState(currentVendor?.closing_time || '9:30 PM');
  const [editDesc, setEditDesc] = useState(currentVendor?.description || '');

  // If not logged in as vendor, show VendorAuth
  if (!currentUser || currentUser.user_type !== 'vendor' || !currentVendor) {
    return <VendorAuth />;
  }

  // Active vendor data
  const vendor = currentVendor;
  const vendorProducts = products.filter(p => p.vendor_id === vendor.vendor_id);
  const vendorOrders = orders.filter(o => o.vendor_id === vendor.vendor_id);
  const vendorOffers = offers.filter(o => o.vendor_id === vendor.vendor_id);

  // Key metrics
  const totalRevenue = vendorOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total_amount, 0);

  const pendingOrders = vendorOrders.filter(o => o.status === 'pending');

  const filteredOrders =
    orderStatusFilter === 'all'
      ? vendorOrders
      : vendorOrders.filter(o => o.status === orderStatusFilter);

  const handleToggleStoreOpen = () => {
    const nextStatus = !vendor.is_open;
    updateVendorDetails(vendor.vendor_id, { is_open: nextStatus });
    showToast(`Store is now ${nextStatus ? 'OPEN to customers' : 'CLOSED'}`, 'info');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateVendorDetails(vendor.vendor_id, {
      business_name: editName,
      owner_name: editOwner,
      phone: editPhone,
      address: editAddress,
      opening_hours: editOpenHours,
      closing_time: editCloseHours,
      description: editDesc
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentVendor(null);
    showToast('Signed out of Vendor Portal', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Vendor Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-9 z-30 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-lg font-black shadow-md shadow-indigo-600/20">
            <i className="fa-solid fa-store"></i>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-base sm:text-lg text-slate-900 leading-tight">
                {vendor.business_name}
              </h1>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                vendor.status === 'approved'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {vendor.status === 'approved' ? 'Verified Store' : 'Pending Approval'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {vendor.category} • {vendor.address}, {vendor.city}
            </p>
          </div>
        </div>

        {/* Store Open/Close Toggle & Actions */}
        <div className="flex items-center gap-3">
          {/* Status Switcher */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <span className={`text-xs font-bold px-2 py-1 rounded-xl transition ${
              vendor.is_open ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500'
            }`}>
              Open
            </span>
            <button
              onClick={handleToggleStoreOpen}
              className={`w-11 h-6 rounded-full transition-colors p-0.5 relative ${
                vendor.is_open ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  vendor.is_open ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-xs font-bold px-2 py-1 rounded-xl transition ${
              !vendor.is_open ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500'
            }`}>
              Closed
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-slate-50 font-bold text-xs transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Tab Navigation */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 overflow-x-auto hide-scroll flex gap-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`py-3 px-3.5 font-extrabold text-xs transition border-b-2 flex items-center gap-1.5 flex-shrink-0 ${
            activeTab === 'dashboard'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <i className="fa-solid fa-chart-line"></i>
          <span>Dashboard & Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`py-3 px-3.5 font-extrabold text-xs transition border-b-2 flex items-center gap-1.5 flex-shrink-0 ${
            activeTab === 'products'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <i className="fa-solid fa-boxes-stacked"></i>
          <span>Catalog & Stock ({vendorProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`py-3 px-3.5 font-extrabold text-xs transition border-b-2 flex items-center gap-1.5 flex-shrink-0 ${
            activeTab === 'orders'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <i className="fa-solid fa-bell"></i>
          <span>Live Orders ({vendorOrders.length})</span>
          {pendingOrders.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center">
              {pendingOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('promotions')}
          className={`py-3 px-3.5 font-extrabold text-xs transition border-b-2 flex items-center gap-1.5 flex-shrink-0 ${
            activeTab === 'promotions'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <i className="fa-solid fa-tags"></i>
          <span>Deals & Offers ({vendorOffers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`py-3 px-3.5 font-extrabold text-xs transition border-b-2 flex items-center gap-1.5 flex-shrink-0 ${
            activeTab === 'settings'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <i className="fa-solid fa-gear"></i>
          <span>Store Settings</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Pending Approval Notice if applicable */}
        {vendor.status === 'pending' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <i className="fa-solid fa-triangle-exclamation text-amber-600 text-lg mt-0.5"></i>
            <div>
              <h4 className="font-extrabold text-xs text-amber-900">Application Under Admin Review</h4>
              <p className="text-xs text-amber-800 mt-0.5 font-medium">
                Your shop application is pending Admin verification. Switch to the <strong>Admin Control Center</strong> above to approve this store with 1-click!
              </p>
            </div>
          </div>
        )}

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* 4 Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Total Catalog Items
                </span>
                <p className="text-2xl sm:text-3xl font-black text-slate-900">{vendorProducts.length}</p>
                <span className="text-[11px] text-emerald-600 font-bold">
                  {vendorProducts.filter(p => p.availability === 1).length} in stock
                </span>
              </div>

              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Total Orders
                </span>
                <p className="text-2xl sm:text-3xl font-black text-indigo-600">{vendorOrders.length}</p>
                <span className="text-[11px] text-indigo-500 font-bold">
                  {pendingOrders.length} pending action
                </span>
              </div>

              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Gross Sales (₹)
                </span>
                <p className="text-2xl sm:text-3xl font-black text-emerald-600">₹{totalRevenue}</p>
                <span className="text-[11px] text-emerald-500 font-bold">
                  0% Commission Charged
                </span>
              </div>

              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Store Rating
                </span>
                <p className="text-2xl sm:text-3xl font-black text-amber-500 flex items-center gap-1">
                  <span>★</span>
                  <span>{vendor.rating}</span>
                </p>
                <span className="text-[11px] text-slate-400 font-bold">
                  {vendorOffers.length} Active Deals
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                  <span>Store Superpowers</span>
                  <span className="text-xs bg-indigo-500/30 border border-indigo-400/30 px-2 py-0.5 rounded-full text-indigo-200">
                    AI Enabled
                  </span>
                </h3>
                <p className="text-xs text-indigo-200 font-medium">
                  Add products, generate intelligent menus with Gemini, or announce neighborhood deals.
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={() => setIsAIModalOpen(true)}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs shadow-lg active:scale-95 transition flex items-center gap-2"
                >
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                  <span>AI Catalog Generator</span>
                </button>

                <button
                  onClick={() => {
                    setProductToEdit(null);
                    setIsAddProductOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-black text-xs shadow-md active:scale-95 transition flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-plus"></i>
                  <span>Add Product</span>
                </button>

                <button
                  onClick={() => setIsCreateOfferOpen(true)}
                  className="px-4 py-2.5 rounded-2xl bg-indigo-800 hover:bg-indigo-700 text-white border border-indigo-600 font-black text-xs transition flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-tags"></i>
                  <span>Launch Deal</span>
                </button>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-base text-slate-900">Recent Customer Orders</h3>
                  <p className="text-xs text-slate-500">Live neighborhood transactions</p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  View All Orders ({vendorOrders.length}) →
                </button>
              </div>

              {vendorOrders.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs font-medium">
                  No orders received yet. Once customers order from your storefront, they appear here instantly!
                </div>
              ) : (
                <div className="space-y-3">
                  {vendorOrders.slice(0, 5).map(order => (
                    <div
                      key={order.order_id}
                      className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-slate-900">
                            #{order.order_id} • {order.customer_name}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 uppercase">
                            {order.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {order.items.map(it => `${it.quantity}x ${it.product_name}`).join(', ')}
                        </p>
                        <p className="text-[10px] text-slate-400">{order.created_at} • {order.delivery_address}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-slate-900 mr-2">₹{order.total_amount}</span>

                        {order.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateOrderStatus(order.order_id, 'confirmed')}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs active:scale-95 transition"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => updateOrderStatus(order.order_id, 'cancelled')}
                              className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs transition"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {order.status === 'confirmed' && (
                          <button
                            onClick={() => updateOrderStatus(order.order_id, 'preparing')}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                          >
                            Mark Preparing
                          </button>
                        )}

                        {order.status === 'preparing' && (
                          <button
                            onClick={() => updateOrderStatus(order.order_id, 'delivered')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                          >
                            Mark Delivered
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-lg text-slate-900">Product Catalog Management</h3>
                <p className="text-xs text-slate-500">Toggle instant stock availability or add new items</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAIModalOpen(true)}
                  className="px-3.5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-sm flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                  <span>AI Catalog Generator</span>
                </button>

                <button
                  onClick={() => {
                    setProductToEdit(null);
                    setIsAddProductOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-plus"></i>
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            {vendorProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-slate-200">
                <p className="text-xs text-slate-500 font-bold mb-3">No products in your catalog yet</p>
                <button
                  onClick={() => setIsAIModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs"
                >
                  Generate with Gemini AI
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {vendorProducts.map(product => (
                  <div
                    key={product.product_id}
                    className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm flex gap-3 hover:border-indigo-200 transition"
                  >
                    <img
                      src={product.image}
                      alt={product.product_name}
                      className="w-20 h-20 rounded-2xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-extrabold text-xs text-slate-900 leading-snug">
                            {product.product_name}
                          </h4>
                          <span className="font-black text-sm text-slate-900">₹{product.price}</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {product.category}
                        </span>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{product.description}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        {/* In Stock toggle */}
                        <button
                          onClick={() => toggleProductStock(product.product_id)}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition ${
                            product.availability === 1
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${product.availability === 1 ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                          <span>{product.availability === 1 ? 'In Stock' : 'Out of Stock'}</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setProductToEdit(product);
                              setIsAddProductOpen(true);
                            }}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 flex items-center justify-center text-xs transition"
                            title="Edit Product"
                          >
                            <i className="fa-solid fa-pen"></i>
                          </button>

                          <button
                            onClick={() => deleteProduct(product.product_id)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 flex items-center justify-center text-xs transition"
                            title="Delete Product"
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ORDERS WORKFLOW */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-lg text-slate-900">Order Management Pipeline</h3>
                <p className="text-xs text-slate-500">Track and advance customer delivery stages</p>
              </div>

              {/* Status filter chips */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scroll">
                {(['all', 'pending', 'confirmed', 'preparing', 'delivered'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold uppercase transition ${
                      orderStatusFilter === st
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-slate-200 text-xs text-slate-400 font-medium">
                No orders in "{orderStatusFilter}" status.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map(order => (
                  <div
                    key={order.order_id}
                    className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-slate-900">
                            Order #{order.order_id}
                          </span>
                          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Customer: <strong>{order.customer_name}</strong> • Phone: {order.customer_phone}
                        </p>
                        <p className="text-[11px] text-slate-400">Placed: {order.created_at}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase text-slate-400 font-bold block">Grand Total</span>
                        <span className="font-black text-lg text-emerald-600">₹{order.total_amount}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-1 text-xs">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                        Ordered Items:
                      </span>
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-slate-700">
                          <span>
                            <strong>{it.quantity}x</strong> {it.product_name}
                          </span>
                          <span className="font-bold">₹{it.price * it.quantity}</span>
                        </div>
                      ))}
                      {order.notes && (
                        <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-xl mt-1.5 font-medium">
                          Note from Customer: "{order.notes}"
                        </p>
                      )}
                      <p className="text-[11px] text-slate-500 pt-1">
                        <strong>Delivery Address:</strong> {order.delivery_address}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateOrderStatus(order.order_id, 'cancelled')}
                            className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs transition"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order.order_id, 'confirmed')}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs active:scale-95 transition"
                          >
                            Accept Order
                          </button>
                        </>
                      )}

                      {order.status === 'confirmed' && (
                        <button
                          onClick={() => updateOrderStatus(order.order_id, 'preparing')}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs active:scale-95 transition"
                        >
                          Mark as Preparing
                        </button>
                      )}

                      {order.status === 'preparing' && (
                        <button
                          onClick={() => updateOrderStatus(order.order_id, 'delivered')}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs active:scale-95 transition"
                        >
                          Mark Delivered & Finished
                        </button>
                      )}

                      {order.status === 'delivered' && (
                        <span className="text-xs text-emerald-600 font-extrabold flex items-center gap-1">
                          <i className="fa-solid fa-circle-check"></i>
                          <span>Order Complete</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PROMOTIONS */}
        {activeTab === 'promotions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-lg text-slate-900">Promotions & Neighborhood Deals</h3>
                <p className="text-xs text-slate-500">Deals appear on top of Customer App to attract local buyers</p>
              </div>

              <button
                onClick={() => setIsCreateOfferOpen(true)}
                className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
              >
                <i className="fa-solid fa-plus"></i>
                <span>New Promotion</span>
              </button>
            </div>

            {vendorOffers.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-slate-200 space-y-2">
                <p className="text-xs text-slate-500 font-bold">No promotional deals currently active</p>
                <button
                  onClick={() => setIsCreateOfferOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
                >
                  Create Your First Deal
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {vendorOffers.map(offer => (
                  <div
                    key={offer.offer_id}
                    className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider">
                          {offer.discount}
                        </span>
                        <button
                          onClick={() => deleteOffer(offer.offer_id)}
                          className="text-slate-400 hover:text-rose-600 text-xs p-1"
                          title="Delete Deal"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>

                      <h4 className="font-extrabold text-sm text-slate-900 mt-2">{offer.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{offer.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Valid until: {offer.end_date}</span>
                      <span className="text-emerald-600 font-bold">● Active in App</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: STORE SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-sm max-w-2xl mx-auto space-y-4">
            <div>
              <h3 className="font-black text-lg text-slate-900">Store Profile Settings</h3>
              <p className="text-xs text-slate-500">Update business information visible to customers</p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Business Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Owner Name</label>
                  <input
                    type="text"
                    value={editOwner}
                    onChange={e => setEditOwner(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    required
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Street Address</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={e => setEditAddress(e.target.value)}
                  required
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Opening Time</label>
                  <input
                    type="text"
                    value={editOpenHours}
                    onChange={e => setEditOpenHours(e.target.value)}
                    placeholder="7:00 AM"
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Closing Time</label>
                  <input
                    type="text"
                    value={editCloseHours}
                    onChange={e => setEditCloseHours(e.target.value)}
                    placeholder="10:30 PM"
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Store Description</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/25 active:scale-95 transition"
              >
                Save Store Information
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Modals */}
      <AICatalogModal
        vendor={vendor}
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />

      <AddProductModal
        vendor={vendor}
        productToEdit={productToEdit}
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
      />

      <CreateOfferModal
        vendor={vendor}
        isOpen={isCreateOfferOpen}
        onClose={() => setIsCreateOfferOpen(false)}
      />
    </div>
  );
};
