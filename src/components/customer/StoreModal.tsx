import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Vendor } from '../../types';

interface Props {
  vendor: Vendor | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenCart: () => void;
}

export const StoreModal: React.FC<Props> = ({ vendor, isOpen, onClose, onOpenCart }) => {
  const { products, offers, reviews, cart, addToCart, updateCartQuantity, addReview, currentUser, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'products' | 'reviews'>('products');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('All');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  if (!isOpen || !vendor) return null;

  // Filter products for this vendor
  const vendorProducts = products.filter(p => p.vendor_id === vendor.vendor_id);
  const vendorOffers = offers.filter(o => o.vendor_id === vendor.vendor_id && o.status === 'active');
  const vendorReviews = reviews.filter(r => r.vendor_id === vendor.vendor_id);

  // Subcategories
  const subcategories = ['All', ...Array.from(new Set(vendorProducts.map(p => p.category)))];
  const filteredProducts =
    selectedSubcategory === 'All'
      ? vendorProducts
      : vendorProducts.filter(p => p.category === selectedSubcategory);

  const getProductCartQuantity = (productId: number) => {
    const item = cart.find(ci => ci.product.product_id === productId);
    return item ? item.quantity : 0;
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    addReview({
      user_id: currentUser?.user_id || 1,
      vendor_id: vendor.vendor_id,
      user_name: currentUser?.name || 'Local Customer',
      rating: reviewRating,
      comment: reviewComment.trim()
    });

    setReviewComment('');
    setShowReviewForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[90vh] sm:max-h-[88vh] border border-rose-100">
        {/* Cover Image & Header */}
        <div className="relative h-48 sm:h-56 w-full overflow-hidden flex-shrink-0">
          <img src={vendor.image} alt={vendor.business_name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md flex items-center justify-center transition z-10"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>

          {/* Header content overlay */}
          <div className="absolute bottom-4 left-5 right-5 text-white">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-extrabold text-[11px] uppercase tracking-wider">
                {vendor.category}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white font-bold text-[11px] flex items-center gap-1">
                <i className="fa-solid fa-star text-amber-400 text-[10px]"></i>
                <span>{vendor.rating}</span>
                <span className="text-white/70">({vendorReviews.length + 18})</span>
              </span>
              {vendor.is_open ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/90 text-white font-bold text-[11px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                  Open Now
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-slate-700 text-white/80 font-bold text-[11px]">
                  Closed
                </span>
              )}
            </div>

            <h2 className="text-2xl font-black tracking-tight">{vendor.business_name}</h2>
            <p className="text-xs text-white/90 font-medium line-clamp-1 mt-0.5">{vendor.address}, {vendor.city}</p>
            <div className="flex items-center gap-3 text-xs text-rose-200 mt-1">
              <span><i className="fa-solid fa-person-walking mr-1"></i>{vendor.time_estimate || '5 min walk'}</span>
              <span>•</span>
              <span><i className="fa-solid fa-clock mr-1"></i>{vendor.opening_hours} - {vendor.closing_time}</span>
              <span>•</span>
              <a href={`tel:${vendor.phone}`} className="hover:underline flex items-center gap-1">
                <i className="fa-solid fa-phone text-[10px]"></i> {vendor.phone}
              </a>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-100 bg-white px-5 pt-2 flex-shrink-0">
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-2.5 px-3 font-extrabold text-xs transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'products'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <i className="fa-solid fa-bag-shopping"></i>
            <span>Menu & Products ({vendorProducts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-2.5 px-3 font-extrabold text-xs transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'reviews'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <i className="fa-solid fa-comments"></i>
            <span>Customer Reviews ({vendorReviews.length})</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 hide-scroll bg-slate-50/50">
          {activeTab === 'products' && (
            <>
              {/* Active Vendor Offers Banner */}
              {vendorOffers.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                    <i className="fa-solid fa-tags text-rose-600"></i>
                    <span>Store Exclusive Deals</span>
                  </h4>
                  <div className="flex gap-2.5 overflow-x-auto pb-1 hide-scroll">
                    {vendorOffers.map(offer => (
                      <div
                        key={offer.offer_id}
                        className="flex-shrink-0 w-64 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl p-3 shadow-md flex items-center justify-between"
                      >
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                            {offer.discount}
                          </span>
                          <h5 className="font-extrabold text-xs mt-1 leading-tight">{offer.title}</h5>
                          <p className="text-[11px] text-white/90 line-clamp-1">{offer.description}</p>
                        </div>
                        <i className="fa-solid fa-gift text-2xl text-white/30 ml-2"></i>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subcategory Pills */}
              {subcategories.length > 2 && (
                <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scroll">
                  {subcategories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedSubcategory(cat)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                        selectedSubcategory === cat
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {/* Products List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredProducts.map(product => {
                  const qty = getProductCartQuantity(product.product_id);
                  return (
                    <div
                      key={product.product_id}
                      className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-sm flex gap-3 hover:border-rose-200 transition"
                    >
                      <img
                        src={product.image}
                        alt={product.product_name}
                        className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <h5 className="font-extrabold text-xs text-slate-900 leading-tight">
                              {product.product_name}
                            </h5>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                            {product.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
                          <span className="font-black text-sm text-slate-900">₹{product.price}</span>

                          {product.availability === 0 ? (
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">
                              Out of stock
                            </span>
                          ) : qty === 0 ? (
                            <button
                              onClick={() => addToCart(product, vendor, 1)}
                              className="px-3 py-1 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white font-extrabold text-xs border border-rose-200 hover:border-transparent transition flex items-center gap-1 active:scale-95"
                            >
                              <i className="fa-solid fa-plus text-[10px]"></i>
                              <span>Add</span>
                            </button>
                          ) : (
                            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-2 py-0.5">
                              <button
                                onClick={() => updateCartQuantity(product.product_id, -1)}
                                className="w-5 h-5 flex items-center justify-center font-bold text-rose-700 hover:bg-rose-200 rounded text-xs"
                              >
                                -
                              </button>
                              <span className="font-black text-xs text-rose-900 min-w-[12px] text-center">
                                {qty}
                              </span>
                              <button
                                onClick={() => updateCartQuantity(product.product_id, 1)}
                                className="w-5 h-5 flex items-center justify-center font-bold text-rose-700 hover:bg-rose-200 rounded text-xs"
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200 p-6">
                  <i className="fa-solid fa-box-open text-3xl text-slate-300 mb-2"></i>
                  <p className="text-xs font-bold text-slate-500">No products found in this section</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-sm text-slate-900">Customer Feedback</h4>
                  <p className="text-xs text-slate-500">Verified neighborhood testimonials</p>
                </div>
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95"
                >
                  <i className="fa-solid fa-pen text-[10px]"></i>
                  <span>Write Review</span>
                </button>
              </div>

              {showReviewForm && (
                <form
                  onSubmit={handleAddReview}
                  className="bg-white rounded-2xl p-4 border border-rose-200 shadow-sm space-y-3"
                >
                  <h5 className="font-bold text-xs text-slate-800">Share your shopping experience:</h5>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">Rating:</span>
                    <div className="flex gap-1 text-amber-400 text-lg cursor-pointer">
                      {[1, 2, 3, 4, 5].map(star => (
                        <i
                          key={star}
                          onClick={() => setReviewRating(star)}
                          className={`fa-star ${star <= reviewRating ? 'fa-solid' : 'fa-regular'}`}
                        ></i>
                      ))}
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    placeholder="Write a few words about product quality, taste or delivery speed..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-rose-600 focus:bg-white"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs active:scale-95"
                    >
                      Submit Review
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2.5">
                {vendorReviews.map(review => (
                  <div
                    key={review.review_id}
                    className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-slate-900">{review.user_name}</span>
                      <div className="flex text-amber-400 text-[11px] gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <i
                            key={i}
                            className={`fa-star ${i < review.rating ? 'fa-solid' : 'fa-regular text-slate-300'}`}
                          ></i>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Cart Bar if items in cart */}
        {cart.length > 0 && (
          <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between flex-shrink-0 shadow-lg">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {cart.reduce((s, i) => s + i.quantity, 0)} Items Added
              </span>
              <p className="text-base font-black text-slate-900">
                ₹{cart.reduce((s, i) => s + i.product.price * i.quantity, 0)}
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenCart();
              }}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-extrabold text-xs shadow-md shadow-rose-500/25 flex items-center gap-2 active:scale-95 transition"
            >
              <span>View Cart & Checkout</span>
              <i className="fa-solid fa-arrow-right text-[11px]"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
