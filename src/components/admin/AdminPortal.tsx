import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

type AdminTab = 'approvals' | 'vendors' | 'orders' | 'users';

export const AdminPortal: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    vendors,
    orders,
    products,
    updateVendorStatus,
    deleteVendor,
    resetDemoData,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<AdminTab>('approvals');
  const [vendorFilter, setVendorFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  // Login form
  const [email, setEmail] = useState('admin@locallift.com');
  const [password, setPassword] = useState('admin123');

  const isAdmin = currentUser?.user_type === 'admin';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentUser({
      user_id: 999,
      name: 'Platform Administrator',
      email: email.trim().toLowerCase(),
      user_type: 'admin',
      location: 'HQ Control'
    });
    showToast('Authenticated as Platform Administrator!', 'success');
  };

  const handle1ClickAdmin = () => {
    setCurrentUser({
      user_id: 999,
      name: 'Platform Administrator',
      email: 'admin@locallift.com',
      user_type: 'admin',
      location: 'HQ Control'
    });
    showToast('Authenticated with 1-Click Demo Admin Access!', 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToast('Logged out of Admin Portal', 'info');
  };

  // If not authenticated as Admin, show login view
  if (!isAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 min-h-[calc(100vh-60px)]">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-900 to-indigo-900 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
              <i className="fa-solid fa-shield-halved text-rose-400"></i>
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">LocalLift Admin</h2>
              <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">Platform Governance Portal</p>
            </div>
          </div>

          <p className="text-sm text-slate-500 mb-6 font-medium">
            Log in to manage registered vendors, verify applications, and govern platform transactions.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-xs text-slate-800 focus:outline-none focus:border-slate-900 focus:bg-white transition"
                placeholder="admin@locallift.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Security Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-xs text-slate-800 focus:outline-none focus:border-slate-900 focus:bg-white transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-slate-950/25 active:scale-95 transition flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-lock text-rose-400 text-xs"></i>
              <span>Authenticate as Admin</span>
            </button>
          </form>

          {/* 1-Click Demo Admin Button */}
          <button
            onClick={handle1ClickAdmin}
            className="mt-4 w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold text-xs rounded-2xl active:scale-95 transition flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-bolt text-rose-600"></i>
            <span>One-Click Demo Admin Access</span>
          </button>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              Default Credentials: <strong>admin@locallift.com</strong> / <strong>admin123</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  const pendingVendors = vendors.filter(v => v.status === 'pending');
  const approvedVendors = vendors.filter(v => v.status === 'approved');
  const rejectedVendors = vendors.filter(v => v.status === 'rejected');

  const filteredVendors =
    vendorFilter === 'all'
      ? vendors
      : vendors.filter(v => v.status === vendorFilter);

  const totalGMV = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-9 z-30 px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-950 text-white flex items-center justify-center text-lg font-black shadow-md">
            <i className="fa-solid fa-shield-halved text-rose-500"></i>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-base sm:text-lg text-slate-900 leading-tight">
                LocalLift Admin Control Center
              </h1>
              <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full font-bold uppercase">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Governing Vendors, Platform Catalog & Hyperlocal Transactions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={resetDemoData}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition flex items-center gap-1.5"
          >
            <i className="fa-solid fa-rotate-right text-[10px]"></i>
            <span>Reset Demo DB</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Tab Navigation */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 overflow-x-auto hide-scroll flex gap-2">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`py-3 px-3.5 font-extrabold text-xs transition border-b-2 flex items-center gap-1.5 flex-shrink-0 ${
            activeTab === 'approvals'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <i className="fa-solid fa-user-check"></i>
          <span>Vendor Approvals</span>
          {pendingVendors.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center">
              {pendingVendors.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('vendors')}
          className={`py-3 px-3.5 font-extrabold text-xs transition border-b-2 flex items-center gap-1.5 flex-shrink-0 ${
            activeTab === 'vendors'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <i className="fa-solid fa-store"></i>
          <span>All Stores ({vendors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`py-3 px-3.5 font-extrabold text-xs transition border-b-2 flex items-center gap-1.5 flex-shrink-0 ${
            activeTab === 'orders'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <i className="fa-solid fa-receipt"></i>
          <span>All Platform Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`py-3 px-3.5 font-extrabold text-xs transition border-b-2 flex items-center gap-1.5 flex-shrink-0 ${
            activeTab === 'users'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <i className="fa-solid fa-users"></i>
          <span>Users & Customers</span>
        </button>
      </div>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Metric Cards Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Vendors</span>
            <p className="text-2xl font-black text-slate-900">{vendors.length}</p>
            <span className="text-[11px] text-emerald-600 font-bold">{approvedVendors.length} Approved</span>
          </div>

          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Pending Approvals</span>
            <p className="text-2xl font-black text-rose-600">{pendingVendors.length}</p>
            <span className="text-[11px] text-rose-500 font-bold">Needs Verification</span>
          </div>

          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Platform GMV</span>
            <p className="text-2xl font-black text-emerald-600">₹{totalGMV}</p>
            <span className="text-[11px] text-slate-400 font-bold">100% Retained Locally</span>
          </div>

          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Orders</span>
            <p className="text-2xl font-black text-indigo-600">{orders.length}</p>
            <span className="text-[11px] text-slate-400 font-bold">Across 16 Categories</span>
          </div>

          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Catalog SKUs</span>
            <p className="text-2xl font-black text-slate-900">{products.length}</p>
            <span className="text-[11px] text-slate-400 font-bold">Live Product Items</span>
          </div>
        </div>

        {/* TAB 1: VENDOR APPROVALS QUEUE */}
        {activeTab === 'approvals' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-lg text-slate-900">Vendor Governance & Approval Queue</h3>
                <p className="text-xs text-slate-500">Verify new merchant applications and publish them to customer maps</p>
              </div>

              {/* Status chips */}
              <div className="flex gap-1.5">
                {(['pending', 'approved', 'rejected', 'all'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setVendorFilter(st)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold uppercase transition ${
                      vendorFilter === st
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {filteredVendors.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-slate-200 text-xs text-slate-400 font-medium">
                No vendors found in "{vendorFilter}" status.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredVendors.map(v => (
                  <div
                    key={v.vendor_id}
                    className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <img
                        src={v.image}
                        alt={v.business_name}
                        className="w-16 h-16 rounded-2xl object-cover flex-shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-sm sm:text-base text-slate-900">
                            {v.business_name}
                          </h4>
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              v.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : v.status === 'pending'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {v.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Owner: <strong>{v.owner_name}</strong> • Phone: {v.phone} • Email: {v.email || 'N/A'}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Category: <strong>{v.category}</strong> • {v.address}, {v.city}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {v.status !== 'approved' && (
                        <button
                          onClick={() => updateVendorStatus(v.vendor_id, 'approved')}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm active:scale-95 transition flex items-center gap-1.5"
                        >
                          <i className="fa-solid fa-check"></i>
                          <span>Approve Store</span>
                        </button>
                      )}

                      {v.status !== 'rejected' && (
                        <button
                          onClick={() => updateVendorStatus(v.vendor_id, 'rejected')}
                          className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs transition"
                        >
                          Reject
                        </button>
                      )}

                      <button
                        onClick={() => deleteVendor(v.vendor_id)}
                        className="px-3 py-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 text-xs transition"
                        title="Delete Store Permanently"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ALL VENDORS */}
        {activeTab === 'vendors' && (
          <div className="space-y-4">
            <h3 className="font-black text-lg text-slate-900">All Registered Stores Directory ({vendors.length})</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {vendors.map(v => {
                const prodCount = products.filter(p => p.vendor_id === v.vendor_id).length;
                return (
                  <div
                    key={v.vendor_id}
                    className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3.5"
                  >
                    <img
                      src={v.image}
                      alt={v.business_name}
                      className="w-16 h-16 rounded-2xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-black text-sm text-slate-900 truncate">{v.business_name}</h4>
                        <span className="text-[10px] font-bold text-amber-500">★ {v.rating}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{v.category} • {v.city}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                        <span>{prodCount} Products in Menu</span>
                        <span className={v.is_open ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                          {v.is_open ? 'Open Now' : 'Closed'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: PLATFORM ORDERS AUDIT */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h3 className="font-black text-lg text-slate-900">Platform Orders Audit Trail ({orders.length})</h3>

            <div className="space-y-3">
              {orders.map(order => (
                <div
                  key={order.order_id}
                  className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900">Order #{order.order_id}</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                        {order.status}
                      </span>
                    </div>
                    <p className="text-slate-500 mt-0.5">
                      Customer: <strong>{order.customer_name}</strong> ({order.customer_phone}) → Store:{' '}
                      <strong>{order.business_name}</strong>
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      Items: {order.items.map(it => `${it.quantity}x ${it.product_name}`).join(', ')}
                    </p>
                    <p className="text-slate-400 text-[10px]">{order.created_at} • {order.delivery_address}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Order Value</span>
                    <span className="font-black text-base text-rose-600">₹{order.total_amount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: USERS */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <h3 className="font-black text-lg text-slate-900">Registered Platform Users</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                { name: 'Rahul Sharma', email: 'customer@locallift.com', phone: '9876543210', role: 'customer', orders: 2 },
                { name: 'Priya Verma', email: 'priya@locallift.com', phone: '9876543211', role: 'customer', orders: 1 },
                { name: 'Ramesh Sharma', email: 'vendor@locallift.com', phone: '9812345678', role: 'vendor', orders: 0 },
                { name: 'Platform Admin', email: 'admin@locallift.com', phone: '9999900000', role: 'admin', orders: 0 }
              ].map(u => (
                <div
                  key={u.email}
                  className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3.5"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-base shadow-sm">
                    {u.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-black text-xs text-slate-900 truncate">{u.name}</h4>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {u.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{u.email}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">+91 {u.phone} • {u.orders} Orders placed</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
