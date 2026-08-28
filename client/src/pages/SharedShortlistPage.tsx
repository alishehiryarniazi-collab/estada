/**
 * View-only shared shortlist. The property ids come from the URL (?ids=a,b,c),
 * so anyone with the link can see the listings — no login needed. Read-only:
 * no hearts, no editing.
 */
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { PropertyCardSkeleton } from '../components/ui/Skeleton';
import { getProperty } from '../services/propertyService';
import { formatPricePKRLabeled, formatArea } from '../utils/formatPrice';
import type { PropertyDetail } from '../types/property';

export default function SharedShortlistPage() {
  const [params] = useSearchParams();
  const [items, setItems] = useState<PropertyDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = (params.get('ids') || '').split(',').filter(Boolean);
    if (ids.length === 0) {
      setLoading(false);
      return;
    }
    Promise.all(ids.map((id) => getProperty(id).catch(() => null)))
      .then((res) => setItems(res.filter((p): p is PropertyDetail => p !== null)))
      .finally(() => setLoading(false));
  }, [params]);

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="font-heading text-2xl font-semibold text-ink">A shared shortlist</h1>
        <p className="mt-1 text-sm text-ink-muted">Listings someone wanted you to see.</p>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <PropertyCardSkeleton key={i} />)
            : items.map((p) => (
                <Link
                  key={p.id}
                  to={`/listings/${p.id}`}
                  className="block overflow-hidden rounded-card border border-hairline bg-surface shadow-card transition-shadow hover:shadow-card-hover"
                >
                  <div className="aspect-[4/3] w-full bg-canvas">
                    {p.images[0] && (
                      <img src={p.images[0].imageUrl} alt={p.title} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-heading text-lg font-semibold text-primary">
                      {formatPricePKRLabeled(p.price)}
                    </p>
                    <h3 className="mt-1 line-clamp-1 text-body font-medium text-ink">{p.title}</h3>
                    <p className="mt-1 text-sm text-ink-muted">
                      {p.areaName}, {p.city} · {formatArea(p.areaValue, p.areaUnit)}
                    </p>
                  </div>
                </Link>
              ))}
        </div>

        {!loading && items.length === 0 && (
          <p className="mt-6 text-ink-muted">This shared shortlist is empty or the links have expired.</p>
        )}
      </main>
      <Footer />
    </div>
  );
}
