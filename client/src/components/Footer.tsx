/**
 * Site footer — logo, short blurb, and grouped links. Navy background to close
 * the page with the brand colour.
 */
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Logo from './ui/Logo';

const GROUPS = [
  {
    titleKey: 'footer.explore',
    links: [
      { labelKey: 'nav.forSale', to: '/search?listingType=sale' },
      { labelKey: 'nav.forRent', to: '/search?listingType=rent' },
      { labelKey: 'nav.plots', to: '/search?propertyType=plot' },
      { labelKey: 'nav.commercial', to: '/search?propertyType=commercial' },
    ],
  },
  {
    titleKey: 'footer.tools',
    links: [
      { labelKey: 'footer.mortgage', to: '/tools?tab=mortgage' },
      { labelKey: 'footer.affordability', to: '/tools?tab=affordability' },
      { labelKey: 'footer.areaConverter', to: '/tools?tab=area' },
    ],
  },
  {
    titleKey: 'footer.forDealers',
    links: [
      { labelKey: 'footer.postListing', to: '/post-listing' },
      { labelKey: 'footer.dashboard', to: '/dashboard' },
    ],
  },
];

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-primary text-white/80">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <Logo variant="white" size={28} />
          <p className="mt-3 max-w-xs text-sm text-white/70">{t('footer.tagline')}</p>
        </div>
        {GROUPS.map((g) => (
          <div key={g.titleKey}>
            <h4 className="text-sm font-semibold text-white">{t(g.titleKey)}</h4>
            <ul className="mt-3 space-y-2">
              {g.links.map((l) => (
                <li key={l.labelKey}>
                  <Link to={l.to} className="text-sm text-white/70 transition-colors hover:text-white">
                    {t(l.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-5 text-xs text-white/60 sm:px-6">
          © {new Date().getFullYear()} Estada. {t('footer.rights')}
        </div>
      </div>
    </footer>
  );
}
