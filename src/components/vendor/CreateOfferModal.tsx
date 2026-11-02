import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Vendor } from '../../types';

interface Props {
  vendor: Vendor;
  isOpen: boolean;
  onClose: () => void;
}

export const CreateOfferModal: React.FC<Props> = ({ vendor, isOpen, onClose }) => {
  const { addOffer } = useApp();
  const [title, setTitle] = useState('');
  const [discount, setDiscount] = useState('15% OFF');
  const [description, setDescription] = useState('');
  const [endDate, setEndDate] = useState('2026-12-31');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addOffer({
      vendor_id: vendor.vendor_id,
      title: title.trim(),
      discount: discount.trim(),
      description: description.trim() || `Special neighborhood discount at ${vendor.business_name}.`,
      start_date: new Date().toISOString().split('T')[0],
      end_date: endDate,
      status: 'active'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-indigo-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        <h3 className="text-xl font-black text-slate-900 mb-1">Create Promotional Deal</h3>
        <p className="text-xs text-slate-500 mb-5 font-medium">
          Deals are displayed as highlighted banners on the Customer App home screen
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Offer Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              placeholder="e.g. Weekend Special Pastry Bonanza"
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Discount Tag</label>
              <input
                type="text"
                value={discount}
                onChange={e => setDiscount(e.target.value)}
                required
                placeholder="e.g. 20% OFF or B2G1 FREE"
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Valid Until</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                required
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Offer Details / Terms</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Flat 20% discount on all cake orders above ₹400..."
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/25 active:scale-95 transition"
            >
              Launch Promotion
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
