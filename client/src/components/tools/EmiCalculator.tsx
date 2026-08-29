/**
 * Mortgage / EMI calculator. Enter property price, down payment, rate and
 * tenure → monthly payment, total interest and total cost. Can be pre-filled
 * with a listing's price.
 */
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../ui/Input';
import { calcEmi } from '../../utils/finance';
import { formatPricePKRLabeled, formatPricePKR } from '../../utils/formatPrice';

export default function EmiCalculator({ defaultPrice }: { defaultPrice?: number }) {
  const { t } = useTranslation();
  const [price, setPrice] = useState(defaultPrice ? String(defaultPrice) : '');
  const [downPct, setDownPct] = useState('20');
  const [rate, setRate] = useState('22');
  const [years, setYears] = useState('20');

  const result = useMemo(() => {
    const p = Number(price);
    const loan = p * (1 - Number(downPct) / 100);
    return { loan, emi: calcEmi(loan, Number(rate), Number(years)) };
  }, [price, downPct, rate, years]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-3">
        <Input label={t('tools.propertyPrice')} type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 32000000" />
        {price && <p className="-mt-2 text-sm text-verify">≈ {formatPricePKR(price)}</p>}
        <Input label={t('tools.downPayment')} type="number" value={downPct} onChange={(e) => setDownPct(e.target.value)} />
        <Input label={t('tools.interestRate')} type="number" value={rate} onChange={(e) => setRate(e.target.value)} />
        <Input label={t('tools.tenure')} type="number" value={years} onChange={(e) => setYears(e.target.value)} />
      </div>

      <div className="rounded-card border border-hairline bg-canvas p-5">
        {result.emi ? (
          <>
            <p className="text-sm text-ink-muted">{t('tools.monthlyPayment')}</p>
            <p className="mt-1 font-heading text-3xl font-semibold text-primary">
              {formatPricePKRLabeled(result.emi.emi)}
              <span className="text-base font-normal text-ink-muted"> /mo</span>
            </p>
            <dl className="mt-4 space-y-2 text-sm">
              <Row label={t('tools.loanAmount')} value={formatPricePKRLabeled(result.loan)} />
              <Row label={t('tools.totalInterest')} value={formatPricePKRLabeled(result.emi.interest)} />
              <Row label={t('tools.totalPayable')} value={formatPricePKRLabeled(result.emi.total)} />
            </dl>
            <p className="mt-4 text-xs text-ink-muted">{t('tools.emiNote')}</p>
          </>
        ) : (
          <p className="text-ink-muted">{t('tools.enterPrice')}</p>
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
