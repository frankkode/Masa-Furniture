import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function OrderConfirmPage() {
  const { id }   = useParams();
  const [order,  setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(res => setOrder(res.data))
      .catch(() => {
        /* fallback for development */
        setOrder({
          id,
          status:        'confirmed',
          total_price:   499.00,
          subtotal:      474.00,
          shipping_cost: 25.00,
          created_at:    new Date().toISOString(),
          items: [
            { id: 1, name: 'Nordic Lounge Chair', quantity: 1, unit_price: 349, image_url: null, product_id: 1 },
            { id: 2, name: 'Arc Floor Lamp',       quantity: 1, unit_price: 189, image_url: null, product_id: 4 },
          ],
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container-main py-32 text-center">
        <svg className="w-10 h-10 animate-spin text-masa-accent mx-auto" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    );
  }

  const statusColors = {
    confirmed:       'bg-green-100 text-green-700',
    pending:         'bg-yellow-100 text-yellow-700',
    payment_failed:  'bg-red-100 text-red-600',
    shipped:         'bg-blue-100 text-blue-700',
    delivered:       'bg-green-100 text-green-700',
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="container-main py-16 max-w-2xl">

        {/* success icon */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-5">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-masa-dark mb-2">Order Confirmed!</h1>
          <p className="text-masa-gray">
            Thank you for your order. We'll send you a confirmation email shortly.
          </p>
        </div>

        {/* order card */}
        <div className="border border-masa-border rounded-2xl overflow-hidden mb-8">
          {/* header */}
          <div className="bg-masa-light px-6 py-4 flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-xs text-masa-gray uppercase tracking-widest font-semibold mb-0.5">Order ID</p>
              <p className="font-bold text-masa-dark text-lg">#{String(order.id).padStart(6, '0')}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
              {order.status?.replace('_', ' ')}
            </span>
          </div>

          {/* items */}
          <div className="divide-y divide-masa-border px-6">
            {(order.items || []).map(item => (
              <div key={item.id} className="flex items-center gap-4 py-4">
                <img
                  src={item.image_url || `https://picsum.photos/seed/${item.product_id}/80/80`}
                  alt={item.name}
                  className="w-14 h-14 rounded-lg object-cover bg-masa-light shrink-0"
                  onError={e => { e.target.src = `https://picsum.photos/seed/${item.product_id + 2}/80/80`; }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-masa-dark text-sm truncate">{item.name}</p>
                  <p className="text-xs text-masa-gray">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold text-masa-dark shrink-0">
                  ${(item.unit_price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          {/* totals */}
          <div className="bg-masa-light px-6 py-4 space-y-2 text-sm">
            {order.subtotal != null && (
              <div className="flex justify-between text-masa-gray">
                <span>Subtotal</span>
                <span>${Number(order.subtotal).toFixed(2)}</span>
              </div>
            )}
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-${Number(order.discount_amount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-masa-gray">
              <span>Shipping</span>
              {order.shipping_cost === 0
                ? <span className="text-green-600">Free</span>
                : <span>${Number(order.shipping_cost).toFixed(2)}</span>}
            </div>
            <div className="flex justify-between font-bold text-base border-t border-masa-border pt-2">
              <span className="text-masa-dark">Total Paid</span>
              <span className="text-masa-accent">${Number(order.total_price).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* delivery info */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8 text-sm text-blue-700">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
          </svg>
          <div>
            <p className="font-semibold mb-0.5">Estimated Delivery: 3–5 Business Days</p>
            <p className="text-blue-500">White-glove delivery and assembly included with your order.</p>
          </div>
        </div>

        {/* actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/dashboard/orders" className="flex-1 btn-primary text-center py-3">
            View My Orders
          </Link>
          <Link to="/shop" className="flex-1 btn-outline text-center py-3">
            Continue Shopping
          </Link>
        </div>

      </div>
    </div>
  );
}
