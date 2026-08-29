/**
 * Dealer reviews — average rating, the list, and a write-a-review form for
 * logged-in buyers (a dealer can't review themselves).
 */
import { useEffect, useState, type FormEvent } from 'react';
import { getDealerReviews, submitReview, type DealerReview } from '../services/dealerService';
import { apiErrorMessage } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import StarRating from './ui/StarRating';

export default function DealerReviews({ dealerId }: { dealerId: string }) {
  const user = useAuthStore((s) => s.user);
  const openAuth = useUiStore((s) => s.openAuth);
  const [reviews, setReviews] = useState<DealerReview[]>([]);
  const [rating, setRating] = useState<{ avg: number | null; count: number }>({ avg: null, count: 0 });
  const [myRating, setMyRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const load = () => getDealerReviews(dealerId).then((d) => {
    setReviews(d.reviews);
    setRating(d.rating);
  });

  useEffect(() => {
    load().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealerId]);

  const canReview = user && user.id !== dealerId;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!myRating) return setError('Please pick a star rating.');
    setBusy(true);
    setError(null);
    try {
      await submitReview(dealerId, myRating, comment || undefined);
      setDone(true);
      setComment('');
      setMyRating(0);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center gap-3">
        <h2 className="font-heading text-lg font-semibold text-ink">Reviews</h2>
        {rating.avg != null && (
          <span className="flex items-center gap-1.5 text-sm text-ink-muted">
            <StarRating value={rating.avg} size={15} />
            <span className="font-medium text-ink">{rating.avg}</span> ({rating.count})
          </span>
        )}
      </div>

      {/* Write a review */}
      {canReview ? (
        done ? (
          <div className="mb-4 rounded-card border border-verify/30 bg-verify-light p-4 text-sm text-verify">
            Thanks for your review!
          </div>
        ) : (
          <form onSubmit={submit} className="mb-5 rounded-card border border-hairline bg-surface p-4">
            <p className="mb-1 text-sm font-medium text-ink">Rate this dealer</p>
            <StarRating value={myRating} onChange={setMyRating} readonly={false} size={24} />
            {error && <p className="mt-2 text-sm text-cta">{error}</p>}
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Share your experience (optional)…"
              className="mt-3 w-full rounded-lg border border-hairline bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="submit"
              disabled={busy}
              className="mt-3 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-light disabled:opacity-60"
            >
              {busy ? 'Submitting…' : 'Submit review'}
            </button>
          </form>
        )
      ) : !user ? (
        <button onClick={() => openAuth('login')} className="mb-4 text-sm font-medium text-primary hover:underline">
          Log in to leave a review
        </button>
      ) : null}

      {/* List */}
      {reviews.length === 0 ? (
        <p className="text-sm text-ink-muted">No reviews yet.</p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-card border border-hairline bg-surface p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-ink">{r.author.name}</span>
                <StarRating value={r.rating} size={14} />
              </div>
              {r.comment && <p className="mt-1.5 text-sm text-ink/90">{r.comment}</p>}
              <p className="mt-1 text-xs text-ink-muted">
                {new Date(r.createdAt).toLocaleDateString('en-PK')}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
