/**
 * Public dealer profile — the agency's info + all their active listings.
 */
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BadgeCheck, Building2, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PropertyCard from '../components/PropertyCard';
import { PropertyCardSkeleton } from '../components/ui/Skeleton';
import StarRating from '../components/ui/StarRating';
import DealerReviews from '../components/DealerReviews';
import { getDealerProfile, type DealerProfile } from '../services/dealerService';
import { apiErrorMessage } from '../lib/api';

export default function DealerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [data, setData] = useState<DealerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getDealerProfile(id)
      .then(setData)
      .catch((e) => setError(apiErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [id]);

  const dealer = data?.dealer;
  const verified = dealer?.dealerProfile?.verificationStatus === 'verified';

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        {loading ? (
          <p className="text-ink-muted">{t('common.loading')}</p>
        ) : error || !dealer ? (
          <p className="text-ink-muted">{error || t('dealer.notFound')}</p>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-4 rounded-card border border-hairline bg-surface p-6">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-primary text-white">
                <Building2 size={28} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-heading text-2xl font-semibold text-ink">
                    {dealer.dealerProfile?.businessName || dealer.name}
                  </h1>
                  {verified && <BadgeCheck className="text-verify" size={22} />}
                </div>
                {dealer.dealerProfile?.bio && (
                  <p className="mt-1 max-w-2xl text-sm text-ink-muted">{dealer.dealerProfile.bio}</p>
                )}
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
                  {data.rating.avg != null && (
                    <span className="flex items-center gap-1.5">
                      <StarRating value={data.rating.avg} size={15} />
                      <span className="font-medium text-ink">{data.rating.avg}</span>
                      ({data.rating.count})
                    </span>
                  )}
                  {data.responseLabel && (
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> {t(data.responseLabel)}
                    </span>
                  )}
                  <span>{t('dealer.memberSince', { year: new Date(dealer.createdAt).getFullYear() })}</span>
                </div>
              </div>
            </div>

            {/* Listings */}
            <h2 className="mb-3 mt-8 font-heading text-lg font-semibold text-ink">
              {t('dealer.listings', { n: data.listings.length })}
            </h2>
            {loading ? (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <PropertyCardSkeleton key={i} />
                ))}
              </div>
            ) : data.listings.length === 0 ? (
              <p className="text-ink-muted">{t('dealer.noListings')}</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {data.listings.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            )}

            <DealerReviews dealerId={dealer.id} />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
