/**
 * Fair-Price insight card (signature trust feature). Shows whether a listing is
 * priced above / fair / below the market — with a scam-warning when it's
 * suspiciously low — plus the listing's price-drop history.
 */
import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, CheckCircle2, AlertTriangle, ArrowDown } from 'lucide-react';
import { getPriceInsight, type PriceInsightData } from '../../services/propertyService';
import { formatPricePKRLabeled } from '../../utils/formatPrice';

const VERDICTS = {
  above: { label: 'Above market price', Icon: TrendingUp, danger: true, note: 'Priced higher than similar listings nearby.' },
  fair: { label: 'Fair market price', Icon: CheckCircle2, danger: false, note: 'In line with similar listings — a reasonable ask.' },
  below: { label: 'Below market — good price', Icon: TrendingDown, danger: false, note: 'Priced lower than similar listings nearby.' },
  suspicious: { label: 'Priced well below market', Icon: AlertTriangle, danger: true, note: 'Unusually low. Verify ownership documents before paying any advance.' },
} as const;

export default function PriceInsight({ propertyId }: { propertyId: string }) {
  const [data, setData] = useState<PriceInsightData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPriceInsight(propertyId)
      .then(setData)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [propertyId]);

  if (loading || !data) return null;
  const { insight, history } = data;
  const hasHistory = history.length > 0;

  // Nothing useful to show.
  if (!insight.enoughData && !hasHistory) return null;

  const v = insight.verdict ? VERDICTS[insight.verdict] : null;

  return (
    <section className="mt-6">
      <h2 className="mb-2 font-heading text-xl font-semibold text-ink">Price insight</h2>
      <div className="overflow-hidden rounded-card border border-hairline">
        {/* Verdict banner */}
        {insight.enoughData && v && (
          <div className={`flex items-start gap-3 p-4 ${v.danger ? 'bg-cta/5' : 'bg-canvas'}`}>
            <span className={`mt-0.5 ${v.danger ? 'text-cta' : 'text-primary'}`}>
              <v.Icon size={22} />
            </span>
            <div>
              <p className={`font-semibold ${v.danger ? 'text-cta' : 'text-ink'}`}>
                {v.label}
                {typeof insight.deltaPercent === 'number' && insight.deltaPercent !== 0 && (
                  <span className="ml-1 font-normal">
                    ({insight.deltaPercent > 0 ? '+' : ''}
                    {insight.deltaPercent}% vs estimate)
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-sm text-ink-muted">{v.note}</p>
              <p className="mt-1 text-sm text-ink">
                Estimated market value:{' '}
                <span className="font-medium">{formatPricePKRLabeled(insight.estimate!)}</span>{' '}
                <span className="text-ink-muted">· based on {insight.comparablesCount} similar listings</span>
              </p>
            </div>
          </div>
        )}

        {/* Price history */}
        {hasHistory && (
          <div className="border-t border-hairline p-4">
            <p className="mb-2 text-sm font-medium text-ink">Price history</p>
            <ul className="space-y-1.5">
              {history.map((h, idx) => {
                const drop = Number(h.newPrice) < Number(h.oldPrice);
                const pct = Math.round(((Number(h.newPrice) - Number(h.oldPrice)) / Number(h.oldPrice)) * 100);
                return (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <ArrowDown size={14} className={drop ? 'text-primary' : 'rotate-180 text-cta'} />
                    <span className="text-ink-muted line-through">{formatPricePKRLabeled(h.oldPrice)}</span>
                    <span className="font-medium text-ink">{formatPricePKRLabeled(h.newPrice)}</span>
                    <span className={drop ? 'text-primary' : 'text-cta'}>({pct}%)</span>
                    <span className="text-xs text-ink-muted">· {new Date(h.changedAt).toLocaleDateString('en-PK')}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
