/**
 * Tools page — mortgage/EMI, affordability, and area-unit calculators.
 * Reads ?tab= to pick a calculator and ?price= to pre-fill the mortgage one
 * (linked from a listing detail page).
 */
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calculator, Wallet, Ruler } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EmiCalculator from '../components/tools/EmiCalculator';
import AffordabilityCalculator from '../components/tools/AffordabilityCalculator';
import AreaConverter from '../components/tools/AreaConverter';

type Tab = 'mortgage' | 'affordability' | 'area';

const TABS: { key: Tab; labelKey: string; Icon: typeof Calculator }[] = [
  { key: 'mortgage', labelKey: 'tools.mortgage', Icon: Calculator },
  { key: 'affordability', labelKey: 'tools.affordability', Icon: Wallet },
  { key: 'area', labelKey: 'tools.areaConverter', Icon: Ruler },
];

export default function ToolsPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const initial = (params.get('tab') as Tab) || 'mortgage';
  const [tab, setTab] = useState<Tab>(TABS.some((t) => t.key === initial) ? initial : 'mortgage');
  const prefillPrice = params.get('price') ? Number(params.get('price')) : undefined;

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="font-heading text-2xl font-semibold text-ink">{t('tools.title')}</h1>
        <p className="mt-1 text-sm text-ink-muted">{t('tools.subtitle')}</p>

        {/* Tabs */}
        <div className="mt-5 flex gap-1 border-b border-hairline">
          {TABS.map(({ key, labelKey, Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium ${
                tab === key ? 'border-primary text-primary' : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              <Icon size={15} /> {t(labelKey)}
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-card border border-hairline bg-surface p-5">
          {tab === 'mortgage' && <EmiCalculator defaultPrice={prefillPrice} />}
          {tab === 'affordability' && <AffordabilityCalculator />}
          {tab === 'area' && <AreaConverter />}
        </div>
      </main>
      <Footer />
    </div>
  );
}
