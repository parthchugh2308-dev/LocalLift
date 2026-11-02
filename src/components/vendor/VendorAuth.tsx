import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES } from '../../data/initialData';

export const VendorAuth: React.FC = () => {
  const { setCurrentUser, setCurrentVendor, vendors, registerVendorApplication, showToast } = useApp();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Login form
  const [email, setEmail] = useState('vendor@locallift.com');
  const [password, setPassword] = useState('password123');

  // Register form
  const [bName, setBName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [category, setCategory] = useState('Bakery');
  const [phone, setPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Ludhiana');
  const [description, setDescription] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    // Check if user is known vendor
    const foundVendor = vendors.find(
      v => v.email?.toLowerCase() === cleanEmail || cleanEmail.includes('vendor')
    ) || vendors[0];

    setCurrentUser({
      user_id: foundVendor.owner_user_id || 3,
      name: foundVendor.owner_name || 'Ramesh Sharma',
      email: cleanEmail,
      phone: foundVendor.phone,
      user_type: 'vendor',
      location: foundVendor.address
    });
    setCurrentVendor(foundVendor);
    showToast(`Welcome to ${foundVendor.business_name} Dashboard!`, 'success');
  };

  const handle1ClickDemo = () => {
    const demoVendor = vendors[0]; // Sharma Bakery
    setCurrentUser({
      user_id: 3,
      name: 'Ramesh Sharma',
      email: 'vendor@locallift.com',
      phone: '9812345678',
      user_type: 'vendor',
      location: demoVendor.address
    });
    setCurrentVendor(demoVendor);
    showToast('Logged in as Ramesh Sharma (Sharma Bakery)!', 'success');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bName.trim() || !phone.trim() || !regEmail.trim()) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    const newVendor = registerVendorApplication({
      business_name: bName.trim(),
      owner_name: ownerName.trim() || bName.trim(),
      category,
      phone: phone.trim(),
      email: regEmail.trim().toLowerCase(),
      address: address.trim() || 'Main Market Road',
      city: city.trim() || 'Ludhiana',
      description: description.trim() || `Authentic ${category.toLowerCase()} store registered with LocalLift.`
    });

    setCurrentUser({
      user_id: Math.floor(100 + Math.random() * 900),
      name: ownerName.trim() || bName.trim(),
      email: regEmail.trim().toLowerCase(),
      phone: phone.trim(),
      user_type: 'vendor',
      location: address.trim()
    });
    setCurrentVendor(newVendor);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 min-h-[calc(100vh-60px)]">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col">
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-indigo-500/25">
            <i className="fa-solid fa-store"></i>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">LocalLift Vendor</h2>
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Zero-Commission Business Hub</p>
          </div>
        </div>

        {/* Tab Toggle: Sign In / Register */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-5">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition ${
              tab === 'login' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In to Store
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition ${
              tab === 'register' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Register New Shop
          </button>
        </div>

        {tab === 'login' && (
          <div>
            <p className="text-sm text-slate-500 mb-5 font-medium">
              Access your digital storefront, manage incoming neighborhood orders and launch deals.
            </p>

            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Store Owner Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="vendor@locallift.com"
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Security Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-indigo-600/25 active:scale-95 transition flex items-center justify-center gap-2 mt-2"
              >
                <i className="fa-solid fa-lock text-xs"></i>
                <span>Open Vendor Dashboard</span>
              </button>
            </form>

            <button
              onClick={handle1ClickDemo}
              className="mt-4 w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-extrabold text-xs rounded-2xl active:scale-95 transition flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-bolt text-indigo-600"></i>
              <span>One-Click Demo Store Login (Sharma Bakery)</span>
            </button>

            <div className="mt-5 pt-3 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-400">
                Demo Credentials: <strong>vendor@locallift.com</strong> / <strong>password123</strong>
              </p>
            </div>
          </div>
        )}

        {tab === 'register' && (
          <div>
            <p className="text-xs text-slate-500 mb-4 font-medium">
              Join LocalLift with 0% commission. Applications are reviewed instantly in the Admin portal.
            </p>

            <form onSubmit={handleRegister} className="space-y-3 max-h-[58vh] overflow-y-auto pr-1 hide-scroll">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Business / Shop Name *</label>
                <input
                  type="text"
                  value={bName}
                  onChange={e => setBName(e.target.value)}
                  required
                  placeholder="e.g. Royal Sweets & Dairy"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Owner Name</label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={e => setOwnerName(e.target.value)}
                    placeholder="e.g. Suresh Kumar"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Store Category *</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  >
                    {Object.keys(CATEGORIES).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required
                    placeholder="+91 9876543210"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    required
                    placeholder="shop@locallift.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Shop 12, Main Market"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="Ludhiana"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Store Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Specialties, home delivery hours, quality guarantee..."
                  className="w-full px-3.5 py-2 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold text-xs rounded-2xl shadow-xl shadow-indigo-600/25 active:scale-95 transition flex items-center justify-center gap-2 mt-2"
              >
                <i className="fa-solid fa-paper-plane"></i>
                <span>Submit Store Application</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
