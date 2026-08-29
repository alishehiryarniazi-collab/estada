/** EN ⇄ اردو language switch. */
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import { setLanguage } from '../i18n';

export default function LanguageToggle({ onDark = true }: { onDark?: boolean }) {
  const { i18n } = useTranslation();
  const isUr = i18n.language === 'ur';
  const color = onDark ? 'text-white/90 hover:text-white' : 'text-ink hover:text-primary';

  return (
    <button
      onClick={() => setLanguage(isUr ? 'en' : 'ur')}
      title="Language / زبان"
      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-sm font-medium ${color}`}
    >
      <Languages size={16} />
      {isUr ? 'English' : 'اردو'}
    </button>
  );
}
