/**
 * Shortlist — the buyer's saved listings, with a "Share" button that copies a
 * view-only link (the property ids in the URL) to send to family.
 */
import { useEffect, useState } from 'react';
import { Share2, Check, Heart } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PropertyCard from '../components/PropertyCard';
import { PropertyCardSkeleton } from '../components/ui/Skeleton';
import { getSavedList } from '../services/savedService';
import { apiErrorMessage } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import type { PropertyCard as Card } from '../types/property';

export default function ShortlistPage() {
  const user = useAuthStore((s) => s.user);
  const openAuth = useUiStore((s) => s.openAuth);
  const [items, setItems] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    getSavedList()
      .then(setItems)
      .catch((e) => setError(apiErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [user]);

  const share = async () => {
    const url = `${location.origin}/shortlist/shared?ids=${items.map((i) => i.id).join(',')}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link to share your shortlist:', url);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-heading text-2xl font-semibold text-ink">Your shortlist</h1>
          {items.length > 0 && (
            <button
              onClick={share}
              className="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-canvas"
            >
              {copied ? <Check size={16} className="text-verify" /> : <Share2 size={16} />}
              {copied ? 'Link copied' : 'Share'}
            </button>
          )}
        </div>

        {!user ? (
          <div className="rounded-card border border-hairline bg-surface p-10 text-center">
            <Heart className="mx-auto text-hairline" size={40} />
            <p className="mt-3 text-ink">Log in to see the listings you've saved.</p>
            <button
              onClick={() => openAuth('login')}
              className="mt-4 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-light"
            >
              Log in
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <p className="text-ink-muted">{error}</p>
        ) : items.length === 0 ? (
          <div className="rounded-card border border-hairline bg-surface p-10 text-center text-ink-muted">
            No saved listings yet. Tap the heart on any listing to add it here.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {items.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
