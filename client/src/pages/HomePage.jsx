import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

/* ── star rating (small) ─────────────────────────────────────── */
function Stars({ rating = 0 }) {
  const filled = Math.round(rating);
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <svg key={n} className={`w-3 h-3 ${n <= filled ? 'text-masa-accent' : 'text-gray-300'}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

/* ── product card — Figma style ──────────────────────────────── */
function ProductCard({ product }) {
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);

  const handleAdd = async e => {
    e.preventDefault();
    setAdding(true);
    await addItem(product.id, 1);
    setAdding(false);
  };

  const imgSrc = product.image_url || `https://picsum.photos/seed/${product.id}/300/260`;

  return (
    <div className="bg-white rounded-2xl p-4 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow">
      {/* product image */}
      <Link to={`/product/${product.id}`}
        className="block overflow-hidden rounded-xl bg-gray-50 aspect-[4/3] flex items-center justify-center">
        <img
          src={imgSrc}
          alt={product.name}
          className="h-full w-full object-contain p-3 hover:scale-105 transition-transform duration-500"
          onError={e => { e.target.src = `https://picsum.photos/seed/${product.id + 10}/300/260`; }}
        />
      </Link>

      {/* category */}
      <p className="text-xs text-masa-gray capitalize mt-1">
        {product.category_name || product.category || 'Chair'}
      </p>

      {/* name */}
      <Link to={`/product/${product.id}`}
        className="font-bold text-masa-dark text-sm leading-snug hover:text-masa-accent transition-colors">
        {product.name}
      </Link>

      {/* stars */}
      <Stars rating={product.avg_rating || 4} />

      {/* price + add button */}
      <div className="flex items-center justify-between mt-1">
        <span className="font-bold text-masa-dark text-base">
          ${Number(product.price).toFixed(0)}
        </span>
        <button
          onClick={handleAdd}
          disabled={adding}
          className="w-8 h-8 rounded-full bg-masa-accent text-white flex items-center justify-center
                     hover:bg-orange-600 transition-colors disabled:opacity-60 shadow-md"
          aria-label="Add to cart"
        >
          {adding ? (
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

/* ── product skeleton ────────────────────────────────────────── */
function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 animate-pulse">
      <div className="bg-gray-100 rounded-xl aspect-[4/3] mb-3" />
      <div className="h-2.5 bg-gray-100 rounded w-1/4 mb-2" />
      <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
      <div className="h-2.5 bg-gray-100 rounded w-1/3 mb-3" />
      <div className="flex justify-between items-center">
        <div className="h-4 bg-gray-100 rounded w-1/5" />
        <div className="w-8 h-8 bg-gray-100 rounded-full" />
      </div>
    </div>
  );
}

/* ── section label ───────────────────────────────────────────── */
function SectionLabel({ children }) {
  return (
    <p className="text-masa-accent text-xs font-bold tracking-[0.2em] uppercase mb-2">
      {children}
    </p>
  );
}

/* ── "More info" link ────────────────────────────────────────── */
function MoreInfo({ to = '/shop' }) {
  return (
    <Link to={to}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-masa-accent hover:gap-2.5 transition-all mt-2">
      More info
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
      </svg>
    </Link>
  );
}

/* ── product category tabs ───────────────────────────────────── */
const TABS = [
  { label: 'Chair', value: 'chairs' },
  { label: 'Beds',  value: 'beds'   },
  { label: 'Sofas', value: 'sofas'  },
  { label: 'Lamp',  value: 'lamp'   },
];

/* ── testimonials data ───────────────────────────────────────── */
const TESTIMONIALS = [
  {
    name: 'Bang Upin',
    role: 'Interior Designer',
    quote: 'Terminati nonumy, ius nonumy lorem nonumy. Tempor eos lorem nonumy et tempor.',
    rating: 4,
    roomImg: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
    avatar: 'BU',
    avatarColor: '#e07b39',
  },
  {
    name: 'Ibuk Sukijen',
    role: 'Homeowner',
    quote: 'Maecen Panto, ius nonumy lorem nonumy. Tempor annoncy lorem et nonumy maecenas.',
    rating: 4,
    roomImg: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80',
    avatar: 'IS',
    avatarColor: '#4a9edd',
  },
  {
    name: 'Mpok Ira',
    role: 'Architect',
    quote: 'Sagitt feugiate ultrices lorem donec lorem. Sed ut perspiciatis unde omnis iste natus.',
    rating: 5,
    roomImg: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&q=80',
    avatar: 'MI',
    avatarColor: '#e07b39',
  },
];

/* ════════════════════════════════════════════════════════════════
   HomePage
════════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const navigate = useNavigate();
  const [search,      setSearch]     = useState('');
  const [activeTab,   setActiveTab]  = useState('chairs');
  const [products,    setProducts]   = useState([]);
  const [loadingProd, setLoadingProd]= useState(true);
  const [testimIdx,   setTestimIdx]  = useState(0);
  const [carouselStart, setCarouselStart] = useState(0);

  /* fetch products */
  const fetchProducts = useCallback(() => {
    setLoadingProd(true);
    setCarouselStart(0);
    const params = new URLSearchParams({ category: activeTab, limit: '8' });

    api.get(`/products?${params}`)
      .then(res => setProducts(res.data.products || res.data || []))
      .catch(() => {
        setProducts(Array.from({ length: 4 }, (_, i) => ({
          id: i + 1,
          name: ['Sakarias Armchair','Baltsar Chair','Anjay Chair','Nyantuy Chair'][i],
          price: [392, 299, 519, 921][i],
          category_name: 'Chair',
          avg_rating: 4,
          review_count: 12,
        })));
      })
      .finally(() => setLoadingProd(false));
  }, [activeTab]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  /* testimonial auto-advance */
  useEffect(() => {
    const t = setInterval(() => setTestimIdx(i => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const handleSearch = e => {
    e.preventDefault();
    if (search.trim()) navigate(`/shop?q=${encodeURIComponent(search.trim())}`);
  };

  /* carousel: show 4 at a time */
  const VISIBLE = 4;
  const visibleProducts = products.slice(carouselStart, carouselStart + VISIBLE);
  const canPrev = carouselStart > 0;
  const canNext = carouselStart + VISIBLE < products.length;

  return (
    <div className="overflow-x-hidden">

      {/* ═══════════════════════════════════════
          1. HERO — dark full-bleed background
      ═══════════════════════════════════════ */}
      <section className="relative min-h-[88vh] flex flex-col justify-center overflow-hidden"
        style={{ background: '#1a1a2e' }}>

        {/* dark vertical panel texture overlay — mimics wall panel lines */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg,
              rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px,
              transparent 1px, transparent 56px)`,
          }}
        />

        {/* hero background image — sofa fills right side */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&q=80"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover opacity-50"
            style={{ objectPosition: 'center 40%' }}
            onError={() => {}}
          />
          {/* gradient so left text is readable */}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(90deg, rgba(26,26,46,0.92) 0%, rgba(26,26,46,0.55) 60%, rgba(26,26,46,0.2) 100%)' }}
          />
        </div>

        {/* floating decorative circles (top left — matches Figma: green / amber / blue) */}
        <div className="absolute top-20 left-8 flex gap-2 z-10">
          <span className="w-3.5 h-3.5 rounded-full" style={{ background: '#4ecdc4' }} />
          <span className="w-3.5 h-3.5 rounded-full" style={{ background: '#e07b39' }} />
          <span className="w-3.5 h-3.5 rounded-full" style={{ background: '#6c9fd4' }} />
        </div>

        {/* content */}
        <div className="container-main relative z-10 py-24">
          <div className="max-w-2xl">
            <h1 className="text-white text-5xl md:text-6xl font-bold leading-tight mb-5">
              Make Your Interior More<br />
              <span className="text-white">Minimalistic &amp; Modern</span>
            </h1>
            <p className="text-white/60 text-base md:text-lg leading-relaxed mb-10 max-w-md">
              Turn your room with Masa into a lot more minimalist and modern with ease and speed.
            </p>

            {/* search bar — white pill + orange circle button (Figma) */}
            <form onSubmit={handleSearch}
              className="flex items-center max-w-sm bg-white rounded-full shadow-xl pl-5 pr-1.5 py-1.5">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search furniture"
                className="flex-1 text-sm text-masa-dark placeholder-gray-400
                           focus:outline-none bg-transparent min-w-0"
              />
              <button type="submit"
                className="shrink-0 w-9 h-9 rounded-full bg-masa-accent text-white
                           hover:bg-orange-600 transition-colors flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 leading-none">
          <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 48L1440 48L1440 16C1200 48 960 0 720 16C480 32 240 0 0 16L0 48Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          2. WHY CHOOSING US
      ═══════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="container-main">
          <div className="grid md:grid-cols-4 gap-10 items-start">

            {/* left title */}
            <div className="md:col-span-1">
              <h2 className="text-2xl font-bold text-masa-dark leading-snug">
                Why<br />Choosing Us
              </h2>
            </div>

            {/* 3 columns */}
            <div className="md:col-span-3 grid sm:grid-cols-3 gap-8">
              {[
                {
                  title: 'Luxury Facilities',
                  desc:  'The advantage of having a workspace with us is that gives you comfortable service and all-around facilities.',
                  to:    '/about',
                },
                {
                  title: 'Affordable Price',
                  desc:  'You can get a workspace of the highest quality, at an affordable price and still enjoy the facilities that we rely here.',
                  to:    '/shop',
                },
                {
                  title: 'Many Choices',
                  desc:  'We provide many unique work space choices so that you can choose the workspace to your liking.',
                  to:    '/shop',
                },
              ].map(item => (
                <div key={item.title}>
                  <h3 className="font-bold text-masa-dark text-sm mb-2">{item.title}</h3>
                  <p className="text-masa-gray text-xs leading-relaxed mb-1">{item.desc}</p>
                  <MoreInfo to={item.to} />
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          3. BEST SELLING PRODUCT
      ═══════════════════════════════════════ */}
      <section className="py-20 bg-masa-light">
        <div className="container-main">

          {/* heading */}
          <h2 className="text-3xl font-bold text-masa-dark text-center mb-8">
            Best Selling Product
          </h2>

          {/* category tabs */}
          <div className="flex items-center justify-center gap-1 mb-10">
            {TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-5 py-1.5 text-sm rounded-full transition-all font-medium
                  ${activeTab === tab.value
                    ? 'text-masa-dark border-b-2 border-masa-dark font-bold rounded-none px-3'
                    : 'text-masa-gray hover:text-masa-dark'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* carousel with arrows */}
          <div className="relative">
            {/* prev arrow */}
            <button
              onClick={() => setCarouselStart(s => Math.max(0, s - 1))}
              disabled={!canPrev}
              className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white
                         shadow-md flex items-center justify-center text-masa-dark
                         disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
            </button>

            {/* product grid */}
            {loadingProd ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {visibleProducts.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}

            {/* next arrow */}
            <button
              onClick={() => setCarouselStart(s => s + 1)}
              disabled={!canNext}
              className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white
                         shadow-md flex items-center justify-center text-masa-dark
                         disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

          {/* view all */}
          <div className="flex justify-center mt-10">
            <Link to="/shop"
              className="inline-flex items-center gap-2 text-sm font-semibold text-masa-dark
                         border-b border-masa-dark hover:text-masa-accent hover:border-masa-accent
                         transition-colors pb-0.5">
              View All
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          4. EXPERIENCES
      ═══════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="container-main grid md:grid-cols-2 gap-12 items-center">

          {/* left: dark atmospheric room photo — matches Figma */}
          <div className="rounded-2xl overflow-hidden shadow-lg aspect-[4/3]">
            <img
              src="https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80"
              alt="Dark modern living room"
              className="w-full h-full object-cover"
              onError={e => { e.target.src = 'https://picsum.photos/seed/exp1/800/600'; }}
            />
          </div>

          {/* right: text */}
          <div>
            <SectionLabel>Experiences</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-bold text-masa-dark leading-tight mb-4">
              We Provide You The<br />Best Experience
            </h2>
            <p className="text-masa-gray text-sm leading-relaxed mb-2">
              You don't have to worry about the result because all of these interiors are made
              by people who are professionals in their fields with an elegant and luxurious style
              and with premium quality materials.
            </p>
            <MoreInfo to="/about" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          5. MATERIALS
      ═══════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="container-main grid md:grid-cols-2 gap-12 items-center">

          {/* left: text */}
          <div>
            <SectionLabel>Materials</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-bold text-masa-dark leading-tight mb-4">
              Very Serious<br />Materials For Making<br />Furniture
            </h2>
            <p className="text-masa-gray text-sm leading-relaxed mb-2">
              Because Masa was very serious about designing furniture for our environment,
              using a very expensive and famous capital but at a relatively low price.
            </p>
            <MoreInfo to="/shop" />
          </div>

          {/* right: 3-photo collage — 2 stacked left, 1 tall right (matches Figma) */}
          <div className="grid grid-cols-2 grid-rows-2 gap-3" style={{ height: '380px' }}>
            {/* top-left small */}
            <div className="rounded-2xl overflow-hidden shadow">
              <img
                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80"
                alt="Sofa detail"
                className="w-full h-full object-cover"
                onError={e => { e.target.src = 'https://picsum.photos/seed/mat1/400/200'; }}
              />
            </div>
            {/* bottom-left small */}
            <div className="rounded-2xl overflow-hidden shadow">
              <img
                src="https://images.unsplash.com/photo-1549497538-303791108f95?w=400&q=80"
                alt="Teal sofa"
                className="w-full h-full object-cover"
                onError={e => { e.target.src = 'https://picsum.photos/seed/mat2/400/200'; }}
              />
            </div>
            {/* right column — tall, spans 2 rows */}
            <div className="row-span-2 col-start-2 row-start-1 rounded-2xl overflow-hidden shadow">
              <img
                src="https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400&q=80"
                alt="Dining room with warm chairs"
                className="w-full h-full object-cover"
                onError={e => { e.target.src = 'https://picsum.photos/seed/mat3/400/400'; }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          6. TESTIMONIALS
      ═══════════════════════════════════════ */}
      <section className="py-20 bg-masa-light">
        <div className="container-main">

          {/* heading */}
          <div className="text-center mb-12">
            <SectionLabel>Testimonials</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-bold text-masa-dark">Our Client Reviews</h2>
          </div>

          {/* cards — desktop 3-col, mobile carousel */}
          <div className="relative">
            {/* prev */}
            <button
              onClick={() => setTestimIdx(i => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
              className="absolute -left-4 top-1/3 z-10 w-9 h-9 rounded-full bg-white shadow-md
                         flex items-center justify-center text-masa-dark hover:shadow-lg transition-shadow"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
            </button>

            <div className="hidden md:grid grid-cols-3 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <TestimonialCard key={i} t={t} />
              ))}
            </div>

            {/* mobile: single card */}
            <div className="md:hidden">
              <TestimonialCard t={TESTIMONIALS[testimIdx]} />
              <div className="flex justify-center gap-2 mt-5">
                {TESTIMONIALS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTestimIdx(i)}
                    className={`w-2 h-2 rounded-full transition-colors
                      ${i === testimIdx ? 'bg-masa-accent' : 'bg-masa-border'}`}
                  />
                ))}
              </div>
            </div>

            {/* next */}
            <button
              onClick={() => setTestimIdx(i => (i + 1) % TESTIMONIALS.length)}
              className="absolute -right-4 top-1/3 z-10 w-9 h-9 rounded-full bg-white shadow-md
                         flex items-center justify-center text-masa-dark hover:shadow-lg transition-shadow"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}

/* ── testimonial card component ─────────────────────────────── */
function TestimonialCard({ t }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-masa-border bg-white shadow-sm">
      {/* room photo */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={t.roomImg}
          alt={`Room by ${t.name}`}
          className="w-full h-full object-cover"
          onError={e => { e.target.src = `https://picsum.photos/seed/${t.name}/400/300`; }}
        />
        {/* avatar overlapping bottom */}
        <div className="absolute bottom-0 left-1/2 translate-y-1/2 -translate-x-1/2">
          <div
            className="w-12 h-12 rounded-full border-4 border-white flex items-center justify-center
                       text-white text-sm font-bold shadow-md"
            style={{ backgroundColor: t.avatarColor }}
          >
            {t.avatar}
          </div>
        </div>
      </div>

      {/* text content */}
      <div className="pt-8 pb-5 px-5 text-center">
        <p className="font-bold text-masa-dark text-sm">{t.name}</p>
        <p className="text-xs text-masa-gray mb-2">{t.role}</p>
        <div className="flex justify-center mb-3">
          <Stars rating={t.rating} />
        </div>
        <p className="text-xs text-masa-gray leading-relaxed italic">"{t.quote}"</p>
      </div>
    </div>
  );
}
