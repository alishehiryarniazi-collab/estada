/**
 * Temporary page for routes built in later milestones (search, listing detail,
 * auth, dashboard). Keeps navigation working with a solid navbar + a friendly
 * "coming soon" message instead of a dead link.
 */
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Hammer } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Placeholder({ title }: { title: string }) {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <Navbar />
      <main className="mx-auto flex max-w-3xl flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-verify-light text-verify">
          <Hammer size={26} />
        </span>
        <h1 className="mt-5 font-heading text-3xl font-semibold text-ink">{title}</h1>
        <p className="mt-2 max-w-md text-ink-muted">{t('common.comingSoon')}</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-light"
        >
          {t('common.backHome')}
        </Link>
      </main>
      <Footer />
    </div>
  );
}
