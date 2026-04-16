import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

/* ── star rating ─────────────────────────────────────────────── */
function Stars({ rating = 0 }) {
  const filled = Math.round(rating);
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <svg key={n} className={`w-3.5 h-3.5 ${n <= filled ? 'text-masa-accent' : 'text-gray-300'}`}
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
    <div className="flex flex-col">
      {/* floating image — no card wrapper, just sits on section bg */}
      <Link to={`/product/${product.id}`}
        className="block overflow-hidden aspect-square flex items-center justify-center mb-3">
        <img
          src={imgSrc}
          alt={product.name}
          className="h-full w-full object-contain hover:scale-105 transition-transform duration-500 drop-shadow-md"
          onError={e => { e.target.src = `https://picsum.photos/seed/${product.id + 10}/300/260`; }}
        />
      </Link>

      {/* white info card */}
      <div className="bg-white rounded-2xl px-4 py-4 shadow-sm flex flex-col gap-1.5">
        <p className="text-xs text-masa-gray capitalize">
          {product.category_name || product.category || 'Chair'}
        </p>
        <Link to={`/product/${product.id}`}
          className="font-bold text-masa-dark text-sm leading-snug hover:text-masa-accent transition-colors">
          {product.name}
        </Link>
        <Stars rating={product.avg_rating || 5} />
        <div className="flex items-center justify-between mt-2">
          <span className="font-bold text-masa-dark text-base">
            <sup className="text-xs font-normal mr-0.5">$</sup>{Number(product.price).toFixed(0)}
          </span>
          <button
            onClick={handleAdd}
            disabled={adding}
            className="w-9 h-9 rounded-full bg-masa-dark text-white flex items-center justify-center
                       hover:bg-gray-800 transition-colors disabled:opacity-60 shadow"
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
    </div>
  );
}

/* ── product skeleton ────────────────────────────────────────── */
function ProductSkeleton() {
  return (
    <div className="flex flex-col animate-pulse">
      <div className="bg-gray-200 rounded-xl aspect-square mb-3" />
      <div className="bg-white rounded-2xl px-4 py-4 shadow-sm">
        <div className="h-2.5 bg-gray-100 rounded w-1/4 mb-2" />
        <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
        <div className="h-2.5 bg-gray-100 rounded w-1/3 mb-3" />
        <div className="flex justify-between items-center">
          <div className="h-4 bg-gray-100 rounded w-1/5" />
          <div className="w-9 h-9 bg-gray-100 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/* ── section label ───────────────────────────────────────────── */
function SectionLabel({ children }) {
  return (
    <p className="text-masa-accent text-xs font-bold tracking-[0.2em] uppercase mb-3">
      {children}
    </p>
  );
}

/* ── "More info" link ────────────────────────────────────────── */
function MoreInfo({ to = '/shop' }) {
  return (
    <Link to={to}
      className="inline-flex items-center gap-2 text-xs font-semibold text-masa-accent hover:gap-3 transition-all mt-3">
      More Info
      <span className="flex-1 inline-block w-8 h-px bg-masa-accent" />
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
      </svg>
    </Link>
  );
}

/* ── product category tabs ───────────────────────────────────── */
const TABS = [
  { label: 'Chair', value: 'chairs' },
  { label: 'Beds',  value: 'beds'   },
  { label: 'Sofa',  value: 'sofas'  },
  { label: 'Lamp',  value: 'lamp'   },
];

/* ── testimonials data ───────────────────────────────────────── */
const TESTIMONIALS = [
  {
    name:  'Bang Upin',
    role:  'Pedagang Asongan',
    quote: '"Terimakasih banyak, kini ruanganku menjadi lebih mewah dan terlihat mahal!"',
    rating: 4,
    roomImg:   'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&q=80',
    avatarImg: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80',
    avatarColor: '#e07b39',
  },
  {
    name:  'Ibuk Sukijen',
    role:  'Ibu Rumah Tangga',
    quote: '"Makasih Panto, aku sekarang berasa tinggal di apartment karena barang-barang yang terlihat mewah"',
    rating: 4,
    roomImg:   'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80',
    avatarImg: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    avatarColor: '#4a9edd',
  },
  {
    name:  'Mpok Ina',
    role:  'Karyawan Swasta',
    quote: '"Sangat terjangkau untuk kantong saya yang tidak terlalu banyak"',
    rating: 4,
    roomImg:   'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500&q=80',
    avatarImg: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&q=80',
    avatarColor: '#e07b39',
  },
];

/* ════════════════════════════════════════════════════════════════
   HomePage
════════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const navigate = useNavigate();
  const [search,       setSearch]      = useState('');
  const [activeTab,    setActiveTab]   = useState('chairs');
  const [products,     setProducts]    = useState([]);
  const [loadingProd,  setLoadingProd] = useState(true);
  const [testimIdx,    setTestimIdx]   = useState(0);
  const [carouselStart,setCarouselStart] = useState(0);

  /* fetch products */
  const fetchProducts = useCallback(() => {
    setLoadingProd(true);
    setCarouselStart(0);
    const params = new URLSearchParams({ category: activeTab, limit: '8' });

    api.get(`/products?${params}`)
      .then(res => setProducts(res.data.products || res.data || []))
      .catch(() => {
        setProducts([
          { id: 1, name: 'Sakarias Armchair', price: 392, category_name: 'Chair', avg_rating: 5 },
          { id: 2, name: 'Baltsar Chair',      price: 299, category_name: 'Chair', avg_rating: 5 },
          { id: 3, name: 'Anjay Chair',        price: 519, category_name: 'Chair', avg_rating: 5 },
          { id: 4, name: 'Nyantuy Chair',      price: 921, category_name: 'Chair', avg_rating: 5 },
          { id: 5, name: 'Oslo Armchair',      price: 450, category_name: 'Chair', avg_rating: 4 },
          { id: 6, name: 'Mono Chair',         price: 310, category_name: 'Chair', avg_rating: 4 },
          { id: 7, name: 'Arc Chair',          price: 620, category_name: 'Chair', avg_rating: 5 },
          { id: 8, name: 'Luno Chair',         price: 280, category_name: 'Chair', avg_rating: 4 },
        ]);
      })
      .finally(() => setLoadingProd(false));
  }, [activeTab]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  /* testimonial auto-advance (mobile) */
  useEffect(() => {
    const t = setInterval(() => setTestimIdx(i => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const handleSearch = e => {
    e.preventDefault();
    if (search.trim()) navigate(`/shop?q=${encodeURIComponent(search.trim())}`);
  };

  const VISIBLE = 4;
  const visibleProducts = products.slice(carouselStart, carouselStart + VISIBLE);
  const canPrev = carouselStart > 0;
  const canNext = carouselStart + VISIBLE < products.length;

  return (
    <div className="overflow-x-hidden">

      {/* ═══════════════════════════════════════════════
          1. HERO — dark charcoal, centered, full-bleed
      ═══════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden"
        style={{ background: '#1e1e1e' }}>

        {/* vertical panel lines — prominent dark wood slat look */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg,
              rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 2px,
              transparent 2px, transparent 52px)`,
          }}
        />

        {/* hero image — large room scene, high opacity */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1800&q=85"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center center', opacity: 0.75 }}
            onError={() => {}}
          />
          {/* subtle top vignette so text stays readable */}
          <div className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(30,30,30,0.6) 0%, rgba(30,30,30,0.15) 40%, rgba(30,30,30,0.3) 100%)',
            }}
          />
        </div>

        {/* centered content */}
        <div className="relative z-10 w-full flex flex-col items-center text-center px-4 py-32">
          <h1 className="text-white text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-5 max-w-4xl">
            Make Your Interior More<br />
            Minimalistic &amp; Modern
          </h1>
          <p className="text-white/70 text-base md:text-lg leading-relaxed mb-10 max-w-lg">
            Turn your room with Masa into a lot more minimalist<br className="hidden md:block" />
            and modern with ease and speed
          </p>

          {/* search bar — white pill + orange circle button */}
          <form onSubmit={handleSearch}
            className="flex items-center bg-white rounded-full shadow-2xl pl-6 pr-1.5 py-1.5 w-full max-w-sm">
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
      </section>

      {/* ═══════════════════════════════════════
          2. WHY CHOOSING US
      ═══════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="container-main">
          <div className="grid md:grid-cols-4 gap-10 items-start">

            {/* left title */}
            <div className="md:col-span-1">
              <h2 className="text-3xl font-bold text-masa-dark leading-snug">
                Why<br />Choosing Us
              </h2>
            </div>

            {/* 3 text columns */}
            <div className="md:col-span-3 grid sm:grid-cols-3 gap-10">
              {[
                {
                  title: 'Luxury facilities',
                  desc:  'The advantage of hiring a workspace with us is that givees you comfortable service and all-around facilities.',
                  to:    '/about',
                },
                {
                  title: 'Affordable Price',
                  desc:  'You can get a workspace of the highst quality at an affordable price and still enjoy the facilities that are oly here.',
                  to:    '/shop',
                },
                {
                  title: 'Many Choices',
                  desc:  'We provide many unique work space choices so that you can choose the workspace to your liking.',
                  to:    '/shop',
                },
              ].map(item => (
                <div key={item.title}>
                  <h3 className="font-bold text-masa-dark text-base mb-2">{item.title}</h3>
                  <p className="text-masa-gray text-sm leading-relaxed">{item.desc}</p>
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
          <h2 className="text-3xl md:text-4xl font-bold text-masa-dark text-center mb-8">
            Best Selling Product
          </h2>

          {/* category tabs — pill group, active = white pill */}
          <div className="flex items-center justify-center mb-12">
            <div className="inline-flex items-center gap-1 bg-white rounded-full p-1 shadow-sm">
              {TABS.map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`px-5 py-2 text-sm rounded-full transition-all font-medium
                    ${activeTab === tab.value
                      ? 'bg-gray-100 text-masa-dark shadow-sm font-semibold'
                      : 'text-masa-gray hover:text-masa-dark'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* carousel */}
          <div className="relative px-6">
            {/* prev arrow */}
            <button
              onClick={() => setCarouselStart(s => Math.max(0, s - 1))}
              disabled={!canPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white
                         shadow-md flex items-center justify-center text-masa-dark
                         disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
            </button>

            {/* product grid */}
            {loadingProd ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {visibleProducts.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}

            {/* next arrow */}
            <button
              onClick={() => setCarouselStart(s => s + 1)}
              disabled={!canNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white
                         shadow-md flex items-center justify-center text-masa-dark
                         disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

          {/* view all — orange */}
          <div className="flex justify-center mt-12">
            <Link to="/shop"
              className="inline-flex items-center gap-3 text-sm font-semibold text-masa-accent
                         hover:gap-4 transition-all">
              View All
              <span className="inline-block w-8 h-px bg-masa-accent" />
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          4. EXPERIENCES — left photo bleeds to edge
      ═══════════════════════════════════════ */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container-main grid md:grid-cols-2 gap-16 items-center">

          {/* left: room photo — extends to viewport left edge */}
          <div className="relative -ml-4 md:-ml-[calc((100vw-100%)/2+1.5rem)] rounded-r-3xl overflow-hidden shadow-xl"
            style={{ aspectRatio: '4/3' }}>
            <img
              src="https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=900&q=80"
              alt="Dark modern living room with sofa and plant"
              className="w-full h-full object-cover"
              onError={e => { e.target.src = 'https://picsum.photos/seed/exp1/900/675'; }}
            />
          </div>

          {/* right: text */}
          <div>
            <SectionLabel>Experiences</SectionLabel>
            <h2 className="text-4xl md:text-5xl font-bold text-masa-dark leading-tight mb-5">
              We Provide You The<br />Best Experience
            </h2>
            <p className="text-masa-gray text-base leading-relaxed mb-1">
              You don't have to worry about the result because all of these interiors are made
              by people who are professionals in their fields with an elegant and luxurious style
              and with premium quality materials
            </p>
            <MoreInfo to="/about" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          5. MATERIALS — 2 stacked left, 1 tall right
      ═══════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="container-main grid md:grid-cols-2 gap-16 items-center">

          {/* left: text */}
          <div>
            <SectionLabel>Materials</SectionLabel>
            <h2 className="text-4xl md:text-5xl font-bold text-masa-dark leading-tight mb-5">
              Very Serious<br />Materials For Making<br />Furniture
            </h2>
            <p className="text-masa-gray text-base leading-relaxed mb-1">
              Because Masa was very serious about designing furniture for our environment,
              using a very expensive and famous capital but at a relatively low price
            </p>
            <MoreInfo to="/shop" />
          </div>

          {/* right: 3-photo collage — 2 stacked left col, 1 tall right col */}
          <div className="grid grid-cols-2 grid-rows-2 gap-4" style={{ height: '420px' }}>

            {/* top-left: smaller chair/office photo */}
            <div className="rounded-2xl overflow-hidden shadow-md">
              <img
                src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&q=80"
                alt="Modern chairs in bright office"
                className="w-full h-full object-cover"
                onError={e => { e.target.src = 'https://picsum.photos/seed/mat1/400/200'; }}
              />
            </div>

            {/* bottom-left: teal sofa green wall */}
            <div className="rounded-2xl overflow-hidden shadow-md">
              <img
                src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&q=80"
                alt="Teal sofa with green wall"
                className="w-full h-full object-cover"
                onError={e => { e.target.src = 'https://picsum.photos/seed/mat2/400/200'; }}
              />
            </div>

            {/* right col — tall, spans 2 rows: dining with warm amber chairs */}
            <div className="row-span-2 col-start-2 row-start-1 rounded-2xl overflow-hidden shadow-md">
              <img
                src="https://images.unsplash.com/photo-1617806118233-18e1de247200?w=500&q=80"
                alt="Dining room with warm amber chairs"
                className="w-full h-full object-cover"
                onError={e => { e.target.src = 'https://picsum.photos/seed/mat3/400/420'; }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          6. TESTIMONIALS
      ═══════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="container-main">

          {/* heading */}
          <div className="text-center mb-14">
            <SectionLabel>Testimonials</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-bold text-masa-dark">Our Client Reviews</h2>
          </div>

          {/* cards */}
          <div className="relative">
            {/* prev arrow */}
            <button
              onClick={() => setTestimIdx(i => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
              className="absolute -left-5 top-1/3 z-10 w-10 h-10 rounded-full bg-white border border-gray-200
                         shadow flex items-center justify-center text-masa-dark hover:shadow-md transition-shadow"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
            </button>

            {/* desktop: 3 columns */}
            <div className="hidden md:grid grid-cols-3 gap-6">
              {TESTIMONIALS.map((t, i) => <TestimonialCard key={i} t={t} />)}
            </div>

            {/* mobile: single card with dots */}
            <div className="md:hidden">
              <TestimonialCard t={TESTIMONIALS[testimIdx]} />
              <div className="flex justify-center gap-2 mt-5">
                {TESTIMONIALS.map((_, i) => (
                  <button key={i} onClick={() => setTestimIdx(i)}
                    className={`w-2 h-2 rounded-full transition-colors
                      ${i === testimIdx ? 'bg-masa-accent' : 'bg-gray-300'}`} />
                ))}
              </div>
            </div>

            {/* next arrow */}
            <button
              onClick={() => setTestimIdx(i => (i + 1) % TESTIMONIALS.length)}
              className="absolute -right-5 top-1/3 z-10 w-10 h-10 rounded-full bg-white border border-gray-200
                         shadow flex items-center justify-center text-masa-dark hover:shadow-md transition-shadow"
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

/* ── testimonial card — room photo + avatar overlap + white text box ── */
function TestimonialCard({ t }) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      {/* room photo */}
      <div className="relative" style={{ aspectRatio: '4/3' }}>
        <img
          src={t.roomImg}
          alt={`Room — ${t.name}`}
          className="w-full h-full object-cover"
          onError={e => { e.target.src = `https://picsum.photos/seed/${t.name}/500/375`; }}
        />
        {/* avatar circle overlapping bottom edge */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-10">
          <div className="w-14 h-14 rounded-full border-4 border-white overflow-hidden shadow-md"
            style={{ backgroundColor: t.avatarColor }}>
            <img
              src={t.avatarImg}
              alt={t.name}
              className="w-full h-full object-cover"
              onError={e => {
                e.target.style.display = 'none';
                e.target.parentElement.style.display = 'flex';
                e.target.parentElement.style.alignItems = 'center';
                e.target.parentElement.style.justifyContent = 'center';
                e.target.parentElement.innerHTML = `<span style="color:white;font-weight:bold;font-size:14px">${t.name.split(' ').map(w=>w[0]).join('')}</span>`;
              }}
            />
          </div>
        </div>
      </div>

      {/* text area — extra top padding to clear the avatar */}
      <div className="bg-white pt-10 pb-5 px-5 text-center">
        <p className="font-bold text-masa-dark text-sm">{t.name}</p>
        <p className="text-masa-gray text-xs mb-2">{t.role}</p>
        <p className="text-masa-dark text-xs leading-relaxed italic mb-3">{t.quote}</p>
        <div className="flex justify-center">
          <Stars rating={t.rating} />
        </div>
      </div>
    </div>
  );
}
