/**
 * Nearby amenities around a listing — schools, hospitals, mosques and markets
 * within ~1.5km, from the free OpenStreetMap Overpass API (no key needed).
 * Uses the listing's public (approximate) coordinates.
 */
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { School, Stethoscope, ShoppingBag, Landmark } from 'lucide-react';

interface Counts {
  schools: number;
  hospitals: number;
  mosques: number;
  markets: number;
}

const RADIUS = 1500;

function buildQuery(lat: number, lng: number): string {
  const a = `around:${RADIUS},${lat},${lng}`;
  return `[out:json][timeout:20];(
    node["amenity"="school"](${a});
    node["amenity"~"hospital|clinic"](${a});
    node["amenity"="marketplace"](${a});
    node["shop"="supermarket"](${a});
    node["amenity"="place_of_worship"]["religion"="muslim"](${a});
  );out tags;`;
}

function categorize(elements: { tags?: Record<string, string> }[]): Counts {
  const c: Counts = { schools: 0, hospitals: 0, mosques: 0, markets: 0 };
  for (const el of elements) {
    const tags = el.tags || {};
    if (tags.amenity === 'school') c.schools++;
    else if (tags.amenity === 'hospital' || tags.amenity === 'clinic') c.hospitals++;
    else if (tags.amenity === 'place_of_worship' && tags.religion === 'muslim') c.mosques++;
    else if (tags.amenity === 'marketplace' || tags.shop === 'supermarket') c.markets++;
  }
  return c;
}

export default function NearbyAmenities({ lat, lng }: { lat: number; lng: number }) {
  const { t } = useTranslation();
  const [counts, setCounts] = useState<Counts | null>(null);
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);

    fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: buildQuery(lat, lng),
      signal: controller.signal,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (!active) return;
        setCounts(categorize(d.elements || []));
        setStatus('done');
      })
      .catch(() => active && setStatus('error'))
      .finally(() => clearTimeout(timer));

    return () => {
      active = false;
      controller.abort();
    };
  }, [lat, lng]);

  if (status === 'error') return null; // don't clutter if the free API is busy

  const items = [
    { Icon: School, label: t('listing.schools'), n: counts?.schools },
    { Icon: Stethoscope, label: t('listing.hospitals'), n: counts?.hospitals },
    { Icon: Landmark, label: t('listing.mosques'), n: counts?.mosques },
    { Icon: ShoppingBag, label: t('listing.markets'), n: counts?.markets },
  ];

  return (
    <section className="mt-6">
      <h2 className="mb-2 font-heading text-xl font-semibold text-ink">{t('listing.whatsNearby')}</h2>
      <p className="mb-3 text-sm text-ink-muted">{t('listing.nearbyWithin')}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map(({ Icon, label, n }) => (
          <div key={label} className="rounded-card border border-hairline bg-surface p-4 text-center">
            <Icon size={22} className="mx-auto text-primary" />
            <p className="mt-1 font-heading text-2xl font-semibold text-ink">
              {status === 'loading' ? '…' : (n ?? 0)}
            </p>
            <p className="text-xs text-ink-muted">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
