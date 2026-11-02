import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES } from '../../data/initialData';
import { Vendor } from '../../types';

interface Props {
  vendor: Vendor;
  isOpen: boolean;
  onClose: () => void;
}

export const AICatalogModal: React.FC<Props> = ({ vendor, isOpen, onClose }) => {
  const { synthesizeCatalogAI, addProduct, addOffer, showToast } = useApp();
  const [shopName, setShopName] = useState(vendor.business_name);
  const [category, setCategory] = useState(vendor.category);
  const [location, setLocation] = useState(`${vendor.address}, ${vendor.city}`);
  const [apiKey, setApiKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<{
    products: { name: string; price: number; description: string }[];
    special_offer: { title: string; discount: string; description: string };
  } | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const data = await synthesizeCatalogAI(shopName, category, location, apiKey.trim() || undefined);
      setGeneratedData(data);
      showToast('AI synthesized 4 products & 1 promotional deal!', 'success');
    } catch (err) {
      showToast('Generation failed, please try again', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImportToCatalog = () => {
    if (!generatedData) return;

    const catMeta = CATEGORIES[category] || CATEGORIES['Grocery'];

    // Add generated products to vendor's catalog
    generatedData.products.forEach((prod, idx) => {
      const img = catMeta.items[idx % catMeta.items.length]?.img || catMeta.image;
      addProduct({
        vendor_id: vendor.vendor_id,
        product_name: prod.name,
        category,
        price: prod.price,
        image: img,
        availability: 1,
        description: prod.description
      });
    });

    // Add generated promotional offer
    if (generatedData.special_offer) {
      addOffer({
        vendor_id: vendor.vendor_id,
        title: generatedData.special_offer.title,
        discount: generatedData.special_offer.discount,
        description: generatedData.special_offer.description,
        start_date: new Date().toISOString().split('T')[0],
        end_date: '2026-12-31',
        status: 'active'
      });
    }

    showToast('Imported all AI items and offer to your live storefront!', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-indigo-100 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-indigo-500/25">
            <i className="fa-solid fa-wand-magic-sparkles text-amber-300"></i>
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>AI Catalog Generator</span>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-bold">
                Google Gemini
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">Auto-generate realistic items and promotions tailored to your local shop</p>
          </div>
        </div>

        {!generatedData ? (
          <form onSubmit={handleGenerate} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Shop Name</label>
              <input
                type="text"
                value={shopName}
                onChange={e => setShopName(e.target.value)}
                required
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
                >
                  {Object.keys(CATEGORIES).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Neighborhood / City</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  required
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Gemini API Key (Optional)</label>
                <span className="text-[10px] text-slate-400 font-medium">Falls back to intelligent retail generator if blank</span>
              </div>
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="AIzaSy... (leave blank to use built-in engine)"
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-sm shadow-xl shadow-indigo-500/25 active:scale-95 transition flex items-center justify-center gap-2 mt-4"
            >
              {isGenerating ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  <span>Gemini AI is Synthesizing Catalog...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                  <span>Generate 4 Products & 1 Offer</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center gap-2 text-xs font-bold text-emerald-800">
              <i className="fa-solid fa-circle-check text-emerald-600"></i>
              <span>Generated 4 Products & 1 Special Deal for {shopName}!</span>
            </div>

            {/* Generated Products */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">Generated Products:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {generatedData.products.map((p, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-2xl p-3 border border-slate-200">
                    <div className="flex justify-between items-start">
                      <h5 className="font-extrabold text-xs text-slate-900 leading-tight">{p.name}</h5>
                      <span className="font-black text-xs text-indigo-600">₹{p.price}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{p.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Generated Offer */}
            {generatedData.special_offer && (
              <div className="space-y-1">
                <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">Generated Deal:</h4>
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase bg-white/20 px-2 py-0.5 rounded-full">
                      {generatedData.special_offer.discount}
                    </span>
                    <h5 className="font-bold text-xs mt-1">{generatedData.special_offer.title}</h5>
                    <p className="text-[11px] text-white/90">{generatedData.special_offer.description}</p>
                  </div>
                  <i className="fa-solid fa-tags text-2xl text-white/30 ml-2"></i>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setGeneratedData(null)}
                className="px-4 py-3 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
              >
                Regenerate
              </button>
              <button
                type="button"
                onClick={handleImportToCatalog}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 active:scale-95 transition flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-file-import"></i>
                <span>Import All to My Live Catalog</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
