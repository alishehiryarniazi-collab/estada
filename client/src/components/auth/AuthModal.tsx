/**
 * Auth modal — login / register in one dialog. Opened from the navbar or any
 * action that needs a logged-in user (e.g. sending an enquiry). On success it
 * stores the user in the auth store and closes.
 *
 * Full validation lives on the server; here we do light client checks for UX.
 */
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import * as authService from '../../services/authService';
import { apiErrorMessage } from '../../lib/api';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { LogoMark } from '../ui/Logo';

export default function AuthModal() {
  const { t } = useTranslation();
  const { authModal, closeAuth, openAuth } = useUiStore();
  const setUser = useAuthStore((s) => s.setUser);
  const isLogin = authModal.mode === 'login';

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'buyer' as 'buyer' | 'dealer' | 'owner',
    cnicNumber: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!authModal.open) return null;
  const needsCnic = !isLogin && form.role !== 'buyer';
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  // Instant, translated checks so the user sees exactly what to fix.
  const clientValidate = (): string | null => {
    if (isLogin) return null;
    if (form.name.trim().length < 2) return t('auth.errName');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return t('auth.errEmail');
    if (form.password.length < 8) return t('auth.errPassword');
    if (needsCnic && !/^\d{5}-?\d{7}-?\d$/.test(form.cnicNumber.trim())) return t('auth.errCnic');
    if (form.phone && !/^(?:\+92|0)3\d{9}$/.test(form.phone.replace(/[\s-]/g, ''))) return t('auth.errPhone');
    return null;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const problem = clientValidate();
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    try {
      const user = isLogin
        ? await authService.login(form.email, form.password)
        : await authService.register({
            name: form.name,
            email: form.email,
            password: form.password,
            phone: form.phone || undefined,
            role: form.role,
            cnicNumber: needsCnic ? form.cnicNumber : undefined,
          });
      setUser(user);
      closeAuth();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={closeAuth}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoMark size={26} />
            <h2 className="font-heading text-xl font-semibold text-ink">
              {isLogin ? t('auth.welcomeBack') : t('auth.createAccount')}
            </h2>
          </div>
          <button onClick={closeAuth} aria-label="Close" className="text-ink-muted hover:text-ink">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-3 rounded-lg border border-cta/30 bg-cta/5 px-3 py-2 text-sm text-cta">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-3">
          {!isLogin && (
            <Input label={t('auth.fullName')} name="name" value={form.name} onChange={set('name')} required />
          )}
          <Input
            label={t('auth.email')}
            name="email"
            type="email"
            value={form.email}
            onChange={set('email')}
            required
          />
          <Input
            label={t('auth.password')}
            name="password"
            type="password"
            value={form.password}
            onChange={set('password')}
            required
          />

          {!isLogin && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">{t('auth.iWantTo')}</label>
                <select
                  value={form.role}
                  onChange={set('role')}
                  className="w-full rounded-lg border border-hairline bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="buyer">{t('auth.roleBuyer')}</option>
                  <option value="dealer">{t('auth.roleDealer')}</option>
                  <option value="owner">{t('auth.roleOwner')}</option>
                </select>
              </div>
              <Input
                label={t('auth.phoneOptional')}
                name="phone"
                value={form.phone}
                onChange={set('phone')}
                placeholder="03001234567"
              />
              {needsCnic && (
                <Input
                  label={t('auth.cnic')}
                  name="cnicNumber"
                  value={form.cnicNumber}
                  onChange={set('cnicNumber')}
                  placeholder="35202-1234567-1"
                  required
                />
              )}
            </>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={busy}>
            {busy ? t('auth.pleaseWait') : isLogin ? t('auth.login') : t('auth.create')}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-ink-muted">
          {isLogin ? t('auth.noAccount') : t('auth.haveAccount')}
          <button
            onClick={() => openAuth(isLogin ? 'register' : 'login')}
            className="font-medium text-primary hover:underline"
          >
            {isLogin ? t('auth.signup') : t('auth.login')}
          </button>
        </p>
      </div>
    </div>
  );
}
