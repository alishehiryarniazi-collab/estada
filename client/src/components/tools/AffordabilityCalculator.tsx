/**
 * Affordability calculator — "what property price can I afford?" from monthly
 * income, existing obligations, rate and tenure. Assumes lenders cap the total
 * EMI at ~40% of income (adjustable).
 */
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../ui/Input';
import { maxAffordableLoan } from '../../utils/finance';
import { formatPricePKRLabeled } from '../../utils/formatPrice';

export default function AffordabilityCalculator() {
  const { t } = useTranslation();
  const [income, setIncome] = useState('');
  const [obligations, setObligations] = useState('0');
  const [rate, setRate] = useState('22');
  const [years, setYears] = useState('20');
  const [downPct, setDownPct] = useState('20');

  const result = useMemo(() => {
    const loan = maxAffordableLoan(Number(income), Number(obligations), Number(rate), Number(years));
    // If loan covers (100 - down)% of the price, price = loan / (1 - down/100).
    const down = Number(downPct) / 100;
    const price = down < 1 ? loan / (1 - down) : loan;
    return { loan, price };
  }, [income, obligations, rate, years, downPct]);

  const valid = Number(income) > 0;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-3">
        <Input label={t('tools.monthlyIncome')} type="number" value={income} onChange={(e) => setIncome(e.target.value)} placeholder="e.g. 350000" />
        <Input label={t('tools.existingPayments')} type="number" value={obligations} onChange={(e) => setObligations(e.target.value)} />
        <Input label={t('tools.downYouHave')} type="number" value={downPct} onChange={(e) => setDownPct(e.target.value)} />
        <Input label={t('tools.interestRate')} type="number" value={rate} onChange={(e) => setRate(e.target.value)} />
        <Input label={t('tools.tenure')} type="number" value={years} onChange={(e) => setYears(e.target.value)} />
      </div>

      <div className="rounded-card border border-hairline bg-canvas p-5">
        {valid ? (
          <>
            <p className="text-sm text-ink-muted">{t('tools.affordUpTo')}</p>
            <p className="mt-1 font-heading text-3xl font-semibold text-primary">
              {formatPricePKRLabeled(result.price)}
            </p>
            <dl className="mt-4 space-y-2 text-sm">
              <Row label={t('tools.maxLoan')} value={formatPricePKRLabeled(result.loan)} />
              <Row label={t('tools.emiCap')} value={t('tools.emiCapVal')} />
            </dl>
            <p className="mt-4 text-xs text-ink-muted">{t('tools.affordNote')}</p>
          </>
        ) : (
          <p className="text-ink-muted">{t('tools.enterIncome')}</p>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-hairline pb-2">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}
