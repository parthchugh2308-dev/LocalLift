import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerAuthModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { setCurrentUser, showToast, setActiveRole } = useApp();
  const [loginMode, setLoginMode] = useState<'options' | 'phone' | 'email'>('options');
  const [phone, setPhone] = useState('9876543210');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [email, setEmail] = useState('customer@locallift.com');
  const [password, setPassword] = useState('password123');

  if (!isOpen) return null;

  const handleGoogleLogin = () => {
    setCurrentUser({
      user_id: 1,
      name: 'Rahul Sharma',
      email: 'customer@locallift.com',
      phone: '9876543210',
      user_type: 'customer',
      location: 'Model Town, Ludhiana'
    });
    showToast('Signed in with Google as Rahul Sharma!', 'success');
    onClose();
  };

  const handleSendOtp = () => {
    if (phone.length < 10) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }
    setOtpSent(true);
    showToast('Demo OTP 1234 sent to your number!', 'info');
  };

  const handleVerifyOtp = () => {
    const entered = otp.join('');
    if (entered === '1234' || entered.length === 4) {
      setCurrentUser({
        user_id: 1,
        name: `Local Customer (${phone.slice(-4)})`,
        email: `user_${phone.slice(-4)}@locallift.com`,
        phone,
        user_type: 'customer',
        location: 'Local Neighborhood'
      });
      showToast('Phone verified successfully!', 'success');
      onClose();
    } else {
      showToast('Invalid OTP! Please use demo code 1234', 'error');
    }
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentUser({
      user_id: 1,
      name: 'Rahul Sharma',
      email: email.trim().toLowerCase(),
      phone: '9876543210',
      user_type: 'customer',
      location: 'Model Town, Ludhiana'
    });
    showToast(`Welcome back, Rahul Sharma!`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 bg-gradient-to-br from-rose-600 to-pink-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-500/25">
            <i className="fa-solid fa-heart text-2xl"></i>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">LocalLift</h2>
            <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">Hyperlocal Marketplace</p>
          </div>
        </div>

        <h3 className="text-2xl font-extrabold text-slate-900 mb-1">Welcome! ❤️</h3>
        <p className="text-sm text-slate-500 mb-5 font-medium">Sign in to discover authentic shops & fresh items near you.</p>

        {/* Mode: Options */}
        {loginMode === 'options' && (
          <div className="flex flex-col gap-3">
            <button
              onClick={handleGoogleLogin}
              className="w-full bg-white hover:bg-rose-50 text-slate-700 font-bold py-3.5 px-4 rounded-2xl border-2 border-rose-100 flex items-center justify-center gap-3 active:scale-95 transition shadow-sm"
            >
              <i className="fa-brands fa-google text-red-500 text-lg"></i>
              Continue with Google
            </button>

            <button
              onClick={() => setLoginMode('phone')}
              className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition shadow-lg shadow-rose-500/25"
            >
              <i className="fa-solid fa-mobile-screen-button text-lg"></i>
              Phone Number (Instant OTP)
            </button>

            <button
              onClick={() => setLoginMode('email')}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition"
            >
              <i className="fa-solid fa-envelope text-lg text-slate-600"></i>
              Continue with Email
            </button>

            <div className="mt-4 pt-4 border-t border-rose-100 text-center">
              <span className="text-xs text-slate-400 font-medium">Are you a shop owner?</span>
              <button
                onClick={() => {
                  onClose();
                  setActiveRole('vendor');
                }}
                className="block w-full mt-1 text-rose-600 text-xs font-bold hover:underline"
              >
                Open Vendor Partner Portal →
              </button>
            </div>
          </div>
        )}

        {/* Mode: Phone OTP */}
        {loginMode === 'phone' && (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => {
                setLoginMode('options');
                setOtpSent(false);
              }}
              className="self-start text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 py-1"
            >
              <i className="fa-solid fa-arrow-left"></i> Change Method
            </button>

            {!otpSent ? (
              <div className="flex flex-col gap-4">
                <h4 className="text-lg font-extrabold text-slate-800">Enter Mobile Number</h4>
                <div className="flex gap-2">
                  <div className="bg-rose-50 border border-rose-200 px-4 py-3 rounded-2xl font-bold text-rose-800 flex items-center">+91</div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    className="flex-1 bg-white border-2 border-rose-100 rounded-2xl px-4 py-3 font-bold text-slate-800 text-base focus:outline-none focus:border-rose-600"
                  />
                </div>
                <button
                  onClick={handleSendOtp}
                  className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-rose-500/25 active:scale-95 transition"
                >
                  Get Verification Code
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <h4 className="text-lg font-extrabold text-slate-800">Verify Code</h4>
                <p className="text-xs text-slate-500 font-medium">
                  Enter 4-digit code sent to +91 <span className="font-bold text-slate-800">{phone}</span>
                </p>

                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 font-semibold flex items-center gap-2">
                  <i className="fa-solid fa-bell text-rose-600"></i>
                  <span>Demo OTP: <strong>1234</strong></span>
                </div>

                <div className="flex justify-between gap-2.5">
                  {[0, 1, 2, 3].map(idx => (
                    <input
                      key={idx}
                      id={`otp-box-${idx}`}
                      type="text"
                      maxLength={1}
                      value={otp[idx]}
                      onChange={e => {
                        const val = e.target.value;
                        const next = [...otp];
                        next[idx] = val;
                        setOtp(next);
                        if (val && idx < 3) {
                          document.getElementById(`otp-box-${idx + 1}`)?.focus();
                        }
                      }}
                      className="w-12 h-12 sm:w-14 sm:h-14 bg-rose-50/50 border-2 border-rose-100 rounded-2xl text-center text-xl font-black text-slate-800 focus:border-rose-600 focus:bg-white focus:outline-none"
                    />
                  ))}
                </div>

                <button
                  onClick={handleVerifyOtp}
                  className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-rose-500/25 active:scale-95 transition mt-2"
                >
                  Verify & Enter
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mode: Email */}
        {loginMode === 'email' && (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => setLoginMode('options')}
              className="self-start text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 py-1"
            >
              <i className="fa-solid fa-arrow-left"></i> Change Method
            </button>

            <form onSubmit={handleEmailLogin} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="customer@locallift.com"
                  className="w-full bg-white border-2 border-rose-100 rounded-2xl p-3 font-semibold text-slate-800 focus:border-rose-600 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border-2 border-rose-100 rounded-2xl p-3 font-semibold text-slate-800 focus:border-rose-600 focus:outline-none text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-rose-500/25 active:scale-95 transition mt-2 text-sm"
              >
                Sign In with Email
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
