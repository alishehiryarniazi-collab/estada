/**
 * Password reset page — opened from the emailed link (/reset-password?token=…).
 * The user picks a new password; on success they're invited to log in.
 */
import { useState, type FormEvent } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { resetPassword } from '../services/authService';
import { apiErrorMessage } from '../lib/api';
import { useUiStore } from '../store/uiStore';

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const openAuth = useUiStore((s) => s.openAuth);
  const token = params.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError(t('auth.errPassword'));
    if (password !== confirm) return setError(t('auth.resetMismatch'));
    setBusy(true);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <Navbar />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12 sm:px-6">
        <div className="rounded-card border border-hairline bg-surface p-6">
          {done ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto text-verify" size={32} />
              <p className="mt-2 font-medium text-ink">{t('auth.resetDone')}</p>
              <button
                onClick={() => {
                  navigate('/');
                  openAuth('login');
                }}
                className="mt-4 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-light"
              >
                {t('auth.goToLogin')}
              </button>
            </div>
          ) : !token ? (
            <p className="text-center text-sm text-cta">{t('auth.resetInvalid')}</p>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <h1 className="font-heading text-xl font-semibold text-ink">{t('auth.resetTitle')}</h1>
              {error && <p className="rounded-lg bg-cta/5 px-3 py-2 text-sm text-cta">{error}</p>}
              <Input
                label={t('auth.newPassword')}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Input
                label={t('auth.confirmPassword')}
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
              <Button type="submit" variant="primary" className="w-full" disabled={busy}>
                {busy ? t('auth.pleaseWait') : t('auth.resetSubmit')}
              </Button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
