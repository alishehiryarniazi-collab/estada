/**
 * PropertyCard — the listing card used in grids across the app.
 * Shows photo (or an icon placeholder), trust/type badges, PKR price, key
 * specs and location. Hover lifts the card with a subtle shadow.
 */
import { Link } from 'react-router-dom';
import { BedDouble, Bath, Maximize, MapPin, Home, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { PropertyCard as Card } from '../types/property';
import { formatPricePKRLabeled, formatArea } from '../utils/formatPrice';
import { getFreshness } from '../utils/freshness';
import Badge from './ui/Badge';
import HeartButton from './ui/HeartButton';

const TYPE_LABEL: Record<Card['propertyType'], string> = {
  house: 'House',
  plot: 'Plot',
  flat: 'Flat',
  commercial: 'Commercial',
  agricultural: 'Agricultural',
};

export default function PropertyCard({ property }: { property: Card }) {
  const primary = property.images[0]?.imageUrl;
  const perMonth = property.listingType === 'rent';
  const fresh = getFreshness(property.lastConfirmedAt);

  return (
    <Link
      to={`/listings/${property.id}`}
      className="group block overflow-hidden rounded-card border border-hairline bg-surface
                 shadow-card transition-[transform,box-shadow] duration-200 hover:-translate-y-1
                 hover:shadow-card-hover"
    >
      {/* Photo + overlaid badges */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-canvas">
        {primary ? (
          <img
            src={primary}
            alt={property.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          // Empty state — flat house icon on light gray (never a stretched image).
          <div className="flex h-full w-full items-center justify-center text-hairline">
            <Home size={48} strokeWidth={1.5} />
          </div>
        )}

        <div className="absolute left-2 top-2 flex gap-1">
          {property.isDocumentVerified && (
            <Badge tone="verified" withIcon>
              Verified
            </Badge>
          )}
        </div>
        <div className="absolute right-2 top-2">
          <HeartButton propertyId={property.id} />
        </div>
        <div className="absolute bottom-2 left-2 flex gap-1">
          {property.isFeatured && <Badge tone="featured">Featured</Badge>}
          <Badge tone={perMonth ? 'rent' : 'sale'}>{perMonth ? 'For Rent' : 'For Sale'}</Badge>
        </div>
      </div>

      {/* Details */}
      <div className="p-4">
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-heading text-lg font-semibold text-primary">
            {formatPricePKRLabeled(property.price)}
            {perMonth && <span className="text-sm font-normal text-ink-muted">/mo</span>}
          </p>
          <span className="shrink-0 text-xs text-ink-muted">{TYPE_LABEL[property.propertyType]}</span>
        </div>

        <h3 className="mt-1 line-clamp-1 text-body font-medium text-ink">{property.title}</h3>

        <p className="mt-1 flex items-center gap-1 text-sm text-ink-muted">
          <MapPin size={14} className="shrink-0" />
          <span className="line-clamp-1">
            {property.areaName}, {property.city}
          </span>
        </p>

        {/* Specs */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
          {property.bedrooms != null && (
            <span className="flex items-center gap-1">
              <BedDouble size={15} /> {property.bedrooms}
            </span>
          )}
          {property.bathrooms != null && (
            <span className="flex items-center gap-1">
              <Bath size={15} /> {property.bathrooms}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Maximize size={15} /> {formatArea(property.areaValue, property.areaUnit)}
          </span>
        </div>

        {/* Freshness — anti-stale trust signal */}
        <p
          className={`mt-2 flex items-center gap-1 text-xs ${
            fresh.stale ? 'text-cta' : 'text-ink-muted'
          }`}
        >
          {fresh.stale ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
          {fresh.label}
        </p>
      </div>
    </Link>
  );
}
