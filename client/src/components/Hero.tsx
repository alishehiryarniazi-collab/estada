/**
 * Homepage hero — a controlled-height banner with the property photo nicely
 * cropped (object-cover), a dark gradient for legibility, and the tagline +
 * floating search bar centred on top (Section 3.4).
 *
 * The photo is /hero-home.jpg in /public — replace that file to change it.
 */
import { ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SearchBar from './SearchBar';

export default function Hero() {
  const { t } = useTranslation();
  return (
    <section className="relative w-full overflow-hidden min-h-[520px] h-[calc(100dvh-72px)] max-h-[880px]">
      {/* Photo — cover-cropped to the hero height so it always looks clean. */}
      <img
        src="/hero-home.jpg"
        alt="Modern home exterior"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      {/* Dark gradient overlay for text legibility. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />

      {/* Centred content. */}
      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-4 sm:px-6">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-verify/90 px-3 py-1 text-xs font-medium text-white">
            <ShieldCheck size={14} /> {t('hero.badge')}
          </span>
          <h1 className="mt-3 font-heading text-3xl font-semibold leading-tight text-white sm:text-4xl md:text-5xl">
            {t('hero.title')}
          </h1>
          <p className="mt-3 max-w-xl text-white/85 sm:text-lg">{t('hero.subtitle')}</p>
        </div>

        {/* Floating search bar — the single most important action. */}
        <div className="mt-6 max-w-3xl">
          <SearchBar />
        </div>
      </div>
    </section>
  );
}
