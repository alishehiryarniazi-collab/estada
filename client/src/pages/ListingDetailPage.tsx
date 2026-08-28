/**
 * Listing detail page. Photo gallery, price + key facts, full spec table,
 * (collapsible) description, optional floor plan, an approximate/exact location
 * map, and a sticky enquiry sidebar. Report button in the footer of the content.
 */
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BedDouble, Bath, Maximize, MapPin, ShieldCheck, BadgeCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Gallery from '../components/listing/Gallery';
import SpecTable from '../components/listing/SpecTable';
import LocationMap from '../components/listing/LocationMap';
import EnquiryForm from '../components/listing/EnquiryForm';
import ReportButton from '../components/listing/ReportButton';
import PriceInsight from '../components/listing/PriceInsight';
import Badge from '../components/ui/Badge';
import HeartButton from '../components/ui/HeartButton';
import Skeleton from '../components/ui/Skeleton';
import { getProperty } from '../services/propertyService';
import { apiErrorMessage } from '../lib/api';
import { formatPricePKRLabeled, formatArea } from '../utils/formatPrice';
import { getFreshness } from '../utils/freshness';
import { useAuthStore } from '../store/authStore';
import type { PropertyDetail } from '../types/property';

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const load = () => {
    if (!id) return;
    setLoading(true);
    getProperty(id)
      .then(setProperty)
      .catch((e) => setError(apiErrorMessage(e)))
      .finally(() => setLoading(false));
  };

  // Refetch on id or login change (owner/enquired viewers get the exact address).
  useEffect(load, [id, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <Skeleton className="aspect-[16/10] w-full" />
          <Skeleton className="mt-4 h-8 w-1/2" />
          <Skeleton className="mt-2 h-4 w-1/3" />
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="flex min-h-screen flex-col bg-canvas">
        <Navbar />
        <div className="mx-auto flex max-w-3xl flex-1 flex-col items-center justify-center px-6 py-20 text-center">
          <p className="text-ink-muted">{error || 'Listing not found.'}</p>
          <Link to="/search" className="mt-4 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white">
            Back to search
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const perMonth = property.listingType === 'rent';
  const longDesc = property.description.length > 350;

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <Link to="/search" className="mb-3 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-primary">
          <ArrowLeft size={16} /> Back to results
        </Link>

        <Gallery images={property.images} title={property.title} />

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="flex flex-wrap items-center gap-2">
              {property.isDocumentVerified && (
                <Badge tone="verified" withIcon>
                  Documents Verified
                </Badge>
              )}
              {property.isFeatured && <Badge tone="featured">Featured</Badge>}
              <Badge tone={perMonth ? 'rent' : 'sale'}>{perMonth ? 'For Rent' : 'For Sale'}</Badge>
            </div>

            <div className="mt-3 flex items-start justify-between gap-3">
              <h1 className="font-heading text-3xl font-semibold text-ink">{property.title}</h1>
              <HeartButton propertyId={property.id} className="mt-1 h-10 w-10 shrink-0 border border-hairline" />
            </div>
            <p className="mt-1 flex items-center gap-1 text-ink-muted">
              <MapPin size={16} /> {property.areaName}, {property.city}
            </p>

            <p className="mt-3 font-heading text-3xl font-semibold text-primary">
              {formatPricePKRLabeled(property.price)}
              {perMonth && <span className="text-lg font-normal text-ink-muted"> / month</span>}
            </p>

            {/* Freshness — how recently the dealer confirmed availability */}
            {(() => {
              const fresh = getFreshness(property.lastConfirmedAt);
              return (
                <p className={`mt-1 flex items-center gap-1.5 text-sm ${fresh.stale ? 'text-cta' : 'text-ink-muted'}`}>
                  {fresh.stale ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
                  {fresh.label}
                </p>
              );
            })()}

            {/* Key specs */}
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-y border-hairline py-3 text-ink">
              {property.bedrooms != null && (
                <span className="flex items-center gap-1.5">
                  <BedDouble size={18} className="text-ink-muted" /> {property.bedrooms} Beds
                </span>
              )}
              {property.bathrooms != null && (
                <span className="flex items-center gap-1.5">
                  <Bath size={18} className="text-ink-muted" /> {property.bathrooms} Baths
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Maximize size={18} className="text-ink-muted" />{' '}
                {formatArea(property.areaValue, property.areaUnit)}
              </span>
            </div>

            {/* Description */}
            <section className="mt-6">
              <h2 className="font-heading text-xl font-semibold text-ink">Description</h2>
              <p
                className={`mt-2 whitespace-pre-line text-ink/90 ${!expanded && longDesc ? 'line-clamp-4' : ''}`}
              >
                {property.description}
              </p>
              {longDesc && (
                <button
                  onClick={() => setExpanded((v) => !v)}
                  className="mt-1 text-sm font-medium text-primary hover:underline"
                >
                  {expanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </section>

            {/* Spec table */}
            <section className="mt-6">
              <h2 className="mb-2 font-heading text-xl font-semibold text-ink">Details</h2>
              <SpecTable property={property} />
            </section>

            {/* Fair-price insight + price history */}
            <PriceInsight propertyId={property.id} />

            {/* Floor plan (optional) */}
            {property.floorPlanUrl && (
              <section className="mt-6">
                <h2 className="mb-2 font-heading text-xl font-semibold text-ink">Floor plan</h2>
                <img
                  src={property.floorPlanUrl}
                  alt="Floor plan"
                  className="w-full rounded-card border border-hairline"
                />
              </section>
            )}

            {/* Location */}
            <section className="mt-6">
              <h2 className="mb-2 font-heading text-xl font-semibold text-ink">Location</h2>
              {property.address && (
                <p className="mb-2 text-sm text-ink">{property.address}</p>
              )}
              <LocationMap lat={property.lat} lng={property.lng} approximate={property.approximate} />
            </section>

            <div className="mt-6 border-t border-hairline pt-4">
              <ReportButton propertyId={property.id} />
            </div>
          </div>

          {/* Sticky sidebar: dealer + enquiry */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-4">
              {/* Dealer card */}
              <div className="rounded-card border border-hairline bg-surface p-5">
                <p className="text-xs uppercase tracking-wide text-ink-muted">Listed by</p>
                <div className="mt-1 flex items-center gap-2">
                  <Link
                    to={`/dealers/${property.dealer.id}`}
                    className="font-heading text-lg font-semibold text-ink hover:text-primary hover:underline"
                  >
                    {property.dealer.dealerProfile?.businessName || property.dealer.name}
                  </Link>
                  {property.dealer.dealerProfile?.verificationStatus === 'verified' && (
                    <BadgeCheck size={18} className="text-verify" />
                  )}
                </div>
                <p className="mt-1 flex items-center gap-1 text-sm text-ink-muted">
                  <ShieldCheck size={14} className="text-verify" /> Identity checked dealer
                </p>
              </div>

              <EnquiryForm property={property} onEnquired={load} />
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}
