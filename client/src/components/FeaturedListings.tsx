/**
 * "Featured / Verified Listings" section — fetches from the live API and shows
 * a responsive card grid (2-col mobile → 3-4 col desktop). Renders skeleton
 * loaders while fetching and clear empty/error states (Section 8).
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { searchProperties } from '../services/propertyService';
import { apiErrorMessage } from '../lib/api';
import type { PropertyCard as Card } from '../types/property';
import PropertyCard from './PropertyCard';
import { PropertyCardSkeleton } from './ui/Skeleton';

export default function FeaturedListings() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    searchProperties({ limit: 8, sort: 'newest' })
      .then((res) => active && setItems(res.items))
      .catch((err) => active && setError(apiErrorMessage(err)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-ink">{t('featured.title')}</h2>
          <p className="mt-1 text-sm text-ink-muted">{t('featured.subtitle')}</p>
        </div>
        <Link
          to="/search"
          className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:inline-flex"
        >
          {t('featured.viewAll')} <ArrowRight size={16} />
        </Link>
      </div>

      {error ? (
        <div className="rounded-card border border-hairline bg-surface p-8 text-center">
          <p className="text-ink-muted">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <PropertyCardSkeleton key={i} />)
            : items.map((p) => <PropertyCard key={p.id} property={p} />)}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="rounded-card border border-hairline bg-surface p-8 text-center text-ink-muted">
          No listings yet — check back soon.
        </div>
      )}
    </section>
  );
}
