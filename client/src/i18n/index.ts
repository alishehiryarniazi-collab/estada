/**
 * i18n setup (English + Urdu). Language is remembered in localStorage, and the
 * document direction flips to RTL for Urdu.
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import ur from './ur.json';

export type Lang = 'en' | 'ur';

function stored(): Lang {
  try {
    const v = localStorage.getItem('estada:lang');
    if (v === 'ur' || v === 'en') return v;
  } catch {
    /* ignore */
  }
  return 'en';
}

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ur: { translation: ur } },
  lng: stored(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

/** Set <html dir/lang> so RTL and fonts render correctly for Urdu. */
export function applyDir(lang: Lang) {
  const el = document.documentElement;
  el.setAttribute('dir', lang === 'ur' ? 'rtl' : 'ltr');
  el.setAttribute('lang', lang);
}

export function setLanguage(lang: Lang) {
  i18n.changeLanguage(lang);
  try {
    localStorage.setItem('estada:lang', lang);
  } catch {
    /* ignore */
  }
  applyDir(lang);
}

applyDir(stored());

export default i18n;
