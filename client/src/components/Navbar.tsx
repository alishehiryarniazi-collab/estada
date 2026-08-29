/**
 * Top navigation. Two looks:
 *  - transparent: sits over the hero image (white logo/links) — used on Home.
 *  - solid: white sticky bar with a shadow — used on inner pages.
 * Includes a simple mobile menu. The single coral CTA rule is respected: the
 * homepage's coral action is the hero Search button, so "Post Listing" here is
 * an outline/ghost button, not coral.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Heart, Plus, MessageCircle, ShieldCheck } from 'lucide-react';
import Logo from './ui/Logo';
import NotificationBell from './NotificationBell';
import LanguageToggle from './LanguageToggle';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';

const NAV_LINKS = [
  { key: 'nav.forSale', to: '/search?listingType=sale' },
  { key: 'nav.forRent', to: '/search?listingType=rent' },
  { key: 'nav.plots', to: '/search?propertyType=plot' },
  { key: 'nav.commercial', to: '/search?propertyType=commercial' },
  { key: 'nav.agricultural', to: '/search?propertyType=agricultural' },
];

export default function Navbar({ transparent = false }: { transparent?: boolean }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const openAuth = useUiStore((s) => s.openAuth);

  // The bar sits on a dark surface in both variants now (navy bar or hero image),
  // so text and the logo are always white.
  const onDark = true;
  const linkColor = 'text-white/90 hover:text-white';
  const wrapper = transparent
    ? 'absolute inset-x-0 top-0 z-30 bg-transparent'
    : 'sticky top-0 z-30 bg-primary shadow-sm';

  return (
    <header className={wrapper}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        <Logo variant="white" size={28} />

        {/* Desktop category links — the primary, prominent navigation */}
        <ul className="hidden items-center gap-5 md:flex lg:gap-7">
          {NAV_LINKS.map((l) => (
            <li key={l.key}>
              <Link
                to={l.to}
                className={`whitespace-nowrap text-[15px] font-semibold tracking-tight transition-colors ${linkColor}`}
              >
                {t(l.key)}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            to="/shortlist"
            title="Saved"
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${linkColor}`}
          >
            <Heart size={16} /> <span className="hidden lg:inline">{t('nav.saved')}</span>
          </Link>
          {user && (
            <Link
              to="/messages"
              title="Messages"
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${linkColor}`}
            >
              <MessageCircle size={16} /> <span className="hidden lg:inline">{t('nav.messages')}</span>
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              title="Admin"
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${linkColor}`}
            >
              <ShieldCheck size={16} /> <span className="hidden lg:inline">{t('nav.admin')}</span>
            </Link>
          )}
          <NotificationBell onDark={onDark} />
          <LanguageToggle onDark={onDark} />
          {user ? (
            <div className="flex items-center gap-1">
              <Link
                to="/dashboard"
                className={`rounded-lg px-3 py-2 text-sm font-medium ${linkColor}`}
              >
                {user.name.split(' ')[0]}
              </Link>
              <button
                onClick={() => setConfirmingSignOut(true)}
                className={`rounded-lg px-2 py-2 text-sm font-medium ${linkColor}`}
              >
                {t('nav.signOut')}
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuth('login')}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${linkColor}`}
            >
              {t('nav.login')}
            </button>
          )}
          <Link
            to="/post-listing"
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${
              onDark
                ? 'border-white/40 text-white hover:bg-white/10'
                : 'border-primary text-primary hover:bg-primary hover:text-white'
            }`}
          >
            <Plus size={16} /> {t('nav.postListing')}
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          className={`md:hidden ${onDark ? 'text-white' : 'text-ink'}`}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="mx-4 mb-4 rounded-card border border-hairline bg-surface p-4 shadow-card md:hidden">
          <ul className="space-y-1">
            {NAV_LINKS.map((l) => (
              <li key={l.key}>
                <Link
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-ink hover:bg-canvas"
                >
                  {t(l.key)}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-2 border-t border-hairline pt-2 text-center">
            <LanguageToggle onDark={false} />
          </div>
          <div className="mt-3 flex gap-2 border-t border-hairline pt-3">
            {user ? (
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-lg border border-hairline px-3 py-2 text-center text-sm font-medium text-ink"
              >
                {user.name.split(' ')[0]}
              </Link>
            ) : (
              <button
                onClick={() => {
                  setOpen(false);
                  openAuth('login');
                }}
                className="flex-1 rounded-lg border border-hairline px-3 py-2 text-center text-sm font-medium text-ink"
              >
                {t('nav.login')}
              </button>
            )}
            <Link
              to="/post-listing"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-lg border border-primary px-3 py-2 text-center text-sm font-medium text-primary"
            >
              {t('nav.postListing')}
            </Link>
          </div>
        </div>
      )}

      {/* Sign-out confirmation — guards against an accidental click. */}
      {confirmingSignOut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-surface p-6 text-center shadow-xl">
            <h2 className="font-heading text-lg font-semibold text-ink">{t('nav.confirmSignOutTitle')}</h2>
            <p className="mt-1 text-sm text-ink-muted">{t('nav.confirmSignOutBody')}</p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setConfirmingSignOut(false)}
                className="flex-1 rounded-lg border border-hairline px-4 py-2.5 text-sm font-medium text-ink hover:bg-canvas"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => {
                  setConfirmingSignOut(false);
                  signOut();
                }}
                className="flex-1 rounded-lg bg-cta px-4 py-2.5 text-sm font-medium text-white hover:bg-cta-hover"
              >
                {t('nav.signOut')}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
