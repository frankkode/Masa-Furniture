import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

/* ── helpers ──────────────────────────────────────────────────── */
const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_COST           = 25;

function shipping(subtotal) {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
}

/* ── CartItem row ─────────────────────────────────────────────── */
function CartItem({ item }) {
  const { updateQty, removeItem } = useCart();
  const [removing, setRemoving]   = useState(false);

  const imgSrc = item.image_url
    || `https://picsum.photos/seed/${item.product_id}/200/200`;

  const handleRemove = async () => {
    setRemoving(true);
    await removeItem(item.id);
  };

  return (
    <div className={`flex gap-4 py-5 border-b border-masa-border transition-opacity ${removing ? 'opacity-40' : ''}`}>
      {/* image */}
      <Link to={`/product/${item.product_id}`} className="shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-masa-light">
        <img
          src={imgSrc}
          alt={item.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          onError={e => { e.target.src = `https://picsum.photos/seed/${item.product_id + 5}/200/200`; }}
        />
      </Link>

      {/* info */}
      <div className="flex-1 min-w-0">
        <Link
          to={`/product/${item.product_id}`}
          className="font-semibold text-masa-dark text-sm hover:text-masa-accent transition-colors leading-snug block"
        >
          {item.name}
        </Link>
        <p className="text-xs text-masa-gray mt-0.5 capitalize">{item.category || 'Furniture'}</p>

        {/* qty stepper — mobile shows under name */}
        <div className="flex items-center gap-2 mt-3 md:hidden">
          <div className="flex items-center border border-masa-border rounded-full overflow-hidden">
            <button
              onClick={() => updateQty(item.id, item.quantity - 1)}
              className="w-8 h-8 flex items-center justify-center text-masa-dark hover:bg-masa-light"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
            <button
              onClick={() => updateQty(item.id, item.quantity + 1)}
              className="w-8 h-8 flex items-center justify-center text-masa-dark hover:bg-masa-light"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          <span className="text-sm font-bold text-masa-accent">
            ${(item.price * item.quantity).toFixed(2)}
          </span>
        </div>
      </div>

      {/* desktop: qty stepper */}
      <div className="hidden md:flex items-center border border-masa-border rounded-full overflow-hidden self-center">
        <button
          onClick={() => updateQty(item.id, item.quantity - 1)}
          className="w-9 h-9 flex items-center justify-center text-masa-dark hover:bg-masa-light transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <span className="w-9 text-center text-sm font-semibold text-masa-dark">{item.quantity}</span>
        <button
          onClick={() => updateQty(item.id, item.quantity + 1)}
          className="w-9 h-9 flex items-center justify-center text-masa-dark hover:bg-masa-light transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* desktop: line total */}
      <div className="hidden md:flex flex-col items-end justify-center shrink-0 w-24">
        <span className="font-bold text-masa-dark">${(item.price * item.quantity).toFixed(2)}</span>
        {item.quantity > 1 && (
          <span className="text-xs text-masa-gray">${Number(item.price).toFixed(2)} ea.</span>
        )}
      </div>

      {/* remove */}
      <button
        onClick={handleRemove}
        disabled={removing}
        className="self-start text-masa-gray hover:text-red-500 transition-colors p-1 shrink-0"
        title="Remove item"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CartPage
════════════════════════════════════════════════════════════════ */
export default function CartPage() {
  const { items, total: subtotal, loading, clearCart } = useCart();
  const { user }     = useAuth();
  const navigate     = useNavigate();
  const [coupon,     setCoupon]     = useState('');
  const [couponApplied, setCouponApplied] = useState(null); // null | { code, discount }
  const [couponError,   setCouponError]   = useState('');

  const shippingCost  = shipping(subtotal);
  const discount      = couponApplied?.discount || 0;
  const orderTotal    = subtotal - discount + shippingCost;

  const handleApplyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (!code) return;
    /* The real validation happens server-side on POST /api/orders.
       Show a tentative confirmation here for UX — server will reject invalid codes. */
    if (code === 'MASA10') {
      const d = Math.round(subtotal * 0.1 * 100) / 100;
      setCouponApplied({ code, discount: d });
      setCouponError('');
    } else if (code === 'FREESHIP') {
      setCouponApplied({ code, discount: shippingCost });
      setCouponError('');
    } else {
      setCouponApplied(null);
      setCouponError('Coupon code not recognised.');
    }
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login?next=/checkout');
    } else {
      navigate('/checkout', { state: { couponCode: couponApplied?.code } });
    }
  };

  /* ── empty cart ── */
  if (!loading && items.length === 0) {
    return (
      <div className="bg-white min-h-screen">
        <div className="border-b border-masa-border bg-masa-light py-3">
          <nav className="container-main text-sm text-masa-gray flex items-center gap-1.5">
            <Link to="/" className="hover:text-masa-accent">Home</Link>
            <span>/</span>
            <span className="text-masa-dark font-medium">Cart</span>
          </nav>
        </div>
        <div className="container-main py-32 text-center flex flex-col items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-masa-light flex items-center justify-center">
            <svg className="w-10 h-10 text-masa-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.6 8H19M9 21a1 1 0 100-2 1 1 0 000 2zm10 0a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-masa-dark">Your cart is empty</h2>
          <p className="text-masa-gray text-sm max-w-xs">
            Looks like you haven't added anything yet. Explore our collection and find something you love.
          </p>
          <Link to="/shop" className="btn-primary mt-2">Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* breadcrumb */}
      <div className="border-b border-masa-border bg-masa-light py-3">
        <nav className="container-main text-sm text-masa-gray flex items-center gap-1.5">
          <Link to="/" className="hover:text-masa-accent">Home</Link>
          <span>/</span>
          <span className="text-masa-dark font-medium">Cart ({items.length} item{items.length !== 1 ? 's' : ''})</span>
        </nav>
      </div>

      <div className="container-main py-10">
        <h1 className="text-3xl font-bold text-masa-dark mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-10">

          {/* ── LEFT: item list ── */}
          <div className="lg:col-span-2">
            {/* column headers (desktop) */}
            <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto] gap-4 pb-3 border-b border-masa-border text-xs font-bold uppercase tracking-widest text-masa-gray">
              <span>Product</span>
              <span className="w-28 text-center">Quantity</span>
              <span className="w-24 text-right">Total</span>
              <span className="w-6" />
            </div>

            {/* loading skeleton */}
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4 py-5 border-b border-masa-border animate-pulse">
                  <div className="w-24 h-24 bg-gray-200 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 bg-gray-200 rounded w-3/5" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
              ))
            ) : (
              items.map(item => <CartItem key={item.id} item={item} />)
            )}

            {/* actions row */}
            <div className="flex items-center justify-between pt-5">
              <Link
                to="/shop"
                className="flex items-center gap-2 text-sm font-medium text-masa-gray hover:text-masa-accent transition-colors group"
              >
                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                Continue Shopping
              </Link>
              <button
                onClick={() => clearCart()}
                className="text-sm text-red-400 hover:text-red-600 transition-colors"
              >
                Clear cart
              </button>
            </div>
          </div>

          {/* ── RIGHT: order summary ── */}
          <div>
            <div className="bg-masa-light rounded-2xl p-6 sticky top-24">
              <h2 className="text-lg font-bold text-masa-dark mb-5">Order Summary</h2>

              {/* line items */}
              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between text-masa-gray">
                  <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-medium text-masa-dark">${subtotal.toFixed(2)}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Coupon ({couponApplied.code})
                    </span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-masa-gray">
                  <span>Shipping</span>
                  {shippingCost === 0
                    ? <span className="text-green-600 font-medium">Free</span>
                    : <span className="font-medium text-masa-dark">${shippingCost.toFixed(2)}</span>
                  }
                </div>
                {shippingCost > 0 && (
                  <p className="text-xs text-masa-gray bg-white rounded-lg px-3 py-2">
                    Add ${(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2)} more for free shipping
                  </p>
                )}
              </div>

              <div className="border-t border-masa-border pt-4 mb-5">
                <div className="flex justify-between font-bold text-base">
                  <span className="text-masa-dark">Total</span>
                  <span className="text-masa-accent text-xl">${orderTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* coupon input */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-masa-gray uppercase tracking-widest mb-2">
                  Coupon Code
                </label>
                <div className="flex gap-0 rounded-lg overflow-hidden border border-masa-border">
                  <input
                    type="text"
                    value={coupon}
                    onChange={e => { setCoupon(e.target.value); setCouponError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                    placeholder="e.g. MASA10"
                    className="flex-1 px-3 py-2.5 text-sm text-masa-dark bg-white focus:outline-none placeholder-masa-gray"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="bg-masa-dark text-white text-sm font-semibold px-4 hover:bg-masa-accent transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
                {couponApplied && (
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-green-600 text-xs">Coupon applied!</p>
                    <button
                      onClick={() => { setCouponApplied(null); setCoupon(''); }}
                      className="text-xs text-masa-gray hover:text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* checkout button */}
              <button
                onClick={handleCheckout}
                className="w-full btn-primary py-3.5 text-base flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                {user ? 'Proceed to Checkout' : 'Sign In to Checkout'}
              </button>

              {/* trust signals */}
              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-masa-gray">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  SSL Secure
                </span>
                <span>·</span>
                <span>Stripe Payments</span>
                <span>·</span>
                <span>30-day returns</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
