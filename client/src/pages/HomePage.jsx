import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProductCard, { StarRating } from '../components/ProductCard';

/* ── section data ──────────────────────────────────────────────── */
const WHY_ITEMS = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Premium Quality',
    desc: 'Every piece is crafted from carefully sourced materials, built to last generations — not just seasons.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
      </svg>
    ),
    title: 'Free Delivery',
    desc: 'White-glove delivery and assembly service included on all orders. We bring it to your room, you enjoy it.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    title: '30-Day Returns',
    desc: 'Not loving it? Return or exchange any item within 30 days — no questions asked, no hassle.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: '24/7 Support',
    desc: 'Our furniture specialists are always on hand — chat, call or email whenever you need guidance.',
  },
];

const STATS = [
  { value: '12+', label: 'Years of craftsmanship' },
  { value: '40k+', label: 'Happy customers' },
  { value: '200+', label: 'Unique designs' },
  { value: '98%', label: 'Satisfaction rate' },
];

const MATERIALS = [
  { name: 'Solid Oak', desc: 'European white oak — naturally resistant, beautifully grained.', color: '#c8a96e' },
  { name: 'Italian Leather', desc: 'Full-grain Nappa leather, hand-stitched at our Milan workshop.', color: '#8B5E3C' },
  { name: 'Steel Frame', desc: 'Powder-coated aircraft-grade steel for a lifetime of support.', color: '#6b7280' },
  { name: 'Linen Fabric', desc: 'OEKO-TEX certified Belgian linen — soft, breathable, timeless.', color: '#d1c4b0' },
];

const TESTIMONIALS = [
  {
    name: 'Sophie Williams',
    role: 'Interior Designer',
    text: "Masa's pieces have become my go-to recommendation for clients. The quality speaks for itself the moment you sit in one of their chairs.",
    rating: 5,
    avatar: 'SW',
  },
  {
    name: 'James Okonkwo',
    role: 'Architect',
    text: "Ordered a full living room set. The delivery team assembled everything perfectly. Six months in and everything still looks brand new.",
    rating: 5,
    avatar: 'JO',
  },
  {
    name: 'Maria Lenz',
    role: 'Home Owner',
    text: "The customer service was incredible. They helped me pick the perfect sofa for my space and even arranged a virtual colour consultation.",
    rating: 5,
    avatar: 'ML',
  },
];

const PRODUCT_CATEGORIES = [
  { label: 'All',    value: '' },
  { label: 'Chairs', value: 'chairs' },
  { label: 'Beds',   value: 'beds' },
  { label: 'Sofas',  value: 'sofas' },
  { label: 'Lamps',  value: 'lamp' },
];

/* ════════════════════════════════════════════════════════════════
   HomePage
════════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const navigate = useNavigate();
  const [search, setSearch]         = useState('');
  const [activeTab, setActiveTab]   = useState('');
  const [products, setProducts]     = useState([]);
  const [loadingProd, setLoadingProd] = useState(true);
  const [testimIdx, setTestimIdx]   = useState(0);

  /* fetch products when tab changes */
  useEffect(() => {
    let cancelled = false;
    setLoadingProd(true);

    const params = new URLSearchParams();
    if (activeTab) params.set('category', activeTab);
    params.set('limit', '8');
    params.set('featured', 'true');

    api.get(`/products?${params}`)
      .then(res => {
        if (!cancelled) {
          setProducts(res.data.products || res.data || []);
          setLoadingProd(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          /* fallback: placeholder cards so UI is never empty */
          setProducts(
            Array.from({ length: 8 }, (_, i) => ({
              id: i + 1,
              name: ['Nordic Lounge Chair', 'Oslo Platform Bed', 'Milan 3-Seat Sofa', 'Arc Floor Lamp',
                     'Walnut Coffee Table', 'Linen Accent Chair', 'Compact Writing Desk', 'Oak Bookshelf'][i],
              price: [349, 899, 1199, 189, 449, 279, 329, 499][i],
              category: ['chairs', 'beds', 'sofas', 'lamp', 'tables', 'chairs', 'tables', 'shelves'][i],
              avg_rating: 4 + (i % 2) * 0.5,
              review_count: [24, 18, 31, 12, 7, 19, 9, 22][i],
            }))
          );
          setLoadingProd(false);
        }
      });

    return () => { cancelled = true; };
  }, [activeTab]);

  /* auto-advance testimonial */
  useEffect(() => {
    const t = setInterval(() => {
      setTestimIdx(i => (i + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const handleSearch = e => {
    e.preventDefault();
    if (search.trim()) navigate(`/shop?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div className="overflow-x-hidden">

      {/* ═══════════════════════════════════════════════
          1. HERO
      ═══════════════════════════════════════════════ */}
      <section className="relative bg-masa-dark min-h-[88vh] flex items-center overflow-hidden">
        {/* subtle radial glow behind text */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 70% at 30% 50%, rgba(224,123,57,0.12) 0%, transparent 70%)' }}
        />

        {/* decorative circle */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full
                        bg-gradient-to-br from-masa-accent/20 to-transparent blur-3xl pointer-events-none" />

        <div className="container-main relative z-10 py-24 grid md:grid-cols-2 gap-12 items-center">
          {/* left: copy */}
          <div>
            <p className="section-label mb-4">Welcome to Masa</p>
            <h1 className="text-white text-5xl md:text-6xl font-bold leading-tight mb-6">
              Furniture That
              <br />
              <span className="text-masa-accent">Feels Like Home</span>
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed max-w-md mb-10">
              Discover handcrafted furniture pieces designed for modern living —
              where timeless craftsmanship meets everyday comfort.
            </p>

            {/* search bar */}
            <form onSubmit={handleSearch} className="flex gap-0 max-w-md rounded-full overflow-hidden shadow-lg">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search chairs, sofas, beds…"
                className="flex-1 bg-white text-masa-dark placeholder-masa-gray px-5 py-3.5 text-sm focus:outline-none"
              />
              <button
                type="submit"
                className="bg-masa-accent text-white px-7 py-3.5 text-sm font-semibold hover:bg-orange-600 transition-colors"
              >
                Search
              </button>
            </form>

            {/* cta row */}
            <div className="flex items-center gap-4 mt-8">
              <Link to="/shop" className="btn-primary">
                Shop Now
              </Link>
              <Link
                to="/about"
                className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors group"
              >
                Our Story
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* right: hero image / decorative */}
          <div className="relative hidden md:flex items-center justify-center">
            <div className="w-[420px] h-[420px] rounded-2xl overflow-hidden shadow-2xl bg-masa-light">
              <img
                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=840&q=80"
                alt="Elegant sofa in a modern living room"
                className="w-full h-full object-cover"
                onError={e => { e.target.src = `https://picsum.photos/seed/hero/840/840`; }}
              />
            </div>
            {/* floating badge */}
            <div className="absolute -bottom-4 -left-8 bg-white rounded-2xl shadow-xl px-5 py-4 flex items-center gap-3">
              <span className="text-3xl font-bold text-masa-accent">40k+</span>
              <span className="text-xs text-masa-gray leading-tight">Happy<br />Customers</span>
            </div>
            <div className="absolute -top-4 -right-6 bg-masa-accent rounded-2xl shadow-xl px-5 py-4">
              <span className="text-white text-xs font-semibold">Free delivery</span>
              <p className="text-white/80 text-[10px]">on all orders</p>
            </div>
          </div>
        </div>

        {/* bottom wave divider */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L1440 60L1440 20C1200 60 960 0 720 20C480 40 240 0 0 20L0 60Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          2. WHY CHOOSING US
      ═══════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="container-main">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="section-label mb-3">Why Masa</p>
            <h2 className="text-3xl md:text-4xl font-bold text-masa-dark">
              Choosing Us Is Choosing Quality
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {WHY_ITEMS.map(item => (
              <div
                key={item.title}
                className="group flex flex-col items-center text-center p-8 rounded-2xl border border-masa-border
                           hover:border-masa-accent hover:shadow-lg transition-all duration-300"
              >
                <div className="mb-5 text-masa-accent group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="font-bold text-masa-dark text-lg mb-2">{item.title}</h3>
                <p className="text-masa-gray text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          3. BEST SELLING PRODUCTS
      ═══════════════════════════════════════════════ */}
      <section className="py-24 bg-masa-light">
        <div className="container-main">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="section-label mb-3">Our Collection</p>
              <h2 className="text-3xl md:text-4xl font-bold text-masa-dark">Best Selling Products</h2>
            </div>
            <Link to="/shop" className="btn-outline shrink-0 self-start md:self-auto">
              View All Products
            </Link>
          </div>

          {/* category tabs */}
          <div className="flex flex-wrap gap-2 mb-10">
            {PRODUCT_CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setActiveTab(cat.value)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200
                  ${activeTab === cat.value
                    ? 'bg-masa-accent text-white shadow-md'
                    : 'bg-white text-masa-gray border border-masa-border hover:border-masa-accent hover:text-masa-accent'
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* product grid */}
          {loadingProd ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card overflow-hidden animate-pulse">
                  <div className="bg-gray-200 aspect-[4/3]" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-4/5" />
                    <div className="h-3 bg-gray-200 rounded w-2/5" />
                    <div className="h-8 bg-gray-200 rounded-full w-full mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          4. EXPERIENCES / STATS BANNER
      ═══════════════════════════════════════════════ */}
      <section
        className="py-20"
        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%)' }}
      >
        <div className="container-main">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 text-center">
            {STATS.map(stat => (
              <div key={stat.label} className="space-y-2">
                <p className="text-5xl font-bold text-masa-accent">{stat.value}</p>
                <p className="text-gray-300 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="section-label mb-3">The Masa Experience</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                More Than Furniture —<br />
                <span className="text-masa-accent">It's a Lifestyle.</span>
              </h2>
              <p className="text-gray-400 leading-relaxed mb-8">
                From your first browse to the moment you sink into your new sofa, we obsess over
                every detail. Our designers, craftspeople and delivery team work as one to give
                you a seamless, joyful experience from click to comfort.
              </p>
              <Link to="/shop" className="btn-primary inline-flex">
                Start Shopping
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80',
                'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
                'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&q=80',
                'https://images.unsplash.com/photo-1549497538-303791108f95?w=400&q=80',
              ].map((src, i) => (
                <div key={i} className={`rounded-2xl overflow-hidden shadow-lg ${i === 1 ? 'mt-6' : ''}`}>
                  <img
                    src={src}
                    alt="Furniture lifestyle"
                    className="w-full h-40 object-cover hover:scale-105 transition-transform duration-500"
                    onError={e => { e.target.src = `https://picsum.photos/seed/${i + 100}/400/300`; }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          5. MATERIALS
      ═══════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="container-main">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="section-label mb-3">Craftsmanship</p>
            <h2 className="text-3xl md:text-4xl font-bold text-masa-dark">
              Materials That Last a Lifetime
            </h2>
            <p className="text-masa-gray mt-4 leading-relaxed">
              We source only the finest natural and engineered materials — because great
              furniture begins long before it reaches your home.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {MATERIALS.map(mat => (
              <div key={mat.name} className="rounded-2xl overflow-hidden shadow-sm border border-masa-border hover:shadow-md transition-shadow group">
                {/* colour swatch */}
                <div
                  className="h-32 w-full transition-transform duration-500 group-hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${mat.color} 0%, ${mat.color}cc 100%)`,
                  }}
                />
                <div className="p-5">
                  <h3 className="font-bold text-masa-dark mb-1">{mat.name}</h3>
                  <p className="text-masa-gray text-sm leading-relaxed">{mat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          6. TESTIMONIALS
      ═══════════════════════════════════════════════ */}
      <section className="py-24 bg-masa-light">
        <div className="container-main">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="section-label mb-3">Testimonials</p>
            <h2 className="text-3xl md:text-4xl font-bold text-masa-dark">
              Loved by Our Customers
            </h2>
          </div>

          {/* carousel — desktop shows 3, mobile shows active one */}
          <div className="hidden md:grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card p-8 flex flex-col gap-5">
                {/* stars */}
                <StarRating rating={t.rating} />
                {/* quote */}
                <p className="text-masa-gray text-sm leading-relaxed italic flex-1">
                  "{t.text}"
                </p>
                {/* author */}
                <div className="flex items-center gap-3 pt-2 border-t border-masa-border">
                  <div className="w-10 h-10 rounded-full bg-masa-accent text-white flex items-center justify-center text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-masa-dark text-sm">{t.name}</p>
                    <p className="text-masa-gray text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* mobile: single testimonial with dots */}
          <div className="md:hidden">
            <div className="card p-8 flex flex-col gap-5">
              <StarRating rating={TESTIMONIALS[testimIdx].rating} />
              <p className="text-masa-gray text-sm leading-relaxed italic">
                "{TESTIMONIALS[testimIdx].text}"
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-masa-border">
                <div className="w-10 h-10 rounded-full bg-masa-accent text-white flex items-center justify-center text-sm font-bold">
                  {TESTIMONIALS[testimIdx].avatar}
                </div>
                <div>
                  <p className="font-semibold text-masa-dark text-sm">{TESTIMONIALS[testimIdx].name}</p>
                  <p className="text-masa-gray text-xs">{TESTIMONIALS[testimIdx].role}</p>
                </div>
              </div>
            </div>
            {/* dots */}
            <div className="flex justify-center gap-2 mt-5">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTestimIdx(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${i === testimIdx ? 'bg-masa-accent' : 'bg-masa-border'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          7. NEWSLETTER CTA
      ═══════════════════════════════════════════════ */}
      <section className="py-20 bg-masa-accent">
        <div className="container-main text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Get 10% Off Your First Order
          </h2>
          <p className="text-white/80 mb-8 leading-relaxed">
            Join our mailing list for exclusive deals, new arrivals and design inspiration
            delivered straight to your inbox.
          </p>
          <form
            onSubmit={e => e.preventDefault()}
            className="flex gap-0 max-w-md mx-auto rounded-full overflow-hidden shadow-lg"
          >
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 bg-white text-masa-dark placeholder-masa-gray px-5 py-3.5 text-sm focus:outline-none"
            />
            <button
              type="submit"
              className="bg-masa-dark text-white px-7 py-3.5 text-sm font-semibold hover:bg-gray-900 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

    </div>
  );
}
