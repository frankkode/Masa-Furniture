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

  const imgSrc = product.image_url || '/chairs1.png';

  return (
    <div className="flex flex-col">
      {/* floating image — no card wrapper, just sits on section bg */}
      <Link to={`/product/${product.id}`}
        className="block overflow-hidden aspect-square flex items-center justify-center mb-3">
        <img
          src={imgSrc}
          alt={product.name}
          className="h-full w-full object-contain hover:scale-105 transition-transform duration-500 drop-shadow-md"
          onError={e => { e.target.src = '/chairs1.png'; }}
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
    <p className="text-masa-accent-text text-xs font-bold tracking-[0.2em] uppercase mb-3">
      {children}
    </p>
  );
}

/* ── "More info" link ────────────────────────────────────────── */
function MoreInfo({ to = '/shop', label = 'More Info' }) {
  return (
    <Link to={to} aria-label={label}
      className="inline-flex items-center gap-2 text-xs font-semibold text-masa-accent hover:gap-3 transition-all mt-3">
      More Info
      <span className="flex-1 inline-block w-8 h-px bg-masa-accent" aria-hidden="true" />
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
      </svg>
    </Link>
  );
}

/* ── product category tabs ───────────────────────────────────── */
const TABS = [
  { label: 'Chair', value: 'chair' },
  { label: 'Beds',  value: 'beds'  },
  { label: 'Sofa',  value: 'sofas' },
  { label: 'Lamp',  value: 'lamp'  },
  { label: 'Table', value: 'table' },
  { label: 'Shelf', value: 'shelf' },
];

/* ── testimonials data ───────────────────────────────────────── */
const TESTIMONIALS = [
  {
    name:  'Anna M.',
    role:  'Interior Designer',
    quote: '"The quality of the furniture exceeded my expectations. Every piece feels premium and looks stunning in my clients\' homes."',
    rating: 5,
    roomImg:   '/mat-sofa.jpg',
    avatarColor: '#e07b39',
  },
  {
    name:  'James K.',
    role:  'Homeowner',
    quote: '"Finally found furniture that matches my minimalist taste without breaking the bank. The delivery was fast too!"',
    rating: 4,
    roomImg:   '/exp-room.jpg',
    avatarColor: '#4a9edd',
  },
  {
    name:  'Sarah L.',
    role:  'Architect',
    quote: '"Beautifully crafted pieces with attention to detail. The materials are top-notch and built to last."',
    rating: 5,
    roomImg:   '/mat-dining.jpg',
    avatarColor: '#6b8e5a',
  },
];

/* ════════════════════════════════════════════════════════════════
   HomePage
════════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const navigate = useNavigate();
  const [search,       setSearch]      = useState('');
  const [activeTab,    setActiveTab]   = useState('chair');
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
        // Offline / API-down fallback — 8 items per category so the
        // carousel arrows (showing 4 at a time) have something to scroll.
        const fallbacks = {
          chair: [
            { id: 1, name: 'Sakarias Armchair',          price: 392, category_name: 'Chair', avg_rating: 5, image_url: '/chairs1.png' },
            { id: 2, name: 'Baltsar Plaid Lounge Chair',  price: 459, category_name: 'Chair', avg_rating: 5, image_url: '/chairs2.png' },
            { id: 3, name: 'Comfor Dual-Tone Armchair',   price: 519, category_name: 'Chair', avg_rating: 5, image_url: '/chairs3.png' },
            { id: 4, name: 'Orbis Shell Chair',           price: 299, category_name: 'Chair', avg_rating: 5, image_url: '/chairs4.png' },
          ],
          beds: [
            { id: 5,  name: 'Velvet Upholstered Bed', price: 1490, category_name: 'Beds', avg_rating: 5, image_url: '/bed1.webp' },
            { id: 6,  name: 'Nordic Oak Platform Bed', price: 1290, category_name: 'Beds', avg_rating: 4, image_url: '/bed2.webp' },
            { id: 7,  name: 'Tufted Queen Bed',       price: 1150, category_name: 'Beds', avg_rating: 5, image_url: '/bed3.webp' },
            { id: 8,  name: 'Minimalist White Bed',    price: 890, category_name: 'Beds', avg_rating: 4, image_url: '/bed4.webp' },
            { id: 25, name: 'Walnut Storage Bed',     price: 1650, category_name: 'Beds', avg_rating: 5, image_url: '/bed5.webp' },
            { id: 26, name: 'Boucle Canopy Bed',      price: 2100, category_name: 'Beds', avg_rating: 5, image_url: '/bed6.webp' },
            { id: 27, name: 'Charcoal Linen Bed',     price: 1080, category_name: 'Beds', avg_rating: 4, image_url: '/bed7.webp' },
          ],
          sofas: [
            { id: 9,  name: 'Cloud Modular Sofa',     price: 2450, category_name: 'Sofas', avg_rating: 5, image_url: '/sofa1.webp' },
            { id: 10, name: 'Havana Leather Sofa',     price: 1890, category_name: 'Sofas', avg_rating: 5, image_url: '/sofa2.webp' },
            { id: 11, name: 'Sage Corner Sectional',   price: 2850, category_name: 'Sofas', avg_rating: 4, image_url: '/sofa3.webp' },
            { id: 12, name: 'Ivory Bouclé Loveseat',   price: 1350, category_name: 'Sofas', avg_rating: 5, image_url: '/sofa4.webp' },
            { id: 28, name: 'Midnight Velvet Sofa',    price: 2100, category_name: 'Sofas', avg_rating: 5, image_url: '/sofa5.webp' },
            { id: 29, name: 'Terracotta Daybed Sofa',  price: 1680, category_name: 'Sofas', avg_rating: 4, image_url: '/sofa6.webp' },
          ],
          lamp: [
            { id: 13, name: 'Octo Pendant Light',     price: 389, category_name: 'Lamp', avg_rating: 5, image_url: '/lamp1.webp' },
            { id: 14, name: 'Matte Black Arc Lamp',    price: 349, category_name: 'Lamp', avg_rating: 5, image_url: '/lamp2.webp' },
            { id: 15, name: 'Brass Mushroom Lamp',     price: 179, category_name: 'Lamp', avg_rating: 4, image_url: '/lamp3.webp' },
            { id: 16, name: 'Paper Lantern Pendant',   price: 129, category_name: 'Lamp', avg_rating: 4, image_url: '/lamp4.webp' },
            { id: 30, name: 'Industrial Cage Pendant', price: 149, category_name: 'Lamp', avg_rating: 4, image_url: '/lamp5.webp' },
            { id: 31, name: 'Ceramic Globe Lamp',      price: 219, category_name: 'Lamp', avg_rating: 5, image_url: '/lamp6.webp' },
            { id: 32, name: 'Tripod Floor Lamp',       price: 269, category_name: 'Lamp', avg_rating: 5, image_url: '/lamp7.webp' },
            { id: 33, name: 'Rattan Dome Pendant',     price: 199, category_name: 'Lamp', avg_rating: 4, image_url: '/lamp8.webp' },
          ],
          table: [
            { id: 17, name: 'Round Pedestal Table',    price: 420,  category_name: 'Table', avg_rating: 5, image_url: '/table1.webp' },
            { id: 18, name: 'Walnut Dining Table',     price: 1450, category_name: 'Table', avg_rating: 5, image_url: '/table2.webp' },
            { id: 19, name: 'Marble Side Table',       price: 380,  category_name: 'Table', avg_rating: 4, image_url: '/table3.webp' },
            { id: 20, name: 'Oak Extending Table',     price: 1680, category_name: 'Table', avg_rating: 5, image_url: '/table4.webp' },
            { id: 34, name: 'Hairpin Console Table',   price: 320,  category_name: 'Table', avg_rating: 4, image_url: '/table5.webp' },
            { id: 35, name: 'Glass-Top Nesting Tables', price: 490, category_name: 'Table', avg_rating: 5, image_url: '/table6.webp' },
            { id: 36, name: 'Concrete Outdoor Table',  price: 890,  category_name: 'Table', avg_rating: 4, image_url: '/table7.webp' },
          ],
          shelf: [
            { id: 21, name: 'Diamond Wall Shelf Set',     price: 285, category_name: 'Shelf', avg_rating: 5, image_url: '/shelf1.jpg' },
            { id: 22, name: 'Floating Minimalist Shelf',   price: 145, category_name: 'Shelf', avg_rating: 4, image_url: '/shelf2.jpg' },
            { id: 23, name: 'Minimalist Display Shelf',    price: 165, category_name: 'Shelf', avg_rating: 4, image_url: '/shelf3.jpg' },
            { id: 24, name: 'Framed Box Shelf',            price: 195, category_name: 'Shelf', avg_rating: 5, image_url: '/shelf4.jpg' },
          ],
        };
        setProducts(fallbacks[activeTab] || fallbacks.chair);
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
    <div>

      {/* ═══════════════════════════════════════════════════════
          1. HERO — full-viewport, transparent navbar floats over it.
             -mt-16 pulls section behind the 64px sticky navbar so the
             image starts at y=0 (very top of the screen).
             Bottom gradient fades to white to meet the next section.
      ═══════════════════════════════════════════════════════ */}
      <section
        className="relative -mt-16 flex flex-col justify-start overflow-hidden"
        style={{ background: '#fff', minHeight: '100vh' }}
      >
        {/* ── full-bleed background image ── */}
        <div className="absolute inset-0">
          <img
            src="/home.webp"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center center' }}
            onError={e => {
              e.target.onerror = null;
              e.target.src = '/mat-sofa.jpg';
            }}
          />

          {/* top dark gradient — covers navbar + full text block */}
          <div className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, rgba(10,10,10,0.78) 0%, rgba(10,10,10,0.55) 30%, rgba(10,10,10,0.20) 55%, transparent 72%)',
            }}
          />

          {/* bottom fade-to-white — blends into the white section below */}
          <div className="absolute inset-x-0 bottom-0 pointer-events-none"
            style={{
              height: '220px',
              background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.55) 45%, rgba(255,255,255,0.90) 75%, #ffffff 100%)',
            }}
          />
        </div>

        {/* ── hero content — sits in the dark upper zone of the image ── */}
        <div className="relative z-10 w-full flex flex-col items-center text-center px-4"
          style={{ paddingTop: '96px', paddingBottom: '60px' }}>

          <h1 className="text-white text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-5 max-w-4xl drop-shadow-lg">
            Make Your Interior More<br />
            Minimalistic &amp; Modern
          </h1>
          <p className="text-white/85 text-base md:text-lg leading-relaxed mb-10 max-w-md drop-shadow">
            Turn your room with Masa into a lot more minimalist<br className="hidden md:block" />
            and modern with ease and speed
          </p>

          {/* search bar — white pill + orange button */}
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

        {/* ── floating color-picker widget — Figma export, bottom-right ── */}
        <div className="absolute bottom-16 right-6 md:right-16 z-20 hidden md:block">
          <img
            src="/color-picker.png"
            alt="Color picker"
            className="w-36 drop-shadow-2xl"
          />
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
                  <MoreInfo to={item.to} label={`Learn more about ${item.title}`} />
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
          4. EXPERIENCES — left photo contained in grid
      ═══════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="container-main grid md:grid-cols-2 gap-12 items-center">

          {/* left: room photo — contained, same width as text column */}
          <div className="rounded-2xl overflow-hidden shadow-lg"
            style={{ aspectRatio: '4/3' }}>
            <img
              src="/exp-room.jpg"
              alt="Dark living room with teal sofa and tropical plant"
              className="w-full h-full object-cover"
              onError={e => { e.target.src = '/mat-sofa.jpg'; }}
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
            <MoreInfo to="/about" label="Learn more about our team" />
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
            <MoreInfo to="/shop" label="Browse our furniture collection" />
          </div>

          {/* right: 3-photo collage — 2 stacked left col, 1 tall right col */}
          <div className="grid grid-cols-2 grid-rows-2 gap-4" style={{ height: '420px' }}>

            {/* top-left: white sofa + teal paneled wall */}
            <div className="rounded-2xl overflow-hidden shadow-md">
              <img
                src="/mat-sofa.jpg"
                alt="White sofa with teal paneled wall"
                className="w-full h-full object-cover"
                onError={e => { e.target.src = '/mat-sofa.jpg'; }}
              />
            </div>

            {/* bottom-left: modern chair showroom — gray + teal accent */}
            <div className="rounded-2xl overflow-hidden shadow-md">
              <img
                src="/mat-chairs.jpg"
                alt="Modern chair showroom with gray and teal accents"
                className="w-full h-full object-cover"
                onError={e => { e.target.src = '/mat-chairs.jpg'; }}
              />
            </div>

            {/* right col — tall, spans 2 rows: amber/ochre dining chairs + warm curtains */}
            <div className="row-span-2 col-start-2 row-start-1 rounded-2xl overflow-hidden shadow-md">
              <img
                src="/mat-dining.jpg"
                alt="Dining room with amber ochre chairs and warm curtains"
                className="w-full h-full object-cover"
                onError={e => { e.target.src = '/mat-dining.jpg'; }}
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
                    aria-label={`Go to testimonial ${i + 1}`}
                    className={`w-2 h-2 rounded-full transition-colors
                      ${i === testimIdx ? 'bg-masa-accent' : 'bg-gray-300'}`} />
                ))}
              </div>
            </div>

            {/* next arrow */}
            <button
              onClick={() => setTestimIdx(i => (i + 1) % TESTIMONIALS.length)}
              aria-label="Next testimonial"
              className="absolute -right-5 top-1/3 z-10 w-10 h-10 rounded-full bg-white border border-gray-200
                         shadow flex items-center justify-center text-masa-dark hover:shadow-md transition-shadow"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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
          onError={e => { e.target.src = '/exp-room.jpg'; }}
        />
        {/* avatar circle overlapping bottom edge */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-10">
          <div className="w-14 h-14 rounded-full border-4 border-white overflow-hidden shadow-md flex items-center justify-center"
            style={{ backgroundColor: t.avatarColor }}>
            <span className="text-white font-bold text-sm">
              {t.name.split(' ').map(w => w[0]).join('')}
            </span>
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
