/**
 * Affordability calculator — "what property price can I afford?" from monthly
 * income, existing obligations, rate and tenure. Assumes lenders cap the total
 * EMI at ~40% of income (adjustable).
 */
import { useMemo, useState } from 'react';
import Input from '../ui/Input';
import { maxAffordableLoan } from '../../utils/finance';
import { formatPricePKRLabeled } from '../../utils/formatPrice';

export default function AffordabilityCalculator() {
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
        <Input label="Monthly income (PKR)" type="number" value={income} onChange={(e) => setIncome(e.target.value)} placeholder="e.g. 350000" />
        <Input label="Existing monthly payments (PKR)" type="number" value={obligations} onChange={(e) => setObligations(e.target.value)} />
        <Input label="Down payment you have (%)" type="number" value={downPct} onChange={(e) => setDownPct(e.target.value)} />
        <Input label="Interest rate (% per year)" type="number" value={rate} onChange={(e) => setRate(e.target.value)} />
        <Input label="Tenure (years)" type="number" value={years} onChange={(e) => setYears(e.target.value)} />
      </div>

      <div className="rounded-card border border-hairline bg-canvas p-5">
        {valid ? (
          <>
            <p className="text-sm text-ink-muted">You can likely afford a property up to</p>
            <p className="mt-1 font-heading text-3xl font-semibold text-primary">
              {formatPricePKRLabeled(result.price)}
            </p>
            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Max loan you qualify for" value={formatPricePKRLabeled(result.loan)} />
              <Row label="Assumed EMI cap" value="40% of income" />
            </dl>
            <p className="mt-4 text-xs text-ink-muted">
              A rough guide — banks assess many factors. Use it to narrow your search budget.
            </p>
          </>
        ) : (
          <p className="text-ink-muted">Enter your monthly income to see your budget.</p>
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
