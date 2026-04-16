import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

/* ── constants ────────────────────────────────────────────────── */
const SORT_OPTIONS = [
  { label: 'Newest',        value: 'created_at|DESC' },
  { label: 'Price: Low–High', value: 'price|ASC' },
  { label: 'Price: High–Low', value: 'price|DESC' },
  { label: 'Name A–Z',      value: 'name|ASC' },
  { label: 'Name Z–A',      value: 'name|DESC' },
];

const PRICE_RANGES = [
  { label: 'Any Price',      min: 0,    max: Infinity },
  { label: 'Under $200',     min: 0,    max: 200 },
  { label: '$200 – $500',    min: 200,  max: 500 },
  { label: '$500 – $1,000',  min: 500,  max: 1000 },
  { label: 'Over $1,000',    min: 1000, max: Infinity },
];

const GRID_LIMITS = [12, 24, 48];

/* ── skeleton ─────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="bg-gray-200 aspect-[4/3]" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-4/5" />
        <div className="h-3 bg-gray-200 rounded w-2/5" />
        <div className="flex justify-between items-center mt-4">
          <div className="h-5 bg-gray-200 rounded w-1/4" />
          <div className="h-8 bg-gray-200 rounded-full w-1/3" />
        </div>
      </div>
    </div>
  );
}

/* ── pagination ───────────────────────────────────────────────── */
function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null;

  const range = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 2) range.push(i);
    else if (range[range.length - 1] !== '…') range.push('…');
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-12">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className="p-2 rounded-lg border border-masa-border text-masa-gray hover:border-masa-accent
                   hover:text-masa-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      {range.map((r, i) =>
        r === '…' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-masa-gray">…</span>
        ) : (
          <button
            key={r}
            onClick={() => onPage(r)}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors
              ${r === page
                ? 'bg-masa-accent text-white shadow-md'
                : 'border border-masa-border text-masa-dark hover:border-masa-accent hover:text-masa-accent'
              }`}
          >
            {r}
          </button>
        )
      )}
      <button
        onClick={() => onPage(page + 1)}
        disabled={page === pages}
        className="p-2 rounded-lg border border-masa-border text-masa-gray hover:border-masa-accent
                   hover:text-masa-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

/* ── sidebar component ────────────────────────────────────────── */
function Sidebar({ categories, activeCategory, onCategory, priceRange, onPriceRange, onClose }) {
  return (
    <div className="flex flex-col gap-8">

      {/* close button (mobile only) */}
      {onClose && (
        <div className="flex items-center justify-between">
          <span className="font-bold text-masa-dark">Filters</span>
          <button onClick={onClose} className="p-1 text-masa-gray hover:text-masa-dark">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Categories */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-masa-gray mb-4">Category</h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => onCategory('')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                ${activeCategory === ''
                  ? 'bg-masa-accent/10 text-masa-accent font-semibold'
                  : 'text-masa-dark hover:bg-masa-light'
                }`}
            >
              All Products
            </button>
          </li>
          {categories.map(cat => (
            <li key={cat.slug}>
              <button
                onClick={() => onCategory(cat.slug)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex justify-between items-center transition-colors
                  ${activeCategory === cat.slug
                    ? 'bg-masa-accent/10 text-masa-accent font-semibold'
                    : 'text-masa-dark hover:bg-masa-light'
                  }`}
              >
                <span className="capitalize">{cat.name}</span>
                <span className="text-xs text-masa-gray bg-masa-light rounded-full px-2 py-0.5">
                  {cat.product_count}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price range */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-masa-gray mb-4">Price Range</h3>
        <ul className="space-y-1">
          {PRICE_RANGES.map((pr, i) => (
            <li key={i}>
              <button
                onClick={() => onPriceRange(i)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2
                  ${priceRange === i
                    ? 'bg-masa-accent/10 text-masa-accent font-semibold'
                    : 'text-masa-dark hover:bg-masa-light'
                  }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0
                  ${priceRange === i ? 'border-masa-accent bg-masa-accent' : 'border-masa-border'}`} />
                {pr.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Clear filters */}
      <button
        onClick={() => { onCategory(''); onPriceRange(0); }}
        className="text-sm text-masa-gray hover:text-masa-accent transition-colors underline text-left"
      >
        Clear all filters
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   ShopPage
════════════════════════════════════════════════════════════════ */
export default function ShopPage() {
  const { category: urlCategory } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  /* ── filter state ── */
  const [activeCategory, setActiveCategory] = useState(urlCategory || '');
  const [priceRange,     setPriceRange]      = useState(0);
  const [sort,           setSort]            = useState('created_at|DESC');
  const [search,         setSearch]          = useState(searchParams.get('q') || '');
  const [searchInput,    setSearchInput]     = useState(searchParams.get('q') || '');
  const [view,           setView]            = useState('grid'); // 'grid' | 'list'
  const [limit,          setLimit]           = useState(12);
  const [page,           setPage]            = useState(1);

  /* ── data state ── */
  const [categories, setCategories] = useState([]);
  const [products,   setProducts]   = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [loading,    setLoading]    = useState(true);

  /* ── mobile sidebar ── */
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* sync URL category param */
  useEffect(() => {
    setActiveCategory(urlCategory || '');
    setPage(1);
  }, [urlCategory]);

  /* fetch categories once */
  useEffect(() => {
    api.get('/categories')
      .then(res => setCategories(res.data || []))
      .catch(() => {
        /* fallback categories */
        setCategories([
          { slug: 'chairs',  name: 'Chairs',  product_count: 0 },
          { slug: 'beds',    name: 'Beds',    product_count: 0 },
          { slug: 'sofas',   name: 'Sofas',   product_count: 0 },
          { slug: 'tables',  name: 'Tables',  product_count: 0 },
          { slug: 'shelves', name: 'Shelves', product_count: 0 },
          { slug: 'lamp',    name: 'Lamps',   product_count: 0 },
        ]);
      });
  }, []);

  /* fetch products */
  const fetchProducts = useCallback(() => {
    setLoading(true);
    const [sortField, sortDir] = sort.split('|');
    const params = new URLSearchParams({
      page,
      limit,
      sort:  sortField,
      order: sortDir,
    });
    if (activeCategory) params.set('category', activeCategory);
    if (search.trim())  params.set('search', search.trim());

    api.get(`/products?${params}`)
      .then(res => {
        let prods = res.data.products || res.data || [];
        /* client-side price filter */
        const pr = PRICE_RANGES[priceRange];
        if (pr.max !== Infinity || pr.min > 0) {
          prods = prods.filter(p => p.price >= pr.min && p.price < pr.max);
        }
        setProducts(prods);
        setPagination(res.data.pagination || { total: prods.length, pages: 1 });
      })
      .catch(() => {
        /* fallback placeholders */
        const fallback = Array.from({ length: limit }, (_, i) => ({
          id: i + 1 + (page - 1) * limit,
          name: ['Nordic Lounge Chair', 'Oslo Platform Bed', 'Milan 3-Seat Sofa', 'Arc Floor Lamp',
                 'Walnut Coffee Table', 'Linen Accent Chair', 'Compact Writing Desk', 'Oak Bookshelf',
                 'Velvet Armchair', 'Steel Side Table', 'Rattan Shelf Unit', 'Pendant Light'][i % 12],
          price: [349, 899, 1199, 189, 449, 279, 329, 499, 519, 249, 389, 159][i % 12],
          category_name: activeCategory || 'Furniture',
          avg_rating: 3.5 + (i % 3) * 0.5,
          review_count: [24, 18, 31, 12, 7, 19, 9, 22, 14, 5, 28, 11][i % 12],
        }));
        setProducts(fallback);
        setPagination({ total: 48, pages: 4, page });
      })
      .finally(() => setLoading(false));
  }, [activeCategory, search, sort, priceRange, page, limit]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  /* handlers */
  const handleSearchSubmit = e => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    } else {
      setSearchParams({});
    }
  };

  const handleCategory = slug => {
    setActiveCategory(slug);
    setPage(1);
    setSidebarOpen(false);
  };

  const handlePriceRange = idx => {
    setPriceRange(idx);
    setPage(1);
  };

  const handleSort = val => {
    setSort(val);
    setPage(1);
  };

  const handleLimit = val => {
    setLimit(val);
    setPage(1);
  };

  /* active filter count for badge */
  const filterCount = (activeCategory ? 1 : 0) + (priceRange > 0 ? 1 : 0) + (search ? 1 : 0);

  /* breadcrumb label */
  const categoryLabel = categories.find(c => c.slug === activeCategory)?.name;

  return (
    <div className="bg-white min-h-screen">

      {/* ── page header ── */}
      <div className="bg-masa-light border-b border-masa-border py-8">
        <div className="container-main">
          {/* breadcrumb */}
          <nav className="text-sm text-masa-gray mb-2 flex items-center gap-1.5">
            <Link to="/" className="hover:text-masa-accent transition-colors">Home</Link>
            <span>/</span>
            <span className="text-masa-dark font-medium">
              {categoryLabel ? categoryLabel : 'Shop'}
            </span>
            {search && (
              <>
                <span>/</span>
                <span className="text-masa-dark font-medium">"{search}"</span>
              </>
            )}
          </nav>
          <h1 className="text-3xl font-bold text-masa-dark">
            {search
              ? `Results for "${search}"`
              : categoryLabel
              ? categoryLabel
              : 'All Products'}
          </h1>
          <p className="text-masa-gray text-sm mt-1">
            {!loading && `${pagination.total} product${pagination.total !== 1 ? 's' : ''} found`}
          </p>
        </div>
      </div>

      <div className="container-main py-10">
        <div className="flex gap-8">

          {/* ══ SIDEBAR — desktop ══ */}
          <aside className="hidden lg:block w-60 shrink-0">
            <Sidebar
              categories={categories}
              activeCategory={activeCategory}
              onCategory={handleCategory}
              priceRange={priceRange}
              onPriceRange={handlePriceRange}
            />
          </aside>

          {/* ══ MAIN CONTENT ══ */}
          <div className="flex-1 min-w-0">

            {/* top bar */}
            <div className="flex flex-wrap gap-3 items-center mb-6">

              {/* search */}
              <form onSubmit={handleSearchSubmit} className="flex flex-1 min-w-[200px] max-w-sm gap-0 rounded-full overflow-hidden border border-masa-border shadow-sm">
                <input
                  type="text"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="Search products…"
                  className="flex-1 px-4 py-2 text-sm focus:outline-none text-masa-dark placeholder-masa-gray"
                />
                <button
                  type="submit"
                  className="bg-masa-accent text-white px-4 py-2 text-sm hover:bg-orange-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>

              {/* mobile filter button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center gap-2 text-sm font-medium border border-masa-border px-4 py-2
                           rounded-full hover:border-masa-accent hover:text-masa-accent transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                </svg>
                Filters
                {filterCount > 0 && (
                  <span className="bg-masa-accent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {filterCount}
                  </span>
                )}
              </button>

              {/* spacer */}
              <div className="flex-1" />

              {/* per-page */}
              <div className="flex items-center gap-2 text-sm text-masa-gray">
                <span className="hidden sm:inline">Show:</span>
                <select
                  value={limit}
                  onChange={e => handleLimit(Number(e.target.value))}
                  className="border border-masa-border rounded-lg px-2 py-1.5 text-sm text-masa-dark focus:outline-none focus:border-masa-accent"
                >
                  {GRID_LIMITS.map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              {/* sort */}
              <div className="flex items-center gap-2 text-sm text-masa-gray">
                <span className="hidden sm:inline">Sort:</span>
                <select
                  value={sort}
                  onChange={e => handleSort(e.target.value)}
                  className="border border-masa-border rounded-lg px-2 py-1.5 text-sm text-masa-dark focus:outline-none focus:border-masa-accent"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* view toggle */}
              <div className="flex items-center border border-masa-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setView('grid')}
                  className={`p-2 transition-colors ${view === 'grid' ? 'bg-masa-dark text-white' : 'text-masa-gray hover:bg-masa-light'}`}
                  title="Grid view"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-2 transition-colors ${view === 'list' ? 'bg-masa-dark text-white' : 'text-masa-gray hover:bg-masa-light'}`}
                  title="List view"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* active filter chips */}
            {(activeCategory || priceRange > 0 || search) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {activeCategory && (
                  <span className="flex items-center gap-1 bg-masa-accent/10 text-masa-accent text-xs font-medium px-3 py-1.5 rounded-full">
                    {categoryLabel}
                    <button onClick={() => handleCategory('')} className="hover:text-orange-700 ml-1">×</button>
                  </span>
                )}
                {priceRange > 0 && (
                  <span className="flex items-center gap-1 bg-masa-accent/10 text-masa-accent text-xs font-medium px-3 py-1.5 rounded-full">
                    {PRICE_RANGES[priceRange].label}
                    <button onClick={() => handlePriceRange(0)} className="hover:text-orange-700 ml-1">×</button>
                  </span>
                )}
                {search && (
                  <span className="flex items-center gap-1 bg-masa-accent/10 text-masa-accent text-xs font-medium px-3 py-1.5 rounded-full">
                    "{search}"
                    <button onClick={() => { setSearch(''); setSearchInput(''); setSearchParams({}); }} className="hover:text-orange-700 ml-1">×</button>
                  </span>
                )}
                <button
                  onClick={() => { handleCategory(''); handlePriceRange(0); setSearch(''); setSearchInput(''); setSearchParams({}); }}
                  className="text-xs text-masa-gray hover:text-masa-accent transition-colors underline"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* product grid / list */}
            {loading ? (
              <div className={view === 'grid'
                ? 'grid sm:grid-cols-2 xl:grid-cols-3 gap-6'
                : 'flex flex-col gap-4'
              }>
                {Array.from({ length: limit }).map((_, i) => (
                  view === 'grid'
                    ? <SkeletonCard key={i} />
                    : (
                      <div key={i} className="card flex gap-4 p-4 animate-pulse">
                        <div className="w-28 h-28 bg-gray-200 rounded-lg shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-gray-200 rounded w-1/4" />
                          <div className="h-4 bg-gray-200 rounded w-3/5" />
                          <div className="h-3 bg-gray-200 rounded w-2/5" />
                        </div>
                        <div className="shrink-0 flex flex-col items-end gap-3">
                          <div className="h-5 bg-gray-200 rounded w-20" />
                          <div className="h-8 bg-gray-200 rounded-full w-28" />
                        </div>
                      </div>
                    )
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24 flex flex-col items-center gap-4">
                <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-masa-dark">No products found</h3>
                <p className="text-masa-gray text-sm">Try adjusting your filters or search term.</p>
                <button
                  onClick={() => { setActiveCategory(''); setPriceRange(0); setSearch(''); setSearchInput(''); }}
                  className="btn-primary mt-2"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className={view === 'grid'
                ? 'grid sm:grid-cols-2 xl:grid-cols-3 gap-6'
                : 'flex flex-col gap-4'
              }>
                {products.map(p => (
                  <ProductCard key={p.id} product={p} variant={view === 'list' ? 'list' : 'grid'} />
                ))}
              </div>
            )}

            {/* pagination */}
            <Pagination
              page={page}
              pages={pagination.pages}
              onPage={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            />

          </div>
        </div>
      </div>

      {/* ══ MOBILE FILTER DRAWER ══ */}
      {sidebarOpen && (
        <>
          {/* backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setSidebarOpen(false)}
          />
          {/* drawer */}
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 overflow-y-auto p-6">
            <Sidebar
              categories={categories}
              activeCategory={activeCategory}
              onCategory={handleCategory}
              priceRange={priceRange}
              onPriceRange={idx => { handlePriceRange(idx); setSidebarOpen(false); }}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </>
      )}

    </div>
  );
}
