/**
 * Quick-filter pills under the hero — a horizontally scrollable row on mobile.
 * Each pill jumps to the search page pre-filtered.
 */
import { Link } from 'react-router-dom';
import { Home, Building2, LandPlot, Store, Trees } from 'lucide-react';

const PILLS = [
  { label: 'For Sale', to: '/search?listingType=sale', Icon: Home },
  { label: 'For Rent', to: '/search?listingType=rent', Icon: Building2 },
  { label: 'Plots', to: '/search?propertyType=plot', Icon: LandPlot },
  { label: 'Commercial', to: '/search?propertyType=commercial', Icon: Store },
  { label: 'Agricultural', to: '/search?propertyType=agricultural', Icon: Trees },
];

export default function FilterPills() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {PILLS.map(({ label, to, Icon }) => (
          <Link
            key={label}
            to={to}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-hairline
                       bg-surface px-4 py-2 text-sm font-medium text-ink shadow-card
                       transition-colors hover:border-primary hover:text-primary"
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
