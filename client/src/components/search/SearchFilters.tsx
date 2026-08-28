/**
 * Filter bar for the search page. Holds a local draft and commits everything on
 * "Apply" (predictable — no refetch on every keystroke). Reset clears to empty.
 * The single coral CTA on this screen is the Apply button.
 */
import { useState } from 'react';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';

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
};

const field = 'rounded-lg border border-hairline bg-white px-3 py-2 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

export default function SearchFilters({
  initial,
  onApply,
}: {
  initial: Partial<FilterValues>;
  onApply: (v: FilterValues) => void;
}) {
  const [draft, setDraft] = useState<FilterValues>({ ...EMPTY, ...initial });
  const set = (k: keyof FilterValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setDraft((d) => ({ ...d, [k]: e.target.value }));

  return (
    <div className="border-b border-hairline bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-end gap-2">
          <input
            value={draft.q}
            onChange={set('q')}
            placeholder="City, area or keyword"
            className={`${field} min-w-[180px] flex-1`}
          />
          <select value={draft.propertyType} onChange={set('propertyType')} className={field}>
            <option value="">Any type</option>
            <option value="house">House</option>
            <option value="flat">Flat</option>
            <option value="plot">Plot</option>
            <option value="commercial">Commercial</option>
            <option value="agricultural">Agricultural</option>
          </select>
          <select value={draft.listingType} onChange={set('listingType')} className={field}>
            <option value="">Buy & Rent</option>
            <option value="sale">For Sale</option>
            <option value="rent">For Rent</option>
          </select>
          <input
            value={draft.minPrice}
            onChange={set('minPrice')}
            type="number"
            min="0"
            placeholder="Min price"
            className={`${field} w-28`}
          />
          <input
            value={draft.maxPrice}
            onChange={set('maxPrice')}
            type="number"
            min="0"
            placeholder="Max price"
            className={`${field} w-28`}
          />
          <select value={draft.bedrooms} onChange={set('bedrooms')} className={field}>
            <option value="">Beds</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}+ bed
              </option>
            ))}
          </select>
          <select value={draft.bathrooms} onChange={set('bathrooms')} className={field}>
            <option value="">Baths</option>
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}+ bath
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1">
            <input
              value={draft.minArea}
              onChange={set('minArea')}
              type="number"
              min="0"
              placeholder="Min area"
              className={`${field} w-24`}
            />
            <input
              value={draft.maxArea}
              onChange={set('maxArea')}
              type="number"
              min="0"
              placeholder="Max area"
              className={`${field} w-24`}
            />
            <select value={draft.areaUnit} onChange={set('areaUnit')} className={field}>
              <option value="marla">marla</option>
              <option value="sqft">sq ft</option>
            </select>
          </div>

          <button
            onClick={() => onApply(draft)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-cta px-4 py-2 text-sm font-medium text-white hover:bg-cta-hover"
          >
            <SlidersHorizontal size={15} /> Apply
          </button>
          <button
            onClick={() => {
              setDraft(EMPTY);
              onApply(EMPTY);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-2 text-sm font-medium text-ink hover:bg-canvas"
          >
            <RotateCcw size={15} /> Reset
          </button>
        </div>
      </div>
    </div>
  );
}
