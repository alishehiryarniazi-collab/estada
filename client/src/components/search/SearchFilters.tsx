/**
 * Filter bar for the search page. Filters apply automatically (debounced) as
 * soon as you change them — no "Apply" button, just Reset. The single coral
 * accent is dropped here since there's no primary action to highlight.
 */
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RotateCcw } from 'lucide-react';

export interface FilterValues {
  q: string;
  propertyType: string;
  listingType: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  bathrooms: string;
  minArea: string;
  maxArea: string;
  areaUnit: string;
  verifiedOnly: boolean;
}

const EMPTY: FilterValues = {
  q: '',
  propertyType: '',
  listingType: '',
  minPrice: '',
  maxPrice: '',
  bedrooms: '',
  bathrooms: '',
  minArea: '',
  maxArea: '',
  areaUnit: 'marla',
  verifiedOnly: false,
};

const field =
  'rounded-lg border border-hairline bg-white px-3 py-2 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

export default function SearchFilters({
  initial,
  onApply,
}: {
  initial: Partial<FilterValues>;
  onApply: (v: FilterValues) => void;
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<FilterValues>({ ...EMPTY, ...initial });
  const first = useRef(true);

  // Auto-apply on any change (debounced so typing doesn't spam the API).
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const id = setTimeout(() => onApply(draft), 300);
    return () => clearTimeout(id);
    // onApply identity changes each render; we intentionally depend on draft only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  const set = (k: keyof FilterValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setDraft((d) => ({ ...d, [k]: e.target.value }));

  return (
    <div className="border-b border-hairline bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-end gap-2">
          <input value={draft.q} onChange={set('q')} placeholder={t('search.keyword')} className={`${field} min-w-[180px] flex-1`} />
          <select value={draft.propertyType} onChange={set('propertyType')} className={field}>
            <option value="">{t('search.anyType')}</option>
            <option value="house">{t('spec.house')}</option>
            <option value="flat">{t('spec.flat')}</option>
            <option value="plot">{t('spec.plot')}</option>
            <option value="commercial">{t('spec.commercial')}</option>
            <option value="agricultural">{t('nav.agricultural')}</option>
          </select>
          <select value={draft.listingType} onChange={set('listingType')} className={field}>
            <option value="">{t('search.buyRent')}</option>
            <option value="sale">{t('card.forSale')}</option>
            <option value="rent">{t('card.forRent')}</option>
          </select>
          <input value={draft.minPrice} onChange={set('minPrice')} type="number" min="0" placeholder={t('search.minPrice')} className={`${field} w-28`} />
          <input value={draft.maxPrice} onChange={set('maxPrice')} type="number" min="0" placeholder={t('search.maxPrice')} className={`${field} w-28`} />
          <select value={draft.bedrooms} onChange={set('bedrooms')} className={field}>
            <option value="">{t('search.beds')}</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {t('search.bedPlus', { n })}
              </option>
            ))}
          </select>
          <select value={draft.bathrooms} onChange={set('bathrooms')} className={field}>
            <option value="">{t('search.baths')}</option>
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {t('search.bathPlus', { n })}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1">
            <input value={draft.minArea} onChange={set('minArea')} type="number" min="0" placeholder={t('search.minArea')} className={`${field} w-24`} />
            <input value={draft.maxArea} onChange={set('maxArea')} type="number" min="0" placeholder={t('search.maxArea')} className={`${field} w-24`} />
            <select value={draft.areaUnit} onChange={set('areaUnit')} className={field}>
              <option value="marla">{t('unit.marla')}</option>
              <option value="sqft">{t('unit.sqft')}</option>
            </select>
          </div>

          <label
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              draft.verifiedOnly ? 'border-verify bg-verify-light text-verify' : 'border-hairline text-ink hover:bg-canvas'
            }`}
          >
            <input
              type="checkbox"
              checked={draft.verifiedOnly}
              onChange={(e) => setDraft((d) => ({ ...d, verifiedOnly: e.target.checked }))}
              className="sr-only"
            />
            {t('search.verifiedOnly')}
          </label>

          <button
            onClick={() => setDraft(EMPTY)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-2 text-sm font-medium text-ink hover:bg-canvas"
          >
            <RotateCcw size={15} /> {t('search.reset')}
          </button>
        </div>
      </div>
    </div>
  );
}
