import React from 'react';
import { useApp } from '../../../context/AppContext';

export const OrdersTab: React.FC = () => {
  const { orders, currentUser, nearbyVendors } = useApp();

  // Filter orders for current user or show all demo orders
  const userOrders = orders.filter(
    o => (currentUser ? o.user_id === currentUser.user_id : true)
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black uppercase flex items-center gap-1">
            <i className="fa-solid fa-circle-check text-[10px]"></i> Delivered
          </span>
        );
      case 'preparing':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-black uppercase flex items-center gap-1">
            <i className="fa-solid fa-fire-burner text-[10px]"></i> Preparing
          </span>
        );
      case 'confirmed':
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-black uppercase flex items-center gap-1">
            <i className="fa-solid fa-bell text-[10px]"></i> Confirmed
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-black uppercase flex items-center gap-1">
            <i className="fa-solid fa-circle-xmark text-[10px]"></i> Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-black uppercase flex items-center gap-1">
            <i className="fa-solid fa-clock text-[10px]"></i> Pending Store
          </span>
        );
    }
  };

  const getStepNumber = (status: string) => {
    switch (status) {
      case 'pending': return 1;
      case 'confirmed': return 2;
      case 'preparing': return 3;
      case 'delivered': return 4;
      default: return 1;
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Your Local Orders</h2>
        <p className="text-xs text-slate-500 font-medium">Track your neighborhood deliveries and order history</p>
      </div>

      {userOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-slate-200 space-y-3">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500">
            <i className="fa-solid fa-bag-shopping text-2xl"></i>
          </div>
          <h4 className="font-extrabold text-slate-800">No orders placed yet</h4>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Order fresh items from your nearby stores and track delivery here!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {userOrders.map(order => {
            const step = getStepNumber(order.status);
            const vendor = nearbyVendors.find(v => v.vendor_id === order.vendor_id);

            return (
              <div
                key={order.order_id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      Order #{order.order_id} • {order.created_at}
                    </span>
                    <h4 className="font-black text-base text-slate-900 mt-0.5">
                      {order.business_name}
                    </h4>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                {/* Progress Pipeline */}
                {order.status !== 'cancelled' && (
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-2">
                      <span className={step >= 1 ? 'text-rose-600 font-extrabold' : ''}>1. Received</span>
                      <span className={step >= 2 ? 'text-rose-600 font-extrabold' : ''}>2. Confirmed</span>
                      <span className={step >= 3 ? 'text-rose-600 font-extrabold' : ''}>3. Preparing</span>
                      <span className={step >= 4 ? 'text-emerald-600 font-extrabold' : ''}>4. Delivered</span>
                    </div>

                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-rose-600 to-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(step / 4) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Items Summary */}
                <div className="space-y-1 pt-1 border-t border-slate-100 text-xs">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center text-slate-700">
                      <span>
                        <strong className="text-slate-900 font-bold">{it.quantity}x</strong> {it.product_name}
                      </span>
                      <span className="font-extrabold text-slate-900">₹{it.price * it.quantity}</span>
                    </div>
                  ))}

                  {order.notes && (
                    <p className="text-[11px] text-slate-400 italic pt-1">
                      Note: "{order.notes}"
                    </p>
                  )}
                </div>

                {/* Delivery and Price Footer */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs text-slate-500">
                    <i className="fa-solid fa-location-dot text-rose-500 mr-1"></i>
                    <span className="font-semibold">{order.delivery_address}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Total</span>
                      <span className="text-base font-black text-rose-600">₹{order.total_amount}</span>
                    </div>

                    {vendor && (
                      <a
                        href={`tel:${vendor.phone}`}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
                      >
                        <i className="fa-solid fa-phone text-[10px] text-rose-600"></i>
                        <span>Call Shop</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
