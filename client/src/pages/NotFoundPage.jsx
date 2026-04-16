import { useNavigate, Link } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white px-4">
      <div className="text-center max-w-lg">

        {/* large 404 */}
        <div className="relative mb-6 select-none">
          <span
            className="text-[10rem] font-bold leading-none"
            style={{
              background: 'linear-gradient(135deg, #e07b39 0%, #1a1a2e 80%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            404
          </span>
          {/* small sofa icon inside */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg
              className="w-16 h-16 text-white/80 drop-shadow"
              viewBox="0 0 64 64"
              fill="none"
            >
              <rect x="8"  y="28" width="48" height="18" rx="4" fill="#e07b39" opacity="0.15" />
              <rect x="4"  y="32" width="12" height="14" rx="3" fill="#e07b39" opacity="0.3" />
              <rect x="48" y="32" width="12" height="14" rx="3" fill="#e07b39" opacity="0.3" />
              <rect x="12" y="24" width="40" height="10" rx="3" fill="#1a1a2e" opacity="0.2" />
              <rect x="14" y="46" width="6"  height="8"  rx="2" fill="#1a1a2e" opacity="0.2" />
              <rect x="44" y="46" width="6"  height="8"  rx="2" fill="#1a1a2e" opacity="0.2" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-masa-dark mb-3">
          This page got lost in delivery
        </h1>
        <p className="text-masa-gray leading-relaxed mb-8">
          The page you're looking for has been moved, removed, or never existed.
          Let's get you back to something great.
        </p>

        {/* action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="btn-outline py-3 px-8 flex items-center justify-center gap-2 group"
          >
            <svg
              className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            Go Back
          </button>
          <Link to="/" className="btn-primary py-3 px-8 flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Back to Home
          </Link>
        </div>

        {/* quick links */}
        <div className="mt-10 pt-8 border-t border-masa-border">
          <p className="text-xs text-masa-gray uppercase tracking-widest font-semibold mb-4">
            Popular destinations
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { to: '/shop',           label: 'Shop All' },
              { to: '/shop/chairs',    label: 'Chairs' },
              { to: '/shop/sofas',     label: 'Sofas' },
              { to: '/shop/beds',      label: 'Beds' },
              { to: '/dashboard',      label: 'My Account' },
              { to: '/cart',           label: 'Cart' },
            ].map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm text-masa-accent hover:underline border border-masa-border
                           rounded-full px-4 py-1.5 hover:border-masa-accent transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
