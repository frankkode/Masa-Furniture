import { Link } from 'react-router-dom';

const solutionsLinks = [
  { label: 'Shop All',     to: '/shop' },
  { label: 'New Arrivals', to: '/shop?sort=created_at&order=DESC' },
  { label: 'Best Sellers', to: '/shop?featured=true' },
  { label: 'Sale',         to: '/shop?sort=sale_price' },
];

const furnitureLinks = [
  { label: 'Chairs',  to: '/shop/chairs' },
  { label: 'Beds',    to: '/shop/beds' },
  { label: 'Sofas',   to: '/shop/sofas' },
  { label: 'Tables',  to: '/shop/tables' },
  { label: 'Shelves', to: '/shop/shelf' },
  { label: 'Lamps',   to: '/shop/lamp' },
];

function SocialIcon({ href, label, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:bg-masa-accent hover:border-masa-accent hover:text-white transition-colors"
    >
      {children}
    </a>
  );
}

export default function Footer() {
  return (
    <footer className="bg-masa-dark text-white">
      {/* Main footer grid */}
      <div className="container-main py-14 grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Brand column */}
        <div className="md:col-span-1">
          <Link to="/" className="text-2xl font-bold tracking-tight text-white mb-4 block">
            Masa
          </Link>
          <p className="text-white/60 text-sm leading-relaxed mb-6">
            Crafting spaces that inspire comfort and elegance. Quality furniture for modern living.
          </p>
          {/* Social icons */}
          <div className="flex gap-3">
            <SocialIcon href="https://facebook.com" label="Facebook">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
              </svg>
            </SocialIcon>
            <SocialIcon href="https://twitter.com" label="Twitter / X">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </SocialIcon>
            <SocialIcon href="https://instagram.com" label="Instagram">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </SocialIcon>
          </div>
        </div>

        {/* Spacer on desktop */}
        <div className="hidden md:block" />

        {/* Solutions links */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white/40 mb-5">
            Solutions
          </h3>
          <ul className="flex flex-col gap-3">
            {solutionsLinks.map(link => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-sm text-white/70 hover:text-masa-accent transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Furniture links */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white/40 mb-5">
            Furniture
          </h3>
          <ul className="flex flex-col gap-3">
            {furnitureLinks.map(link => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-sm text-white/70 hover:text-masa-accent transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-main py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/40">
          <span>© {new Date().getFullYear()} Masa Furniture. All rights reserved.</span>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms"   className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
