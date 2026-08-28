/**
 * Enquiry / contact-dealer form. Requires login (the enquiry is tied to the
 * buyer's account and opens an in-app chat thread). Pre-fills the message with
 * a listing reference. On success the parent refetches so the now-unlocked
 * exact address appears. This is the single coral CTA on the detail page.
 */
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, LogIn } from 'lucide-react';
import type { PropertyDetail } from '../../types/property';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { submitEnquiry } from '../../services/enquiryService';
import { apiErrorMessage } from '../../lib/api';
import Input from '../ui/Input';

export default function EnquiryForm({
  property,
  onEnquired,
}: {
  property: PropertyDetail;
  onEnquired: () => void;
}) {
  const user = useAuthStore((s) => s.user);
  const openAuth = useUiStore((s) => s.openAuth);

  const ref = property.id.slice(-6).toUpperCase();
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState(
    `Hi, I'm interested in "${property.title}" (Ref: ${ref}). Please share more details.`,
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (!user) {
    return (
      <div className="rounded-card border border-hairline bg-surface p-5 text-center">
        <p className="text-ink">Log in to contact the dealer and view the exact location.</p>
        <button
          onClick={() => openAuth('login')}
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-cta px-5 py-2.5 text-sm font-medium text-white hover:bg-cta-hover"
        >
          <LogIn size={16} /> Log in to enquire
        </button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="rounded-card border border-verify/30 bg-verify-light p-5 text-center">
        <CheckCircle2 className="mx-auto text-verify" size={28} />
        <p className="mt-2 font-medium text-ink">Enquiry sent!</p>
        <p className="mt-1 text-sm text-ink-muted">
          The dealer has been notified. You can now see the exact location above.
        </p>
        <Link to="/messages" className="mt-3 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light">
          Open chat
        </Link>
      </div>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await submitEnquiry({
        propertyId: property.id,
        message,
        phone: !user.phone && phone ? phone : undefined,
      });
      setDone(true);
      onEnquired();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-card border border-hairline bg-surface p-5">
      <h3 className="font-heading text-lg font-semibold text-ink">Contact the dealer</h3>
      {error && <p className="mt-2 rounded-lg bg-cta/5 px-3 py-2 text-sm text-cta">{error}</p>}

      <div className="mt-3 space-y-3">
        <Input label="Name" value={user.name} readOnly />
        <Input label="Email" value={user.email} readOnly />
        {!user.phone && (
          <Input
            label="Phone (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="03001234567"
          />
        )}
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-hairline bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            required
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-cta px-5 py-2.5 text-sm font-medium text-white hover:bg-cta-hover disabled:opacity-60"
        >
          {busy ? 'Sending…' : 'Send enquiry'}
        </button>
        <p className="text-center text-xs text-ink-muted">
          Your phone number stays private until you choose to share it in chat.
        </p>
      </div>
    </form>
  );
}
