/**
 * Search page — filters + results list + interactive map.
 * Desktop: list and map side by side. Mobile: toggle between them.
 * Supports infinite scroll (20/batch) and "search as you move the map".
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Map as MapIcon, List, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import SearchFilters, { type FilterValues } from '../components/search/SearchFilters';
import PropertyCard from '../components/PropertyCard';
import { PropertyCardSkeleton } from '../components/ui/Skeleton';
import PropertyMap, { type MapBounds } from '../components/PropertyMap';
import SaveSearchButton from '../components/search/SaveSearchButton';
import { searchProperties, type SearchParams } from '../services/propertyService';
import { apiErrorMessage } from '../lib/api';
import type { PropertyCard as Card } from '../types/property';

export default function SearchPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<Card[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchAsMove, setSearchAsMove] = useState(false);
  const [bounds, setBounds] = useState<MapBounds | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');

  // Build the API params from the URL (+ map bounds when search-as-move is on).
  const apiParams = useMemo<SearchParams>(() => {
    const p: SearchParams = {};
    const q = searchParams.get('q');
    const city = searchParams.get('city');
    const pt = searchParams.get('propertyType');
    const lt = searchParams.get('listingType');
    const sort = searchParams.get('sort') as SearchParams['sort'] | null;
    if (q) p.q = q;
    if (city) p.city = city;
    if (pt) p.propertyType = pt;
    if (lt) p.listingType = lt;
    if (sort) p.sort = sort;
    for (const key of ['minPrice', 'maxPrice', 'bedrooms', 'bathrooms', 'minArea', 'maxArea'] as const) {
      const v = searchParams.get(key);
      if (v) p[key] = Number(v);
    }
    const unit = searchParams.get('areaUnit');
    if (unit === 'marla' || unit === 'sqft') p.areaUnit = unit;
    if (searchParams.get('verifiedOnly') === 'true') p.verifiedOnly = true;
    if (searchAsMove && bounds) Object.assign(p, bounds);
    return p;
  }, [searchParams, searchAsMove, bounds]);

  // Fetch first page whenever the query changes.
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    searchProperties({ ...apiParams, limit: 20 })
      .then((res) => {
        if (!active) return;
        setItems(res.items);
        setCursor(res.nextCursor);
      })
      .catch((e) => active && setError(apiErrorMessage(e)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [apiParams]);

  // Infinite scroll — load the next batch when the sentinel scrolls into view.
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!cursor || loading) return;
    const el = sentinel.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loadingMore) {
        setLoadingMore(true);
        searchProperties({ ...apiParams, limit: 20, cursor })
          .then((res) => {
            setItems((prev) => [...prev, ...res.items]);
            setCursor(res.nextCursor);
          })
          .catch(() => undefined)
          .finally(() => setLoadingMore(false));
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [cursor, loading, loadingMore, apiParams]);

  const applyFilters = (v: FilterValues) => {
    const next = new URLSearchParams();
    if (v.q) next.set('q', v.q);
    if (v.propertyType) next.set('propertyType', v.propertyType);
    if (v.listingType) next.set('listingType', v.listingType);
    if (v.minPrice) next.set('minPrice', v.minPrice);
    if (v.maxPrice) next.set('maxPrice', v.maxPrice);
    if (v.bedrooms) next.set('bedrooms', v.bedrooms);
    if (v.bathrooms) next.set('bathrooms', v.bathrooms);
    if (v.minArea) next.set('minArea', v.minArea);
    if (v.maxArea) next.set('maxArea', v.maxArea);
    if ((v.minArea || v.maxArea) && v.areaUnit) next.set('areaUnit', v.areaUnit);
    if (v.verifiedOnly) next.set('verifiedOnly', 'true');
    const sort = searchParams.get('sort');
    if (sort) next.set('sort', sort);
    setSearchParams(next);
  };

  const changeSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = new URLSearchParams(searchParams);
    if (e.target.value) next.set('sort', e.target.value);
    else next.delete('sort');
    setSearchParams(next);
  };

  const initialFilters: Partial<FilterValues> = {
    q: searchParams.get('q') || '',
    propertyType: searchParams.get('propertyType') || '',
    listingType: searchParams.get('listingType') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    bathrooms: searchParams.get('bathrooms') || '',
    minArea: searchParams.get('minArea') || '',
    maxArea: searchParams.get('maxArea') || '',
    areaUnit: searchParams.get('areaUnit') || 'marla',
    verifiedOnly: searchParams.get('verifiedOnly') === 'true',
  };

  return (
    <div className="flex h-screen flex-col bg-canvas">
      <Navbar />
      <SearchFilters initial={initialFilters} onApply={applyFilters} />

      {/* Results header */}
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <p className="text-sm text-ink-muted">
          {loading ? t('search.searching') : t('search.listings', { n: `${items.length}${cursor ? '+' : ''}` })}
        </p>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <SaveSearchButton params={Object.fromEntries(searchParams.entries())} />
          </div>
          <label className="hidden items-center gap-1.5 text-sm text-ink-muted sm:flex">
            <input
              type="checkbox"
              checked={searchAsMove}
              onChange={(e) => setSearchAsMove(e.target.checked)}
              className="accent-primary"
            />
            {t('search.searchAsMove')}
          </label>
          <select
            value={searchParams.get('sort') || 'newest'}
            onChange={changeSort}
            className="rounded-lg border border-hairline bg-white px-3 py-1.5 text-sm text-ink outline-none focus:border-primary"
          >
            <option value="newest">{t('search.sortNewest')}</option>
            <option value="price_asc">{t('search.sortPriceAsc')}</option>
            <option value="price_desc">{t('search.sortPriceDesc')}</option>
            <option value="area_desc">{t('search.sortAreaDesc')}</option>
          </select>
          {/* Mobile view toggle */}
          <button
            onClick={() => setMobileView((v) => (v === 'list' ? 'map' : 'list'))}
            className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-sm font-medium text-ink lg:hidden"
          >
            {mobileView === 'list' ? <MapIcon size={15} /> : <List size={15} />}
            {mobileView === 'list' ? t('search.map') : t('search.list')}
          </button>
        </div>
      </div>

      {/* Body: list + map */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 overflow-hidden px-4 pb-4 sm:px-6">
        {/* List column */}
        <div
          className={`${mobileView === 'map' ? 'hidden' : 'block'} w-full overflow-y-auto pr-0 lg:block lg:w-1/2 lg:pr-4`}
        >
          {error ? (
            <div className="rounded-card border border-hairline bg-surface p-8 text-center text-ink-muted">
              {error}
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-card border border-hairline bg-surface p-10 text-center text-ink-muted">
              {t('search.noResults')}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {items.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
              <div ref={sentinel} className="h-10" />
              {loadingMore && (
                <div className="flex justify-center py-4 text-ink-muted">
                  <Loader2 className="animate-spin" size={20} />
                </div>
              )}
            </>
          )}
        </div>

        {/* Map column */}
        <div
          className={`${mobileView === 'list' ? 'hidden' : 'block'} w-full overflow-hidden rounded-card border border-hairline lg:block lg:w-1/2`}
        >
          <PropertyMap items={items} searchAsMove={searchAsMove} onBoundsChange={setBounds} />
        </div>
      </div>
    </div>
  );
}
