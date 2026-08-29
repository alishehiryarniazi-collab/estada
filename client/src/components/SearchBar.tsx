/**
 * Hero search bar — the primary action on the homepage. A location/keyword
 * input plus the single coral "Search" CTA and a filters shortcut. Submitting
 * navigates to the search page with the query (search UI lands in Milestone 3).
 *
 * NOTE: Google Places autocomplete is replaced by free OSM/Nominatim later;
 * for now this is a plain keyword box that drives the same search API.
 */
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal } from 'lucide-react';

export default function SearchBar() {
  const { t } = useTranslation();
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    navigate(query ? `/search?q=${encodeURIComponent(query)}` : '/search');
  };

  return (
    <form
      onSubmit={submit}
      className="flex w-full flex-col gap-2 rounded-2xl bg-white p-2 shadow-xl sm:flex-row sm:items-center sm:rounded-full"
    >
      <div className="flex flex-1 items-center gap-2 px-3">
        <Search size={20} className="shrink-0 text-ink-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          type="text"
          placeholder={t('hero.searchPlaceholder')}
          className="w-full bg-transparent py-2.5 text-body text-ink outline-none placeholder:text-ink-muted"
          aria-label="Search location or keyword"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate('/search')}
          className="hidden items-center gap-1.5 rounded-full border border-hairline px-4 py-2.5 text-sm font-medium text-ink hover:bg-canvas sm:inline-flex"
        >
          <SlidersHorizontal size={16} /> {t('hero.filters')}
        </button>
        {/* The single coral CTA on this screen. */}
        <button
          type="submit"
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-cta px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cta-hover sm:flex-none"
        >
          <Search size={16} /> {t('hero.search')}
        </button>
      </div>
    </form>
  );
}
