/**
 * Homepage "Plan your purchase" section — quick shortcuts to the free property
 * tools (mortgage, affordability, area converter), each opening the Tools page
 * on the right tab.
 */
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calculator, Wallet, Ruler, ArrowRight } from 'lucide-react';

const TOOLS = [
  { to: '/tools?tab=mortgage', Icon: Calculator, titleKey: 'footer.mortgage', descKey: 'tools.mortgageDesc' },
  { to: '/tools?tab=affordability', Icon: Wallet, titleKey: 'footer.affordability', descKey: 'tools.affordDesc' },
  { to: '/tools?tab=area', Icon: Ruler, titleKey: 'footer.areaConverter', descKey: 'tools.areaDesc' },
];

export default function HomeTools() {
  const { t } = useTranslation();
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-ink">{t('tools.homeTitle')}</h2>
          <p className="mt-1 text-sm text-ink-muted">{t('tools.homeSubtitle')}</p>
        </div>
        <Link
          to="/tools"
          className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:inline-flex"
        >
          {t('tools.openAll')} <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {TOOLS.map(({ to, Icon, titleKey, descKey }) => (
          <Link
            key={to}
            to={to}
            className="group flex items-start gap-3 rounded-card border border-hairline bg-surface p-5
                       shadow-card transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary/5 text-primary">
              <Icon size={22} />
            </span>
            <div>
              <h3 className="text-body font-medium text-ink group-hover:text-primary">{t(titleKey)}</h3>
              <p className="mt-0.5 text-sm text-ink-muted">{t(descKey)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
