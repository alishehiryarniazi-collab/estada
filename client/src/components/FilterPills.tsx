/**
 * Quick-filter pills under the hero — a horizontally scrollable row on mobile.
 * Each pill jumps to the search page pre-filtered.
 */
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Building2, LandPlot, Store, Trees } from 'lucide-react';

const PILLS = [
  { key: 'pills.forSale', to: '/search?listingType=sale', Icon: Home },
  { key: 'pills.forRent', to: '/search?listingType=rent', Icon: Building2 },
  { key: 'pills.plots', to: '/search?propertyType=plot', Icon: LandPlot },
  { key: 'pills.commercial', to: '/search?propertyType=commercial', Icon: Store },
  { key: 'pills.agricultural', to: '/search?propertyType=agricultural', Icon: Trees },
];

export default function FilterPills() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {PILLS.map(({ key, to, Icon }) => (
          <Link
            key={key}
            to={to}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-hairline
                       bg-surface px-4 py-2 text-sm font-medium text-ink shadow-card
                       transition-colors hover:border-primary hover:text-primary"
          >
            <Icon size={16} />
            {t(key)}
          </Link>
        ))}
      </div>
    </div>
  );
}
