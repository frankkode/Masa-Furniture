import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const furnitureLinks = [
  { label: 'Chairs',  to: '/shop/chairs' },
  { label: 'Beds',    to: '/shop/beds' },
  { label: 'Sofas',   to: '/shop/sofas' },
  { label: 'Tables',  to: '/shop/tables' },
  { label: 'Shelves', to: '/shop/shelf' },
  { label: 'Lamps',   to: '/shop/lamp' },
];

export default function Navbar() {
  const { user, logout }   = useAuth();
  const { itemCount, isOpen, setIsOpen } = useCart();
  const navigate           = useNavigate();
  const location           = useLocation();

  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [furnitureOpen, setFurnitureOpen] = useState(false);
  const [profileOpen,   setProfileOpen]   = useState(false);
  const [scrolled,      setScrolled]      = useState(false);

  const furnitureRef = useRef(null);
  const profileRef   = useRef(null);

  const isHome = location.pathname === '/';
  // Transparent navbar: on homepage only when not yet scrolled
  const transparent = isHome && !scrolled;

  // close dropdowns on outside click
  useEffect(() => {
    function handleClick(e) {
      if (furnitureRef.current && !furnitureRef.current.contains(e.target)) setFurnitureOpen(false);
      if (profileRef.current   && !profileRef.current.contains(e.target))   setProfileOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // switch from transparent → solid once user scrolls past the hero
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll(); // check immediately on mount
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/');
  };

  /* nav link classes — white on transparent hero, dark otherwise */
  const linkBase = `text-sm font-medium transition-colors`;
  const navLinkClass = ({ isActive }) =>
    `${linkBase} ${isActive
      ? (transparent ? 'text-white' : 'text-masa-accent')
      : (transparent ? 'text-white/80 hover:text-white' : 'text-masa-dark hover:text-masa-accent')
    }`;

  const dropBtnClass = `flex items-center gap-1 text-sm font-medium transition-colors
    ${transparent ? 'text-white/80 hover:text-white' : 'text-masa-dark hover:text-masa-accent'}`;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500
        ${transparent
          ? 'bg-transparent border-transparent'
          : 'bg-white shadow-md border-transparent'
        }`}
    >
      <div className="container-main h-16 flex items-center justify-between">

        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className={`text-2xl font-bold tracking-tight transition-colors
            ${transparent ? 'text-white' : 'text-masa-dark'}`}>
            Masa
          </span>
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hidden md:flex items-center gap-8">
          {/* Furniture dropdown */}
          <div ref={furnitureRef} className="relative">
            <button onClick={() => setFurnitureOpen(v => !v)} className={dropBtnClass}>
              Furniture
              <svg className={`w-4 h-4 transition-transform ${furnitureOpen ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {furnitureOpen && (
              <div className="absolute top-full left-0 mt-2 w-44 bg-white border border-masa-border
                              rounded-lg shadow-lg py-2 z-50">
                {furnitureLinks.map(link => (
                  <Link key={link.to} to={link.to} onClick={() => setFurnitureOpen(false)}
                    className="block px-4 py-2 text-sm text-masa-dark hover:bg-masa-light hover:text-masa-accent transition-colors">
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <NavLink to="/shop"    className={navLinkClass}>Shop</NavLink>
          <NavLink to="/about"   className={navLinkClass}>About Us</NavLink>
          <NavLink to="/contact" className={navLinkClass}>Contact</NavLink>
        </nav>

        {/* ── Right actions ── */}
        <div className="flex items-center gap-3">

          {/* Shopping BAG icon — matches Figma */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`relative p-2 transition-colors
              ${transparent ? 'text-white hover:text-white/80' : 'text-masa-dark hover:text-masa-accent'}`}
            aria-label="Open cart"
          >
            {/* bag SVG */}
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {/* badge */}
            <span className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full
                              bg-masa-accent text-white text-[10px] font-bold
                              flex items-center justify-center leading-none px-0.5`}>
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          </button>

          {/* Auth */}
          {user ? (
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileOpen(v => !v)}
                className={`hidden md:flex items-center gap-2 text-sm font-medium transition-colors
                  ${transparent ? 'text-white hover:text-white/80' : 'text-masa-dark hover:text-masa-accent'}`}
              >
                <span className="w-8 h-8 rounded-full bg-masa-accent text-white flex items-center justify-center text-xs font-bold uppercase">
                  {user.username?.[0] || user.email?.[0] || 'U'}
                </span>
                <span className="max-w-[100px] truncate">{user.username || 'Account'}</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-masa-border rounded-lg shadow-lg py-2 z-50">
                  <Link to="/dashboard"          onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-masa-dark hover:bg-masa-light">Dashboard</Link>
                  <Link to="/dashboard/orders"   onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-masa-dark hover:bg-masa-light">My Orders</Link>
                  <Link to="/dashboard/wishlist" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-masa-dark hover:bg-masa-light">Wishlist</Link>
                  <Link to="/dashboard/profile"  onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-masa-dark hover:bg-masa-light">Profile Settings</Link>
                  <hr className="my-1 border-masa-border" />
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-masa-light">Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login"
              className={`hidden md:inline-flex text-sm px-5 py-2 rounded-full font-medium transition-colors
                ${transparent
                  ? 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                  : 'btn-primary'}`}>
              Sign In
            </Link>
          )}

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(v => !v)}
            className={`md:hidden p-2 transition-colors ${transparent ? 'text-white' : 'text-masa-dark'}`}
            aria-label="Toggle menu">
            {mobileOpen
              ? <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              : <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            }
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-masa-border bg-white px-6 py-4 flex flex-col gap-4">
          <details className="group">
            <summary className="text-sm font-medium text-masa-dark cursor-pointer list-none flex justify-between items-center">
              Furniture
              <svg className="w-4 h-4 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="mt-2 flex flex-col gap-2 pl-2">
              {furnitureLinks.map(link => (
                <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                  className="text-sm text-masa-gray hover:text-masa-accent">
                  {link.label}
                </Link>
              ))}
            </div>
          </details>

          <Link to="/shop"    className="text-sm font-medium text-masa-dark hover:text-masa-accent">Shop</Link>
          <Link to="/about"   className="text-sm font-medium text-masa-dark hover:text-masa-accent">About Us</Link>
          <Link to="/contact" className="text-sm font-medium text-masa-dark hover:text-masa-accent">Contact</Link>
          <hr className="border-masa-border" />

          {user ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-masa-dark">Dashboard</Link>
              <button onClick={() => { handleLogout(); setMobileOpen(false); }}
                className="text-sm font-medium text-red-500 text-left">Sign Out</button>
            </>
          ) : (
            <Link to="/login" className="btn-primary text-sm text-center">Sign In</Link>
          )}
        </div>
      )}
    </header>
  );
}
