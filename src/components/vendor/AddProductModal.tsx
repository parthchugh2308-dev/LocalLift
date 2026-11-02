import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES } from '../../data/initialData';
import { Product, Vendor } from '../../types';

interface Props {
  vendor: Vendor;
  productToEdit?: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AddProductModal: React.FC<Props> = ({ vendor, productToEdit, isOpen, onClose }) => {
  const { addProduct, updateProduct, showToast } = useApp();
  const [name, setName] = useState('');
  const [category, setCategory] = useState(vendor.category);
  const [price, setPrice] = useState('100');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.product_name);
      setCategory(productToEdit.category);
      setPrice(String(productToEdit.price));
      setImage(productToEdit.image);
      setDescription(productToEdit.description);
    } else {
      setName('');
      setCategory(vendor.category);
      setPrice('120');
      const catMeta = CATEGORIES[vendor.category] || CATEGORIES['Grocery'];
      setImage(catMeta.image);
      setDescription('');
    }
  }, [productToEdit, vendor, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numPrice = parseFloat(price) || 50;

    if (productToEdit) {
      updateProduct(productToEdit.product_id, {
        product_name: name,
        category,
        price: numPrice,
        image: image || CATEGORIES[category]?.image || '',
        description
      });
    } else {
      addProduct({
        vendor_id: vendor.vendor_id,
        product_name: name,
        category,
        price: numPrice,
        image: image || CATEGORIES[category]?.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&fit=crop',
        availability: 1,
        description
      });
    }
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

        <h3 className="text-xl font-black text-slate-900 mb-1">
          {productToEdit ? 'Edit Product' : 'Add New Product'}
        </h3>
        <p className="text-xs text-slate-500 mb-5 font-medium">
          Manage product details shown on your {vendor.business_name} storefront
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Product Title</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="e.g. Fresh Cream Chocolate Pastry"
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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
              <label className="text-xs font-bold text-slate-700 block mb-1">Price (₹ INR)</label>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                required
                min="1"
                placeholder="150"
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Image URL</label>
            <input
              type="url"
              value={image}
              onChange={e => setImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Product Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Freshly prepared, ingredients, weight or portions..."
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
              {productToEdit ? 'Save Changes' : 'Publish Product to Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
