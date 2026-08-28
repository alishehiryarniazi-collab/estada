/**
 * Dashboard. Dealers/owners manage their listings (status, edit, publish drafts)
 * and see basic counts. Everyone sees their saved searches. Buyers are pointed
 * to their shortlist.
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Eye, Heart, MessageSquare, Trash2, Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Badge from '../components/ui/Badge';
import { getMyListings, updateListingStatus, updateListing, renewListing, confirmAvailability, type MyListing } from '../services/propertyService';
import { uploadDocument } from '../services/documentService';
import { getFreshness } from '../utils/freshness';
import { listSavedSearches, deleteSavedSearch, type SavedSearch } from '../services/savedService';
import { formatPricePKRLabeled } from '../utils/formatPrice';
import { apiErrorMessage } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';

const STATUS = ['active', 'under_offer', 'sold', 'expired'];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const openAuth = useUiStore((s) => s.openAuth);
  const navigate = useNavigate();
  const isDealer = user && user.role !== 'buyer';

  const [listings, setListings] = useState<MyListing[]>([]);
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    Promise.all([isDealer ? getMyListings() : Promise.resolve([]), listSavedSearches()])
      .then(([l, s]) => {
        setListings(l);
        setSearches(s);
      })
      .catch((e) => setError(apiErrorMessage(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const changeStatus = async (id: string, status: string) => {
    await updateListingStatus(id, status);
    load();
  };
  const publishDraft = async (id: string) => {
    await updateListing(id, { isDraft: false });
    load();
  };
  const removeSearch = async (id: string) => {
    await deleteSavedSearch(id);
    setSearches((s) => s.filter((x) => x.id !== id));
  };
  const renew = async (id: string) => {
    await renewListing(id);
    load();
  };
  const confirmAvail = async (id: string) => {
    await confirmAvailability(id);
    load();
  };
  const [docMsg, setDocMsg] = useState<string | null>(null);
  const onDoc = async (id: string, file?: File) => {
    if (!file) return;
    try {
      await uploadDocument(id, file);
      setDocMsg('Document uploaded — an admin will review it shortly.');
      setTimeout(() => setDocMsg(null), 4000);
    } catch (e) {
      setDocMsg(apiErrorMessage(e));
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-canvas">
        <Navbar />
        <main className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-6 text-center">
          <p className="text-ink">Log in to see your dashboard.</p>
          <button onClick={() => openAuth('login')} className="mt-4 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white">
            Log in
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-ink">Dashboard</h1>
            <p className="text-sm text-ink-muted">Welcome back, {user.name.split(' ')[0]}.</p>
          </div>
          {isDealer && (
            <Link to="/post-listing" className="inline-flex items-center gap-1.5 rounded-lg bg-cta px-4 py-2.5 text-sm font-medium text-white hover:bg-cta-hover">
              <Plus size={16} /> Post a listing
            </Link>
          )}
        </div>

        {error && <p className="mt-4 text-sm text-cta">{error}</p>}
        {docMsg && (
          <p className="mt-4 rounded-lg border border-verify/30 bg-verify-light px-3 py-2 text-sm text-verify">{docMsg}</p>
        )}

        {/* Listings (dealers/owners) */}
        {isDealer && (
          <section className="mt-8">
            <h2 className="mb-3 font-heading text-lg font-semibold text-ink">My listings</h2>
            {loading ? (
              <p className="text-ink-muted">Loading…</p>
            ) : listings.length === 0 ? (
              <div className="rounded-card border border-hairline bg-surface p-8 text-center text-ink-muted">
                No listings yet. Post your first one!
              </div>
            ) : (
              <div className="space-y-3">
                {listings.map((l) => (
                  <div key={l.id} className="flex flex-col gap-3 rounded-card border border-hairline bg-surface p-3 sm:flex-row sm:items-center">
                    <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-canvas">
                      {l.images[0] && <img src={l.images[0].imageUrl} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link to={`/listings/${l.id}`} className="line-clamp-1 font-medium text-ink hover:text-primary">
                          {l.title}
                        </Link>
                        {l.isDraft && <Badge tone="featured">Draft</Badge>}
                      </div>
                      <p className="text-sm text-primary">{formatPricePKRLabeled(l.price)}</p>
                      <div className="mt-1 flex gap-4 text-xs text-ink-muted">
                        <span className="flex items-center gap-1"><Eye size={13} /> {l.viewCount}</span>
                        <span className="flex items-center gap-1"><Heart size={13} /> {l.saveCount}</span>
                        <span className="flex items-center gap-1"><MessageSquare size={13} /> {l.enquiryCount}</span>
                      </div>
                      {!l.isDraft && (
                        <p className={`mt-1 text-xs ${getFreshness(l.lastConfirmedAt).stale ? 'text-cta' : 'text-ink-muted'}`}>
                          {getFreshness(l.lastConfirmedAt).label}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {l.isDraft ? (
                        <button onClick={() => publishDraft(l.id)} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white">
                          Publish
                        </button>
                      ) : (
                        <select
                          value={l.status}
                          onChange={(e) => changeStatus(l.id, e.target.value)}
                          className="rounded-lg border border-hairline bg-white px-2 py-1.5 text-xs text-ink outline-none"
                        >
                          {STATUS.map((s) => (
                            <option key={s} value={s}>
                              {s.replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      )}
                      {l.status === 'expired' && (
                        <button onClick={() => renew(l.id)} className="rounded-lg bg-verify px-3 py-1.5 text-xs font-medium text-white">
                          Renew
                        </button>
                      )}
                      {!l.isDraft && l.status === 'active' && (
                        <button
                          onClick={() => confirmAvail(l.id)}
                          className="rounded-lg border border-verify px-3 py-1.5 text-xs font-medium text-verify hover:bg-verify-light"
                          title="Confirm this listing is still available"
                        >
                          Confirm available
                        </button>
                      )}
                      <label className="cursor-pointer rounded-lg border border-hairline px-3 py-1.5 text-xs font-medium text-ink hover:bg-canvas" title="Upload ownership document for verification">
                        <input type="file" accept="image/*" hidden onChange={(e) => onDoc(l.id, e.target.files?.[0])} />
                        {l.isDocumentVerified ? 'Verified ✓' : 'Docs'}
                      </label>
                      <button onClick={() => navigate(`/post-listing?edit=${l.id}`)} className="rounded-lg border border-hairline px-3 py-1.5 text-xs font-medium text-ink hover:bg-canvas">
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Saved searches (everyone) */}
        <section className="mt-8">
          <h2 className="mb-3 font-heading text-lg font-semibold text-ink">Saved searches</h2>
          {searches.length === 0 ? (
            <div className="rounded-card border border-hairline bg-surface p-6 text-center text-ink-muted">
              No saved searches. Save one from the search page to get alerts.
            </div>
          ) : (
            <div className="space-y-2">
              {searches.map((s) => {
                const qs = new URLSearchParams(s.searchParams as Record<string, string>).toString();
                return (
                  <div key={s.id} className="flex items-center justify-between rounded-lg border border-hairline bg-surface px-4 py-3">
                    <div className="min-w-0">
                      <p className="line-clamp-1 text-sm text-ink">
                        {Object.entries(s.searchParams).map(([k, v]) => `${k}: ${v}`).join(' · ') || 'All listings'}
                      </p>
                      <p className="text-xs text-ink-muted">Alerts: {s.alertFrequency}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to={`/search?${qs}`} className="inline-flex items-center gap-1 rounded-lg border border-hairline px-3 py-1.5 text-xs font-medium text-ink hover:bg-canvas">
                        <Search size={13} /> Run
                      </Link>
                      <button onClick={() => removeSearch(s.id)} className="rounded-lg p-1.5 text-ink-muted hover:text-cta" aria-label="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
