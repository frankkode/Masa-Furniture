import { Link } from 'react-router-dom';

/* ── Figma-accurate footer ──────────────────────────────────────
   White background, 4 columns:
     1. Brand + description
     2. Solutions  (Email Marketing / Campaigns / Branding)
     3. Furniture  (Beds / Chair / All)
     4. Follow Us  (Facebook / Twitter / Instagram — text links)
   Bottom bar: Copyright | Terms & Conditions | Privacy Policy
──────────────────────────────────────────────────────────────── */

const solutionsLinks = [
  { label: 'Email Marketing', to: '/shop' },
  { label: 'Campaigns',       to: '/shop' },
  { label: 'Branding',        to: '/shop' },
];

const furnitureLinks = [
  { label: 'Beds',  to: '/shop/beds'   },
  { label: 'Chair', to: '/shop/chairs' },
  { label: 'All',   to: '/shop'        },
];

const socialLinks = [
  { label: 'Facebook',  href: 'https://facebook.com'  },
  { label: 'Twitter',   href: 'https://twitter.com'   },
  { label: 'Instagram', href: 'https://instagram.com' },
];

export default function Footer() {
  return (
    <footer className="bg-white border-t border-masa-border">

      {/* Main grid */}
      <div className="container-main py-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">

        {/* ① Brand */}
        <div>
          <Link to="/" className="text-2xl font-bold text-masa-dark mb-4 block tracking-tight">
            Masa
          </Link>
          <p className="text-masa-gray text-sm leading-relaxed">
            Crafting spaces that inspire comfort and elegance.
            Quality furniture for modern living.
          </p>
        </div>

        {/* ② Solutions */}
        <div>
          <h3 className="text-sm font-bold text-masa-dark mb-5">Solutions</h3>
          <ul className="flex flex-col gap-3">
            {solutionsLinks.map(link => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className="text-sm text-masa-gray hover:text-masa-accent transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ③ Furniture */}
        <div>
          <h3 className="text-sm font-bold text-masa-dark mb-5">Furniture</h3>
          <ul className="flex flex-col gap-3">
            {furnitureLinks.map(link => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className="text-sm text-masa-gray hover:text-masa-accent transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ④ Follow Us */}
        <div>
          <h3 className="text-sm font-bold text-masa-dark mb-5">Follow Us</h3>
          <ul className="flex flex-col gap-3">
            {socialLinks.map(link => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-masa-gray hover:text-masa-accent transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-masa-border">
        <div className="container-main py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-masa-gray">
          <span>© {new Date().getFullYear()} Masa Furniture. All rights reserved.</span>
          <div className="flex gap-6">
            <Link to="/terms"   className="hover:text-masa-dark transition-colors">Terms &amp; Conditions</Link>
            <Link to="/privacy" className="hover:text-masa-dark transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>

    </footer>
  );
}
