/**
 * "Report this listing" — opens a small dialog to submit a reason. Flagged
 * listings go to the admin moderation queue (Section 5). Requires login.
 */
import { useState, type FormEvent } from 'react';
import { Flag, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { reportProperty } from '../../services/propertyService';
import { apiErrorMessage } from '../../lib/api';

export default function ReportButton({ propertyId }: { propertyId: string }) {
  const user = useAuthStore((s) => s.user);
  const openAuth = useUiStore((s) => s.openAuth);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);

  const trigger = () => {
    if (!user) return openAuth('login');
    setOpen(true);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setState('busy');
    setError(null);
    try {
      await reportProperty(propertyId, reason);
      setState('done');
    } catch (err) {
      setError(apiErrorMessage(err));
      setState('idle');
    }
  };

  return (
    <>
      <button
        onClick={trigger}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-cta"
      >
        <Flag size={15} /> Report this listing
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-heading text-lg font-semibold text-ink">Report listing</h3>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-ink-muted hover:text-ink">
                <X size={20} />
              </button>
            </div>

            {state === 'done' ? (
              <p className="text-sm text-ink">
                Thanks — our moderation team will review this listing. You can close this window.
              </p>
            ) : (
              <form onSubmit={submit}>
                <p className="mb-2 text-sm text-ink-muted">
                  Tell us what's wrong (fake listing, wrong price, already sold, scam, etc.).
                </p>
                {error && <p className="mb-2 text-sm text-cta">{error}</p>}
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  required
                  minLength={5}
                  className="w-full rounded-lg border border-hairline bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Describe the problem…"
                />
                <button
                  type="submit"
                  disabled={state === 'busy'}
                  className="mt-3 w-full rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-light disabled:opacity-60"
                >
                  {state === 'busy' ? 'Submitting…' : 'Submit report'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
