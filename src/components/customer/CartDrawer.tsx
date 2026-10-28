import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
  onOpenLocationChange: () => void;
}

export const CartDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  onOrderSuccess,
  onOpenLocationChange
}) => {
  const { cart, cartTotal, updateCartQuantity, removeFromCart, createOrder, userLocation } = useApp();
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi'>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const vendor = cart[0]?.vendor;

  const handlePlaceOrder = () => {
    if (cart.length === 0 || !vendor) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const order = createOrder({
        vendorId: vendor.vendor_id,
        items: cart.map(item => ({
          productId: item.product.product_id,
          productName: item.product.product_name,
          price: item.product.price,
          quantity: item.quantity
        })),
        totalAmount: cartTotal,
        notes: `${orderNotes}${paymentMethod === 'upi' ? ' (Paid via UPI)' : ' (Pay on Delivery)'}`,
        deliveryAddress: userLocation.address
      });

      // Confetti celebration!
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      setIsSubmitting(false);
      onClose();
      onOrderSuccess(order);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <i className="fa-solid fa-basket-shopping"></i>
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 leading-tight">Your Neighborhood Cart</h3>
              {vendor && <p className="text-[11px] font-bold text-rose-600">Ordering from: {vendor.business_name}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Scrollable Items */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 hide-scroll bg-slate-50/50">
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-3 text-rose-500">
                <i className="fa-solid fa-cart-shopping text-2xl"></i>
              </div>
              <h4 className="font-extrabold text-base text-slate-800">Your cart is empty</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Explore nearby shops and add fresh bakery treats, groceries, or essentials!
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs"
              >
                Browse Shops
              </button>
            </div>
          ) : (
            <>
              {/* Item List */}
              <div className="space-y-2.5">
                {cart.map(item => (
                  <div
                    key={item.product.product_id}
                    className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-sm flex items-center gap-3"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.product_name}
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-xs text-slate-900 truncate">
                        {item.product.product_name}
                      </h5>
                      <span className="font-extrabold text-xs text-slate-700">₹{item.product.price}</span>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-2 py-1">
                      <button
                        onClick={() => updateCartQuantity(item.product.product_id, -1)}
                        className="w-5 h-5 flex items-center justify-center font-bold text-rose-700 hover:bg-rose-200 rounded text-xs"
                      >
                        -
                      </button>
                      <span className="font-black text-xs text-rose-900 min-w-[12px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.product.product_id, 1)}
                        className="w-5 h-5 flex items-center justify-center font-bold text-rose-700 hover:bg-rose-200 rounded text-xs"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.product_id)}
                      className="text-slate-400 hover:text-rose-600 transition p-1"
                    >
                      <i className="fa-solid fa-trash-can text-xs"></i>
                    </button>
                  </div>
                ))}
              </div>

              {/* Delivery Address Card */}
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                    <i className="fa-solid fa-location-dot text-rose-600"></i> Delivering to Doorstep
                  </span>
                  <button
                    onClick={onOpenLocationChange}
                    className="text-[11px] font-bold text-rose-600 hover:underline"
                  >
                    Change
                  </button>
                </div>
                <p className="text-xs font-bold text-slate-800 line-clamp-1">{userLocation.address}</p>
                <p className="text-[11px] text-slate-400">Neighborhood delivery by vendor within 15–30 mins</p>
              </div>

              {/* Order Notes */}
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 block">
                  <i className="fa-regular fa-note-sticky mr-1 text-rose-500"></i> Special instructions for shop:
                </label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={e => setOrderNotes(e.target.value)}
                  placeholder="e.g. Ring doorbell, less spicy, pack fresh..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-rose-600"
                />
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm space-y-2">
                <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider block">
                  Select Payment Option
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-2.5 rounded-xl border text-left font-bold text-xs transition flex flex-col justify-between ${
                      paymentMethod === 'cod'
                        ? 'border-rose-600 bg-rose-50/50 text-rose-800'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <i className="fa-solid fa-money-bill-wave text-rose-600"></i>
                      {paymentMethod === 'cod' && <i className="fa-solid fa-circle-check text-rose-600 text-xs"></i>}
                    </div>
                    <span>Pay on Delivery</span>
                    <span className="text-[10px] text-slate-400 font-normal">Cash or UPI on arrival</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-2.5 rounded-xl border text-left font-bold text-xs transition flex flex-col justify-between ${
                      paymentMethod === 'upi'
                        ? 'border-rose-600 bg-rose-50/50 text-rose-800'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <i className="fa-brands fa-google-pay text-rose-600 text-base"></i>
                      {paymentMethod === 'upi' && <i className="fa-solid fa-circle-check text-rose-600 text-xs"></i>}
                    </div>
                    <span>Instant UPI</span>
                    <span className="text-[10px] text-slate-400 font-normal">GPay / PhonePe / QR</span>
                  </button>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Items Subtotal</span>
                  <span className="font-bold text-slate-900">₹{cartTotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1">
                    Delivery Partner Fee
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-extrabold uppercase">Hyperlocal</span>
                  </span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Platform Commission</span>
                  <span className="font-bold text-emerald-600">₹0 (Zero Comm)</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between font-black text-sm text-slate-900">
                  <span>Grand Total</span>
                  <span className="text-rose-600">₹{cartTotal}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bottom Checkout CTA */}
        {cart.length > 0 && (
          <div className="p-4 bg-white border-t border-slate-100 flex-shrink-0 shadow-lg space-y-2">
            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-extrabold text-sm shadow-xl shadow-rose-500/25 flex items-center justify-center gap-2 active:scale-95 transition"
            >
              {isSubmitting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  <span>Sending Order to Vendor...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-lock text-xs"></i>
                  <span>Place Order • ₹{cartTotal}</span>
                </>
              )}
            </button>
            <p className="text-center text-[10px] text-slate-400 font-medium">
              100% of your money goes directly to your local shopkeeper.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
