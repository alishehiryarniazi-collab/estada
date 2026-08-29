/**
 * Site footer — logo, short blurb, and grouped links. Navy background to close
 * the page with the brand colour.
 */
import { Link } from 'react-router-dom';
import Logo from './ui/Logo';

const GROUPS = [
  {
    title: 'Explore',
    links: [
      { label: 'For Sale', to: '/search?listingType=sale' },
      { label: 'For Rent', to: '/search?listingType=rent' },
      { label: 'Plots', to: '/search?propertyType=plot' },
      { label: 'Commercial', to: '/search?propertyType=commercial' },
    ],
  },
  {
    title: 'Tools',
    links: [
      { label: 'Mortgage calculator', to: '/tools?tab=mortgage' },
      { label: 'Affordability calculator', to: '/tools?tab=affordability' },
      { label: 'Area unit converter', to: '/tools?tab=area' },
    ],
  },
  {
    title: 'For dealers',
    links: [
      { label: 'Post a listing', to: '/post-listing' },
      { label: 'Dealer dashboard', to: '/dashboard' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-primary text-white/80">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <Logo variant="white" size={28} />
          <p className="mt-3 max-w-xs text-sm text-white/70">
            Verified property listings across Pakistan — search, shortlist and contact dealers
            directly.
          </p>
        </div>
        {GROUPS.map((g) => (
          <div key={g.title}>
            <h4 className="text-sm font-semibold text-white">{g.title}</h4>
            <ul className="mt-3 space-y-2">
              {g.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm text-white/70 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-5 text-xs text-white/60 sm:px-6">
          © {new Date().getFullYear()} Estada. Built for the Pakistani property market.
        </div>
      </div>
    </footer>
  );
}
