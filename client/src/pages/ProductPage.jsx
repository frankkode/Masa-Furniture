import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard, { StarRating } from '../components/ProductCard';

/* ── colour options (presented as finish options) ────────────── */
const FINISHES = [
  { label: 'Natural Oak',  hex: '#c8a96e' },
  { label: 'Dark Walnut',  hex: '#5c3d1e' },
  { label: 'Matte White',  hex: '#f5f5f0' },
  { label: 'Midnight Black', hex: '#1a1a2e' },
];

/* ── helpers ──────────────────────────────────────────────────── */
function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function ReviewStars({ value, interactive = false, onSet }) {
  const [hover, setHover] = useState(0);
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type={interactive ? 'button' : undefined}
          disabled={!interactive}
          onClick={() => interactive && onSet(n)}
          onMouseEnter={() => interactive && setHover(n)}
          onMouseLeave={() => interactive && setHover(0)}
          className={`${interactive ? 'cursor-pointer' : 'cursor-default pointer-events-none'}`}
        >
          <svg
            className={`w-5 h-5 transition-colors ${
              n <= (hover || value) ? 'text-masa-accent' : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </span>
  );
}

/* ── skeleton ─────────────────────────────────────────────────── */
function ProductSkeleton() {
  return (
    <div className="container-main py-10 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-56 mb-8" />
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <div className="bg-gray-200 rounded-2xl aspect-square mb-4" />
          <div className="flex gap-2">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="w-20 h-20 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-3 bg-gray-200 rounded w-24" />
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-10 bg-gray-200 rounded w-1/4 mt-4" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-12 bg-gray-200 rounded-full w-full mt-6" />
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   ProductPage
════════════════════════════════════════════════════════════════ */
export default function ProductPage() {
  const { id }           = useParams();
  const navigate         = useNavigate();
  const [searchParams]   = useSearchParams();
  const { addItem }  = useCart();
  const { user }     = useAuth();

  /* ── data state ── */
  const [product,  setProduct]  = useState(null);
  const [related,  setRelated]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  /* ── UI state ── */
  const [activeImg,   setActiveImg]   = useState(0);
  const [activeFinish, setActiveFinish] = useState(0);
  const [qty,         setQty]         = useState(1);
  const [adding,      setAdding]      = useState(false);
  const [addedMsg,    setAddedMsg]    = useState(false);
  // auto-switch to reviews tab if ?tab=reviews is in the URL (e.g. from "Write Review" link in orders)
  const [activeTab,   setActiveTab]   = useState(
    searchParams.get('tab') === 'reviews' ? 'reviews' : 'description'
  ); // description | specs | reviews

  /* ── review form state ── */
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle,  setReviewTitle]  = useState('');
  const [reviewBody,   setReviewBody]   = useState('');
  const [submitting,   setSubmitting]   = useState(false);
  const [reviewError,  setReviewError]  = useState('');
  const [reviewOk,     setReviewOk]     = useState(false);

  /* fetch product */
  useEffect(() => {
    setLoading(true);
    setError(null);
    setActiveImg(0);
    setQty(1);
    setActiveTab(searchParams.get('tab') === 'reviews' ? 'reviews' : 'description');

    api.get(`/products/${id}`)
      .then(res => {
        setProduct(res.data);
        /* fetch related */
        const slug = res.data.category_slug || res.data.category;
        if (slug) {
          api.get(`/products?category=${slug}&limit=4`)
            .then(r => {
              const all = r.data.products || r.data || [];
              setRelated(all.filter(p => p.id !== res.data.id).slice(0, 4));
            })
            .catch(() => {});
        }
      })
      .catch(err => {
        if (err.response?.status === 404) {
          setError('Product not found.');
        } else {
          /* fallback product for development */
          setProduct({
            id: Number(id),
            name: 'Nordic Lounge Chair',
            category_name: 'Chairs',
            category_slug: 'chairs',
            price: 349,
            description: 'A beautifully crafted Nordic lounge chair combining solid oak legs with premium linen upholstery. Designed for long evenings, thoughtful conversations, and quiet mornings with a good book.',
            stock_qty: 12,
            avg_rating: 4.5,
            reviews: [
              {
                id: 1, username: 'sophie_w', rating: 5,
                title: 'Absolutely love it',
                body: 'Arrived perfectly packaged and looks even better in person. The linen fabric is so soft.',
                created_at: new Date().toISOString(),
              },
              {
                id: 2, username: 'james_o', rating: 4,
                title: 'Great quality',
                body: 'Solid construction, assembly was straightforward. Took off one star only because delivery was a day late.',
                created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
              },
            ],
            images: [],
          });
          setRelated(
            Array.from({ length: 4 }, (_, i) => ({
              id: i + 100,
              name: ['Oslo Bed Frame', 'Milan Sofa', 'Arc Lamp', 'Oak Coffee Table'][i],
              price: [899, 1199, 189, 449][i],
              category_name: 'Furniture',
              avg_rating: 4 + (i % 2) * 0.5,
              review_count: [18, 31, 12, 7][i],
            }))
          );
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  /* add to cart */
  const handleAddToCart = async () => {
    setAdding(true);
    await addItem(product.id, qty);
    setAdding(false);
    setAddedMsg(true);
    setTimeout(() => setAddedMsg(false), 2500);
  };

  /* submit review */
  const handleReviewSubmit = async e => {
    e.preventDefault();
    if (reviewRating === 0) { setReviewError('Please select a star rating.'); return; }
    setSubmitting(true);
    setReviewError('');
    try {
      await api.post(`/products/${id}/reviews`, {
        rating: reviewRating,
        title: reviewTitle.trim() || undefined,
        body:  reviewBody.trim()  || undefined,
      });
      setReviewOk(true);
      setReviewRating(0);
      setReviewTitle('');
      setReviewBody('');
      /* re-fetch to get new review */
      const res = await api.get(`/products/${id}`);
      setProduct(res.data);
    } catch (err) {
      setReviewError(err.response?.data?.error || 'Could not submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── render states ── */
  if (loading) return <ProductSkeleton />;

  if (error) {
    return (
      <div className="container-main py-32 text-center flex flex-col items-center gap-4">
        <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-2xl font-bold text-masa-dark">{error}</h2>
        <button onClick={() => navigate('/shop')} className="btn-primary mt-2">Back to Shop</button>
      </div>
    );
  }

  /* build image list */
  const images = (product.images && product.images.length > 0)
    ? product.images
    : [{ image_url: '/chairs1.png', alt_text: product.name, is_primary: 1 }];

  const mainSrc = images[activeImg]?.image_url || '/chairs1.png';

  const reviews    = product.reviews || [];
  const avgRating  = product.avg_rating || 0;
  const ratingCount = reviews.length;

  /* rating breakdown */
  const breakdown = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct:   ratingCount > 0 ? Math.round(reviews.filter(r => r.rating === star).length / ratingCount * 100) : 0,
  }));

  return (
    <div className="bg-white">

      {/* ── breadcrumb ── */}
      <div className="border-b border-masa-border bg-masa-light py-3">
        <nav className="container-main text-sm text-masa-gray flex items-center gap-1.5">
          <Link to="/"     className="hover:text-masa-accent transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-masa-accent transition-colors">Shop</Link>
          {product.category_name && (
            <>
              <span>/</span>
              <Link
                to={`/shop/${product.category_slug}`}
                className="hover:text-masa-accent transition-colors capitalize"
              >
                {product.category_name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-masa-dark font-medium truncate max-w-[180px]">{product.name}</span>
        </nav>
      </div>

      {/* ══════════════════════════════════════════════════
          MAIN PRODUCT SECTION
      ══════════════════════════════════════════════════ */}
      <section className="container-main py-12">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">

          {/* ── LEFT: image gallery ── */}
          <div>
            {/* main image */}
            <div className="relative rounded-2xl overflow-hidden bg-masa-light aspect-square mb-4 shadow-sm group">
              <img
                key={mainSrc}
                src={mainSrc}
                alt={images[activeImg]?.alt_text || product.name}
                className="w-full h-full object-cover transition-opacity duration-300"
                onError={e => { e.target.src = '/chairs1.png'; }}
              />
              {/* prev / next arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80
                               shadow-md flex items-center justify-center text-masa-dark opacity-0
                               group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setActiveImg(i => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80
                               shadow-md flex items-center justify-center text-masa-dark opacity-0
                               group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
              {/* stock badge */}
              {product.stock_qty !== undefined && product.stock_qty <= 5 && product.stock_qty > 0 && (
                <span className="absolute top-3 left-3 bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full">
                  Only {product.stock_qty} left
                </span>
              )}
            </div>

            {/* thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all
                      ${activeImg === i
                        ? 'border-masa-accent shadow-md scale-105'
                        : 'border-transparent hover:border-masa-border'
                      }`}
                  >
                    <img
                      src={img.image_url}
                      alt={img.alt_text || product.name}
                      className="w-full h-full object-cover"
                      onError={e => { e.target.src = '/chairs1.png'; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: product info ── */}
          <div className="flex flex-col">

            {/* category tag */}
            <p className="section-label mb-2">{product.category_name || 'Furniture'}</p>

            {/* name */}
            <h1 className="text-3xl lg:text-4xl font-bold text-masa-dark mb-3 leading-tight">
              {product.name}
            </h1>

            {/* rating row */}
            <div className="flex items-center gap-3 mb-5">
              <ReviewStars value={Math.round(avgRating)} />
              <span className="text-sm text-masa-gray">
                {avgRating > 0 ? avgRating.toFixed(1) : 'No ratings'} · {ratingCount} review{ratingCount !== 1 ? 's' : ''}
              </span>
            </div>

            {/* price */}
            <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-masa-border">
              <span className="text-4xl font-bold text-masa-accent">
                ${Number(product.price).toFixed(2)}
              </span>
              {product.compare_price && Number(product.compare_price) > Number(product.price) && (
                <span className="text-lg text-masa-gray line-through">
                  ${Number(product.compare_price).toFixed(2)}
                </span>
              )}
            </div>

            {/* short description */}
            {product.description && (
              <p className="text-masa-gray leading-relaxed mb-6">
                {product.description.slice(0, 240)}{product.description.length > 240 ? '…' : ''}
              </p>
            )}

            {/* finish selector */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-masa-dark mb-3">
                Finish: <span className="font-normal text-masa-gray">{FINISHES[activeFinish].label}</span>
              </p>
              <div className="flex gap-2.5">
                {FINISHES.map((f, i) => (
                  <button
                    key={f.label}
                    onClick={() => setActiveFinish(i)}
                    title={f.label}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      activeFinish === i ? 'border-masa-accent scale-110 shadow-md' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: f.hex }}
                  />
                ))}
              </div>
            </div>

            {/* qty + add to cart */}
            <div className="flex items-center gap-4 mb-6">
              {/* qty stepper */}
              <div className="flex items-center border border-masa-border rounded-full overflow-hidden">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-masa-dark hover:bg-masa-light transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="w-10 text-center text-sm font-semibold text-masa-dark">{qty}</span>
                <button
                  onClick={() => setQty(q => Math.min(product.stock_qty || 99, q + 1))}
                  className="w-10 h-10 flex items-center justify-center text-masa-dark hover:bg-masa-light transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              {/* add button */}
              <button
                onClick={handleAddToCart}
                disabled={adding || (product.stock_qty !== undefined && product.stock_qty === 0)}
                className="flex-1 flex items-center justify-center gap-2 btn-primary py-3 text-base
                           disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {adding ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Adding…
                  </>
                ) : addedMsg ? (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.6 8H19M9 21a1 1 0 100-2 1 1 0 000 2zm10 0a1 1 0 100-2 1 1 0 000 2z" />
                    </svg>
                    {product.stock_qty === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </>
                )}
              </button>
            </div>

            {/* trust signals */}
            <div className="grid grid-cols-3 gap-3 pt-5 border-t border-masa-border">
              {[
                { icon: '🚚', label: 'Free Delivery' },
                { icon: '↩️', label: '30-Day Returns' },
                { icon: '🛡️', label: '5-Year Warranty' },
              ].map(t => (
                <div key={t.label} className="flex flex-col items-center text-center gap-1">
                  <span className="text-xl">{t.icon}</span>
                  <span className="text-xs text-masa-gray font-medium">{t.label}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          TABS: Description | Specs | Reviews
      ══════════════════════════════════════════════════ */}
      <section className="border-t border-masa-border">
        <div className="container-main">
          {/* tab bar */}
          <div className="flex border-b border-masa-border -mb-px">
            {[
              { id: 'description', label: 'Description' },
              { id: 'specs',       label: 'Specifications' },
              { id: 'reviews',     label: `Reviews (${ratingCount})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-semibold transition-colors border-b-2 -mb-px
                  ${activeTab === tab.id
                    ? 'border-masa-accent text-masa-accent'
                    : 'border-transparent text-masa-gray hover:text-masa-dark'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* tab panels */}
          <div className="py-10">

            {/* description */}
            {activeTab === 'description' && (
              <div className="max-w-3xl">
                <p className="text-masa-gray leading-relaxed text-base">
                  {product.description || 'No description available for this product.'}
                </p>
                <div className="mt-8 grid sm:grid-cols-2 gap-6">
                  {[
                    { label: 'SKU',       value: `MSA-${String(product.id).padStart(4, '0')}` },
                    { label: 'Category',  value: product.category_name || '—' },
                    { label: 'In Stock',  value: product.stock_qty != null ? `${product.stock_qty} units` : '—' },
                    { label: 'Shipping',  value: 'Free white-glove delivery' },
                  ].map(row => (
                    <div key={row.label} className="flex gap-3">
                      <span className="text-sm font-semibold text-masa-dark w-24 shrink-0">{row.label}</span>
                      <span className="text-sm text-masa-gray">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* specs */}
            {activeTab === 'specs' && (
              <div className="max-w-2xl">
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      ['Dimensions',   'W 85cm × D 82cm × H 77cm'],
                      ['Seat Height',  '44cm'],
                      ['Weight',       '18 kg'],
                      ['Frame',        'Solid European oak'],
                      ['Upholstery',   'Belgian linen, OEKO-TEX certified'],
                      ['Filling',      'High-resilience foam + feather top'],
                      ['Finish',       'Water-based lacquer, UV-resistant'],
                      ['Assembly',     'Minimal — legs attach in under 5 minutes'],
                      ['Care',         'Spot clean with damp cloth; fabric removable for washing'],
                      ['Warranty',     '5 years on frame · 2 years on upholstery'],
                    ].map(([key, val], i) => (
                      <tr key={key} className={i % 2 === 0 ? 'bg-masa-light' : 'bg-white'}>
                        <td className="px-4 py-3 font-semibold text-masa-dark w-40">{key}</td>
                        <td className="px-4 py-3 text-masa-gray">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* reviews */}
            {activeTab === 'reviews' && (
              <div className="max-w-3xl">

                {/* summary */}
                {ratingCount > 0 && (
                  <div className="flex flex-col sm:flex-row gap-10 mb-10 p-6 bg-masa-light rounded-2xl">
                    {/* big number */}
                    <div className="flex flex-col items-center justify-center gap-1 shrink-0">
                      <span className="text-6xl font-bold text-masa-dark">{avgRating.toFixed(1)}</span>
                      <ReviewStars value={Math.round(avgRating)} />
                      <span className="text-xs text-masa-gray mt-1">{ratingCount} review{ratingCount !== 1 ? 's' : ''}</span>
                    </div>
                    {/* bar breakdown */}
                    <div className="flex-1 flex flex-col gap-2">
                      {breakdown.map(b => (
                        <div key={b.star} className="flex items-center gap-3 text-sm">
                          <span className="w-3 text-masa-gray text-right">{b.star}</span>
                          <svg className="w-4 h-4 text-masa-accent shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-masa-accent h-2 rounded-full transition-all duration-500"
                              style={{ width: `${b.pct}%` }}
                            />
                          </div>
                          <span className="text-masa-gray w-8 text-right">{b.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* review list — card with product-image background */}
                {ratingCount === 0 && (
                  <p className="text-masa-gray text-sm mb-8">No reviews yet — be the first to leave one!</p>
                )}
                <div className="grid sm:grid-cols-2 gap-4 mb-12">
                  {reviews.map(r => (
                    <div key={r.id} className="relative rounded-2xl overflow-hidden min-h-[200px]">
                      {/* blurred product image as background */}
                      <div className="absolute inset-0">
                        <img src={mainSrc} alt="" aria-hidden="true"
                          className="w-full h-full object-cover scale-110 blur-sm"
                          onError={e => { e.target.style.display='none'; }}/>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/65 to-black/45"/>
                      </div>

                      {/* card content */}
                      <div className="relative p-5 flex flex-col gap-3 h-full">
                        {/* top row: avatar + name + verified */}
                        <div className="flex items-center gap-3">
                          {/* profile pic */}
                          <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white/30 shrink-0 bg-masa-accent">
                            {r.avatar_url
                              ? <img src={r.avatar_url} alt={r.username}
                                  className="w-full h-full object-cover"
                                  onError={e => { e.target.style.display='none'; }}/>
                              : <span className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                                  {r.username?.[0]?.toUpperCase() || 'U'}
                                </span>
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold text-sm truncate leading-none">{r.username}</p>
                            <p className="text-white/55 text-xs mt-0.5">{formatDate(r.created_at)}</p>
                          </div>
                          {/* verified purchase badge */}
                          <span className="flex items-center gap-1 text-xs bg-green-500/20 border border-green-400/40
                            text-green-300 px-2 py-0.5 rounded-full shrink-0 font-medium">
                            <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                            Verified
                          </span>
                        </div>

                        {/* stars */}
                        <ReviewStars value={r.rating} />

                        {/* title */}
                        {r.title && (
                          <p className="text-white font-bold text-base leading-snug">{r.title}</p>
                        )}

                        {/* body */}
                        {r.body && (
                          <p className="text-white/75 text-sm leading-relaxed line-clamp-4">{r.body}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* write review form */}
                <div className="border-t border-masa-border pt-8">
                  <h3 className="text-lg font-bold text-masa-dark mb-5">Write a Review</h3>

                  {/* not logged in */}
                  {!user && (
                    <div className="flex items-center gap-3 bg-masa-light rounded-xl p-5">
                      <svg className="w-5 h-5 text-masa-gray shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                      </svg>
                      <p className="text-sm text-masa-gray">
                        Please{' '}
                        <Link to="/login" className="text-masa-accent font-semibold hover:underline">sign in</Link>
                        {' '}to leave a review.
                      </p>
                    </div>
                  )}

                  {/* logged in but hasn't bought */}
                  {user && !product.purchased_by_user && !reviewOk && (
                    <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-5">
                      <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.6 8H19M9 21a1 1 0 100-2 1 1 0 000 2zm10 0a1 1 0 100-2 1 1 0 000 2z"/>
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-amber-800">Purchase required</p>
                        <p className="text-xs text-amber-700 mt-0.5">
                          Only customers who have bought this product can leave a review.{' '}
                          <Link to="/shop" className="font-semibold hover:underline">Shop now →</Link>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* review submitted success */}
                  {user && reviewOk && (
                    <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-5 text-green-700 text-sm">
                      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                      </svg>
                      Thank you! Your review has been submitted.
                    </div>
                  )}

                  {/* review form — only for verified purchasers */}
                  {user && product.purchased_by_user && !reviewOk && (
                    <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-masa-dark mb-2">Your Rating *</label>
                        <ReviewStars value={reviewRating} interactive onSet={setReviewRating} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-masa-dark mb-1">Title</label>
                        <input type="text" value={reviewTitle} onChange={e => setReviewTitle(e.target.value)}
                          placeholder="Summarise your experience" maxLength={120}
                          className="w-full border border-masa-border rounded-lg px-4 py-2.5 text-sm text-masa-dark focus:outline-none focus:border-masa-accent"/>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-masa-dark mb-1">Review</label>
                        <textarea value={reviewBody} onChange={e => setReviewBody(e.target.value)}
                          placeholder="What did you love about it? Any tips?" rows={4}
                          className="w-full border border-masa-border rounded-lg px-4 py-2.5 text-sm text-masa-dark focus:outline-none focus:border-masa-accent resize-none"/>
                      </div>
                      {reviewError && <p className="text-red-500 text-sm">{reviewError}</p>}
                      <button type="submit" disabled={submitting} className="self-start btn-primary disabled:opacity-60">
                        {submitting ? 'Submitting…' : 'Submit Review'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          RELATED PRODUCTS
      ══════════════════════════════════════════════════ */}
      {related.length > 0 && (
        <section className="py-16 bg-masa-light border-t border-masa-border">
          <div className="container-main">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="section-label mb-2">You May Also Like</p>
                <h2 className="text-2xl font-bold text-masa-dark">Related Products</h2>
              </div>
              <Link
                to={product.category_slug ? `/shop/${product.category_slug}` : '/shop'}
                className="text-sm font-semibold text-masa-accent hover:underline"
              >
                View all →
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
