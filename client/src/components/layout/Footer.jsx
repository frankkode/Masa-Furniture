import { Link } from 'react-router-dom';

/* ── Figma-accurate footer ──────────────────────────────────────
   Light gray background (#f5f5f5), 4 columns:
     1. Brand + description
     2. Services  (orange header) — Email Marketing / Campaigns / Branding
     3. Furniture (orange header) — Beds / Chair / All
     4. Follow Us (orange header) — Facebook / Twitter / Instagram with icons
   Bottom bar: Copyright © | Terms & Conditions | Privacy Policy
──────────────────────────────────────────────────────────────── */

const servicesLinks = [
  { label: 'Email Marketing', to: '/shop' },
  { label: 'Campaigns',       to: '/shop' },
  { label: 'Branding',        to: '/shop' },
];

const furnitureLinks = [
  { label: 'Beds',  to: '/shop/beds'   },
  { label: 'Chair', to: '/shop/chairs' },
  { label: 'All',   to: '/shop'        },
];

export default function Footer() {
  return (
    <footer style={{ background: '#f5f5f5' }}>

      {/* Main grid */}
      <div className="container-main py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">

        {/* ① Brand */}
        <div>
          <Link to="/" className="text-2xl font-bold text-masa-dark mb-4 block">
            Masa
          </Link>
          <p className="text-masa-gray text-sm leading-relaxed">
            The advantage of hiring a workspace with us is that givees you comfortable service
            and all-around facilities.
          </p>
        </div>

        {/* ② Services */}
        <div>
          <h3 className="text-sm font-semibold text-masa-accent mb-5">Services</h3>
          <ul className="flex flex-col gap-3">
            {servicesLinks.map(link => (
              <li key={link.label}>
                <Link to={link.to}
                  className="text-sm text-masa-gray hover:text-masa-dark transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ③ Furniture */}
        <div>
          <h3 className="text-sm font-semibold text-masa-accent mb-5">Furniture</h3>
          <ul className="flex flex-col gap-3">
            {furnitureLinks.map(link => (
              <li key={link.label}>
                <Link to={link.to}
                  className="text-sm text-masa-gray hover:text-masa-dark transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ④ Follow Us — icon + text links */}
        <div>
          <h3 className="text-sm font-semibold text-masa-accent mb-5">Follow Us</h3>
          <ul className="flex flex-col gap-3">
            <li>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-masa-gray hover:text-masa-dark transition-colors">
                {/* Facebook icon */}
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                </svg>
                Facebook
              </a>
            </li>
            <li>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-masa-gray hover:text-masa-dark transition-colors">
                {/* Twitter/X icon */}
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Twitter
              </a>
            </li>
            <li>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-masa-gray hover:text-masa-dark transition-colors">
                {/* Instagram icon */}
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" strokeWidth={1.75}>
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
                Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200">
        <div className="container-main py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-masa-gray">
          <span>Copyright © {new Date().getFullYear()}</span>
          <div className="flex gap-8">
            <Link to="/terms"   className="hover:text-masa-dark transition-colors">Terms &amp; Conditions</Link>
            <Link to="/privacy" className="hover:text-masa-dark transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>

    </footer>
  );
}
