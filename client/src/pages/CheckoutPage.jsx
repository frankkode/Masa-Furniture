import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

/* ── Stripe public key (replace with real key in .env) ─────────
   Vite exposes VITE_* env vars to the browser bundle.
   Set VITE_STRIPE_PK=pk_test_... in client/.env               */
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PK || 'pk_test_placeholder'
);

/* ── shipping defaults (overridden at runtime by /api/orders/shipping-cost) */
const DEFAULT_FREE_THRESHOLD = 100;
const DEFAULT_SHIPPING_FEE   = 9.90;

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize:        '15px',
      color:           '#1a1a2e',
      fontFamily:      'Inter, system-ui, sans-serif',
      fontSmoothing:   'antialiased',
      '::placeholder': { color: '#9ca3af' },
    },
    invalid: { color: '#ef4444', iconColor: '#ef4444' },
  },
};

/* ── step indicator ────────────────────────────────────────────── */
function StepBar({ step }) {
  const steps = ['Address', 'Review', 'Payment'];
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((label, i) => {
        const n      = i + 1;
        const active = n === step;
        const done   = n < step;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                ${done ? 'bg-green-500 text-white' : active ? 'bg-masa-accent text-white' : 'bg-gray-200 text-masa-gray'}`}>
                {done
                  ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  : n}
              </div>
              <span className={`text-xs font-medium ${active ? 'text-masa-accent' : done ? 'text-green-500' : 'text-masa-gray'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-16 h-0.5 mb-5 mx-1 ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── order summary sidebar ─────────────────────────────────────── */
function OrderSummary({ items, subtotal, shippingCost, discount, couponCode }) {
  const total = subtotal - discount + shippingCost;
  return (
    <div className="bg-masa-light rounded-2xl p-6">
      <h3 className="font-bold text-masa-dark text-base mb-4">
        Order Summary ({items.reduce((s, i) => s + i.quantity, 0)} items)
      </h3>
      <div className="flex flex-col gap-3 max-h-56 overflow-y-auto pr-1 mb-4">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-3 text-sm">
            <div className="relative shrink-0">
              <img
                src={item.image_url || '/chairs1.png'}
                alt={item.name}
                className="w-12 h-12 rounded-lg object-cover bg-white"
                onError={e => { e.target.src = '/chairs1.png'; }}
              />
              <span className="absolute -top-1.5 -right-1.5 bg-masa-accent text-white text-[10px] font-bold w-4.5 h-4.5 min-w-[1.1rem] min-h-[1.1rem] rounded-full flex items-center justify-center">
                {item.quantity}
              </span>
            </div>
            <span className="flex-1 text-masa-dark font-medium leading-snug line-clamp-2">{item.name}</span>
            <span className="shrink-0 text-masa-dark font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-masa-border pt-4 space-y-2 text-sm">
        <div className="flex justify-between text-masa-gray">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Coupon ({couponCode})</span>
            <span>-${discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-masa-gray">
          <span>Shipping</span>
          {shippingCost === 0
            ? <span className="text-green-600 font-medium">Free</span>
            : <span>${shippingCost.toFixed(2)}</span>}
        </div>
        <div className="flex justify-between font-bold text-base pt-1 border-t border-masa-border">
          <span className="text-masa-dark">Total</span>
          <span className="text-masa-accent">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Step 1: Address form ──────────────────────────────────────── */
function AddressStep({ address, onChange, onNext, savedAddrs = [], onSelectSaved }) {
  const fields = [
    { key: 'full_name',    label: 'Full Name',       placeholder: 'Jane Smith',          required: true,  col: 2 },
    { key: 'phone',        label: 'Phone',           placeholder: '+358 40 000 0000',    required: false, col: 1 },
    { key: 'street',       label: 'Street Address',  placeholder: 'Mannerheimintie 10',  required: true,  col: 2 },
    { key: 'city',         label: 'City',            placeholder: 'Helsinki',            required: true,  col: 1 },
    { key: 'state',        label: 'Region',          placeholder: 'Uusimaa',             required: false, col: 1 },
    { key: 'postal_code',  label: 'Postal Code',     placeholder: '00100',               required: false, col: 1 },
    { key: 'country',      label: 'Country',         placeholder: 'Finland',             required: true,  col: 1 },
  ];

  const handleSubmit = e => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-masa-dark mb-5">Shipping Address</h2>

      {/* saved address picker */}
      {savedAddrs.length > 0 && (
        <div className="mb-2">
          <label className="block text-sm font-semibold text-masa-dark mb-1.5">Use a saved address</label>
          <select
            onChange={e => { if (e.target.value) onSelectSaved(Number(e.target.value)); }}
            defaultValue=""
            className="w-full border border-masa-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-masa-accent transition-colors bg-white"
          >
            <option value="">— Select saved address —</option>
            {savedAddrs.map(a => (
              <option key={a.id} value={a.id}>
                {a.full_name} · {a.street}, {a.city}{a.is_default ? ' (default)' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {fields.map(f => (
          <div key={f.key} className={f.col === 2 ? 'col-span-2' : 'col-span-1'}>
            <label className="block text-sm font-semibold text-masa-dark mb-1">
              {f.label} {f.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={address[f.key] || ''}
              onChange={e => onChange(f.key, e.target.value)}
              placeholder={f.placeholder}
              required={f.required}
              className="w-full border border-masa-border rounded-xl px-4 py-2.5 text-sm text-masa-dark
                         focus:outline-none focus:border-masa-accent transition-colors placeholder-gray-400"
            />
          </div>
        ))}
      </div>
      <button type="submit" className="w-full btn-primary py-3.5 mt-2">
        Continue to Review
      </button>
    </form>
  );
}

/* ── Step 2: Review ─────────────────────────────────────────────── */
function ReviewStep({ address, onBack, onNext, loading }) {
  const addrLine1 = [address.street, address.city].filter(Boolean).join(', ');
  const addrLine2 = [address.state, address.country, address.postal_code].filter(Boolean).join(', ');

  return (
    <div>
      <h2 className="text-xl font-bold text-masa-dark mb-5">Review Your Order</h2>

      {/* shipping address review */}
      <div className="border border-masa-border rounded-xl p-5 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-masa-gray mb-2">Ship to</p>
            <p className="font-semibold text-masa-dark">{address.full_name}</p>
            {address.phone && <p className="text-sm text-masa-gray">{address.phone}</p>}
            <p className="text-sm text-masa-gray mt-1">{addrLine1}</p>
            <p className="text-sm text-masa-gray">{addrLine2}</p>
          </div>
          <button
            onClick={onBack}
            className="text-sm text-masa-accent hover:underline font-medium"
          >
            Edit
          </button>
        </div>
      </div>

      {/* delivery info */}
      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-sm text-green-700">
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
        </svg>
        Estimated delivery: 3–5 business days · White-glove assembly included
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 btn-outline py-3.5"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={loading}
          className="flex-1 btn-primary py-3.5 flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading
            ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Creating order…</>
            : 'Continue to Payment'}
        </button>
      </div>
    </div>
  );
}

/* ── Step 3: Payment (inner — must be inside <Elements>) ────────── */
function PaymentForm({ clientSecret, orderId, onBack, onSuccess }) {
  const stripe   = useStripe();
  const elements = useElements();
  const { user } = useAuth();

  const [paying,  setPaying]  = useState(false);
  const [cardErr, setCardErr] = useState('');

  const handlePay = async e => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true);
    setCardErr('');

    const card = elements.getElement(CardElement);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card,
        billing_details: { name: user?.username || 'Guest' },
      },
    });

    if (error) {
      setCardErr(error.message || 'Payment failed. Please try again.');
      setPaying(false);
      return;
    }

    if (paymentIntent.status === 'succeeded') {
      /* notify backend as a fallback (webhook handles primary confirmation) */
      try {
        await api.post('/payments/confirm', {
          order_id:          orderId,
          payment_intent_id: paymentIntent.id,
        });
      } catch {
        /* webhook will handle it — non-fatal */
      }
      onSuccess(orderId);
    }
  };

  return (
    <form onSubmit={handlePay}>
      <h2 className="text-xl font-bold text-masa-dark mb-5">Payment</h2>

      {/* Stripe test mode notice */}
      <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-700">
        <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <strong>Test mode</strong> — use card <code className="bg-blue-100 px-1 rounded">4242 4242 4242 4242</code>,
          any future expiry and any 3-digit CVC.
        </div>
      </div>

      {/* card element */}
      <div className="border border-masa-border rounded-xl px-4 py-4 mb-2 focus-within:border-masa-accent transition-colors bg-white">
        <CardElement options={CARD_ELEMENT_OPTIONS} onChange={() => setCardErr('')} />
      </div>

      {cardErr && (
        <p className="text-red-500 text-sm mt-2 mb-3 flex items-center gap-1.5">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {cardErr}
        </p>
      )}

      {/* secure payment badge */}
      <div className="flex items-center gap-2 text-xs text-masa-gray mt-3 mb-5">
        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        Secured by Stripe · Your card details are never stored on our servers
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 btn-outline py-3.5"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!stripe || paying}
          className="flex-1 btn-primary py-3.5 flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {paying
            ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Processing…</>
            : <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Pay Now
              </>}
        </button>
      </div>
    </form>
  );
}

/* ════════════════════════════════════════════════════════════════
   CheckoutPage
════════════════════════════════════════════════════════════════ */
export default function CheckoutPage() {
  const { items, total: subtotal, clearCart, hydrated } = useCart();
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  // Persist coupon + checkout progress in sessionStorage so a
  // page refresh doesn't lose the user's place mid-checkout.
  const CHECKOUT_KEY = 'masa_checkout';
  const loadCheckout = () => {
    try { return JSON.parse(sessionStorage.getItem(CHECKOUT_KEY)) || {}; }
    catch { return {}; }
  };
  const saved = loadCheckout();

  const couponCode = location.state?.couponCode || saved.couponCode || null;
  const discount   = location.state?.discount   || saved.discount   || 0;

  const [shippingFee,      setShippingFee]      = useState(DEFAULT_SHIPPING_FEE);
  const [freeThreshold,    setFreeThreshold]    = useState(DEFAULT_FREE_THRESHOLD);
  const shippingCost = subtotal >= freeThreshold ? 0 : shippingFee;

  const [step,         setStep]         = useState(saved.step || 1);
  const [address,     setAddress]      = useState(saved.address || {
    full_name: user?.username || '', phone: '', street: '', city: '',
    state: '', postal_code: '', country: 'Finland',
  });
  const [clientSecret, setClientSecret] = useState(saved.clientSecret || '');
  const [orderId,      setOrderId]      = useState(saved.orderId || null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError,   setOrderError]   = useState('');
  const [savedAddrs,   setSavedAddrs]   = useState([]);

  // Save checkout progress to sessionStorage on every state change
  useEffect(() => {
    sessionStorage.setItem(CHECKOUT_KEY, JSON.stringify({
      step, address, clientSecret, orderId, couponCode, discount,
    }));
  }, [step, address, clientSecret, orderId, couponCode, discount]);

  /* redirect if cart is truly empty (wait for server sync first) */
  useEffect(() => {
    if (hydrated && items.length === 0) navigate('/cart');
  }, [hydrated, items, navigate]);

  /* fetch live shipping settings from backend */
  useEffect(() => {
    api.get('/orders/shipping-cost')
      .then(r => {
        if (r.data.fee       != null) setShippingFee(r.data.fee);
        if (r.data.threshold != null) setFreeThreshold(r.data.threshold);
      })
      .catch(() => { /* keep defaults */ });
  }, []);

  /* auto-fill from saved default address when user is logged in */
  useEffect(() => {
    if (!user) return;
    api.get('/auth/addresses')
      .then(r => {
        const addrs = r.data.addresses || [];
        setSavedAddrs(addrs);
        const def = addrs.find(a => a.is_default) || addrs[0];
        if (def) {
          setAddress({
            full_name:   def.full_name   || user?.username || '',
            phone:       def.phone       || '',
            street:      def.street      || '',
            city:        def.city        || '',
            state:       def.state       || '',
            postal_code: def.postal_code || '',
            country:     def.country     || 'Finland',
          });
        }
      })
      .catch(() => {});
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddressChange = (key, val) =>
    setAddress(prev => ({ ...prev, [key]: val }));

  const handleSelectSaved = useCallback(id => {
    const a = savedAddrs.find(x => x.id === id);
    if (!a) return;
    setAddress({
      full_name:   a.full_name   || '',
      phone:       a.phone       || '',
      street:      a.street      || '',
      city:        a.city        || '',
      state:       a.state       || '',
      postal_code: a.postal_code || '',
      country:     a.country     || 'Finland',
    });
  }, [savedAddrs]);

  /* Step 1 → 2 */
  const handleAddressNext = () => setStep(2);

  /* Step 2 → 3: create order and payment intent */
  const handleReviewNext = async () => {
    setOrderLoading(true);
    setOrderError('');
    try {
      /* create order — include per-item color/size selections from cart */
      const items_meta = items
        .filter(i => i.color || i.size)
        .map(i => ({ product_id: i.product_id, color: i.color || undefined, size: i.size || undefined }));

      const orderRes = await api.post('/orders', {
        shipping_address: address,
        coupon_code:      couponCode || undefined,
        items_meta:       items_meta.length ? items_meta : undefined,
        notes:            undefined,
      });
      const newOrderId = orderRes.data.order_id;
      setOrderId(newOrderId);

      /* create payment intent */
      const intentRes = await api.post('/payments/create-intent', { order_id: newOrderId });
      setClientSecret(intentRes.data.client_secret);

      setStep(3);
    } catch (err) {
      setOrderError(err.response?.data?.error || 'Could not create your order. Please try again.');
    } finally {
      setOrderLoading(false);
    }
  };

  /* payment success — clear cart + checkout session state */
  const handlePaySuccess = id => {
    clearCart();
    sessionStorage.removeItem(CHECKOUT_KEY);
    navigate(`/order/${id}`);
  };

  // Show spinner until cart data is loaded from server/cache
  if (!hydrated || items.length === 0) return null;

  return (
    <div className="bg-white min-h-screen">
      {/* breadcrumb */}
      <div className="border-b border-masa-border bg-masa-light py-3">
        <nav className="container-main text-sm text-masa-gray flex items-center gap-1.5">
          <Link to="/" className="hover:text-masa-accent">Home</Link>
          <span>/</span>
          <Link to="/cart" className="hover:text-masa-accent">Cart</Link>
          <span>/</span>
          <span className="text-masa-dark font-medium">Checkout</span>
        </nav>
      </div>

      <div className="container-main py-10 max-w-5xl">
        <h1 className="text-3xl font-bold text-masa-dark mb-2">Checkout</h1>
        <p className="text-masa-gray text-sm mb-8">Complete your order in just a few steps.</p>

        <StepBar step={step} />

        {orderError && (
          <div className="mb-6 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {orderError}
          </div>
        )}

        <div className="grid lg:grid-cols-5 gap-10">
          {/* left: form steps */}
          <div className="lg:col-span-3">
            {step === 1 && (
              <AddressStep
                address={address}
                onChange={handleAddressChange}
                onNext={handleAddressNext}
                savedAddrs={savedAddrs}
                onSelectSaved={handleSelectSaved}
              />
            )}
            {step === 2 && (
              <ReviewStep
                address={address}
                onBack={() => setStep(1)}
                onNext={handleReviewNext}
                loading={orderLoading}
              />
            )}
            {step === 3 && clientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm
                  clientSecret={clientSecret}
                  orderId={orderId}
                  onBack={() => setStep(2)}
                  onSuccess={handlePaySuccess}
                />
              </Elements>
            )}
          </div>

          {/* right: order summary */}
          <div className="lg:col-span-2">
            <OrderSummary
              items={items}
              subtotal={subtotal}
              shippingCost={shippingCost}
              discount={discount}
              couponCode={couponCode}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
