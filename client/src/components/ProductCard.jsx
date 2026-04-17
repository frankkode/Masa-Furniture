import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart }     from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth }     from '../context/AuthContext';

export function StarRating({ rating = 0, count = 0, size = 'sm' }) {
  const stars = Math.round(rating);
  const cls   = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5';
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <svg
          key={n}
          className={`${cls} ${n <= stars ? 'text-masa-accent' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      {count > 0 && (
        <span className="text-xs text-masa-gray ml-1">({count})</span>
      )}
    </span>
  );
}

/* ── shared heart button ─────────────────────────────────────── */
function WishlistBtn({ productId, className = '' }) {
  const { user }                  = useAuth();
  const { wishlistIds, toggle }   = useWishlist();
  const navigate                  = useNavigate();
  const liked = wishlistIds.has(Number(productId));

  const handleClick = async e => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    await toggle(productId);
  };

  return (
    <button
      onClick={handleClick}
      aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`w-8 h-8 rounded-full bg-white shadow flex items-center justify-center
                  transition-all hover:scale-110 active:scale-95 ${className}`}
    >
      <svg
        className={`w-4 h-4 transition-colors ${liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
        fill={liked ? 'currentColor' : 'none'}
        viewBox="0 0 20 20"
        stroke="currentColor"
        strokeWidth={liked ? 0 : 1.5}
      >
        <path fillRule="evenodd"
          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
          clipRule="evenodd" />
      </svg>
    </button>
  );
}

export { WishlistBtn };

/* ── grid card (default) ─────────────────────────────────────── */
export default function ProductCard({ product, variant = 'grid' }) {
  const { addItem, loading } = useCart();
  const [adding, setAdding]  = useState(false);

  const handleAdd = async e => {
    e.preventDefault();
    setAdding(true);
    await addItem(product.id, 1);
    setAdding(false);
  };

  const imgSrc = product.image_url
    || `https://picsum.photos/seed/${product.id}/400/320`;

  if (variant === 'list') {
    return (
      <div className="card flex gap-4 p-4 items-center">
        <Link to={`/product/${product.id}`} className="shrink-0 w-28 h-28 rounded-lg overflow-hidden bg-masa-light">
          <img
            src={imgSrc}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={e => { e.target.src = `https://picsum.photos/seed/${product.id + 10}/400/320`; }}
          />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-masa-gray capitalize mb-1">
            {product.category_name || product.category || 'Furniture'}
          </p>
          <Link
            to={`/product/${product.id}`}
            className="font-semibold text-masa-dark text-sm hover:text-masa-accent transition-colors block truncate"
          >
            {product.name}
          </Link>
          <StarRating rating={product.avg_rating || 4} count={product.review_count || 0} />
          {product.description && (
            <p className="text-xs text-masa-gray mt-1 line-clamp-2">{product.description}</p>
          )}
        </div>
        <div className="shrink-0 flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <WishlistBtn productId={product.id} />
            <span className="text-masa-accent font-bold text-lg">
              ${Number(product.price).toFixed(2)}
            </span>
          </div>
          <button
            onClick={handleAdd}
            disabled={adding || loading}
            className="flex items-center gap-1.5 text-xs font-semibold bg-masa-dark text-white px-4 py-2
                       rounded-full hover:bg-masa-accent transition-colors duration-200 disabled:opacity-60"
          >
            {adding ? (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.6 8H19M9 21a1 1 0 100-2 1 1 0 000 2zm10 0a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
            )}
            Add to Cart
          </button>
        </div>
      </div>
    );
  }

  /* grid variant */
  return (
    <div className="card group flex flex-col overflow-hidden relative">
      {/* wishlist heart — top-right corner of image */}
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <WishlistBtn productId={product.id} />
      </div>

      <Link
        to={`/product/${product.id}`}
        className="block overflow-hidden bg-masa-light aspect-[4/3]"
      >
        <img
          src={imgSrc}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => { e.target.src = `https://picsum.photos/seed/${product.id + 10}/400/320`; }}
        />
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-masa-gray capitalize mb-1">
          {product.category_name || product.category || 'Furniture'}
        </p>
        <Link
          to={`/product/${product.id}`}
          className="font-semibold text-masa-dark text-sm leading-snug hover:text-masa-accent transition-colors mb-2"
        >
          {product.name}
        </Link>
        <StarRating rating={product.avg_rating || 4} count={product.review_count || 0} />
        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="text-masa-accent font-bold text-base">
            ${Number(product.price).toFixed(2)}
          </span>
          <button
            onClick={handleAdd}
            disabled={adding || loading}
            className="flex items-center gap-1.5 text-xs font-semibold bg-masa-dark text-white px-3 py-1.5
                       rounded-full hover:bg-masa-accent transition-colors duration-200 disabled:opacity-60"
          >
            {adding ? (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.6 8H19M9 21a1 1 0 100-2 1 1 0 000 2zm10 0a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
            )}
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
