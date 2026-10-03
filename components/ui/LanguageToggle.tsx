'use client';

import { useI18n } from '@/lib/i18n/I18nProvider';
import { LANGS } from '@/lib/i18n/messages';

export default function LanguageToggle() {
  const { lang, setLang } = useI18n();
  return (
    <div className="fixed right-3 top-3 z-20 flex overflow-hidden rounded-full bg-white/90 text-xs font-extrabold shadow-lg">
      {LANGS.map(l => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`cursor-pointer border-0 px-3 py-1.5 uppercase ${lang === l ? 'bg-violet-600 text-white' : 'bg-transparent text-violet-700'}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
