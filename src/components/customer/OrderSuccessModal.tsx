import React from 'react';
import { Order } from '../../types';

interface Props {
  order: Order | null;
  onClose: () => void;
  onViewOrders: () => void;
}

export const OrderSuccessModal: React.FC<Props> = ({ order, onClose, onViewOrders }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-100 text-center relative">
        {/* Animated Celebration Icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-4 text-white text-3xl shadow-xl shadow-emerald-500/25 animate-bounce">
          <i className="fa-solid fa-circle-check"></i>
        </div>

        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black uppercase tracking-wider">
          Order Sent to Shop
        </span>

        <h3 className="text-2xl font-black text-slate-900 mt-2">Order Confirmed! 🎉</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto font-medium">
          Your order has been transmitted directly to <strong>{order.business_name}</strong>.
        </p>

        {/* Order Details Card */}
        <div className="bg-slate-50 rounded-2xl p-4 my-5 border border-slate-200/80 text-left space-y-2 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="font-bold text-slate-500">Order ID:</span>
            <span className="font-black text-slate-900">#{order.order_id}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Estimated Delivery:</span>
            <span className="font-extrabold text-emerald-600">15–25 minutes</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Total Amount:</span>
            <span className="font-black text-slate-900 text-sm">₹{order.total_amount}</span>
          </div>
          <div className="pt-2 border-t border-slate-200">
            <span className="text-slate-500 block mb-1">Delivering to:</span>
            <p className="font-semibold text-slate-800 line-clamp-2">{order.delivery_address}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
          >
            Back to Home
          </button>
          <button
            onClick={onViewOrders}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-extrabold text-xs shadow-lg shadow-rose-500/25 active:scale-95 transition"
          >
            Track in Orders Tab →
          </button>
        </div>
      </div>
    </div>
  );
};
