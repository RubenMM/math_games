'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { LANG_COOKIE, messages, type Lang, type MessageKey } from './messages';

type Params = Record<string, string | number>;

interface I18n {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: MessageKey, params?: Params) => string;
  /** Translates an API error code (falls back to a generic message). */
  tError: (code: string) => string;
}

const Ctx = createContext<I18n | null>(null);

export function I18nProvider({ initialLang, children }: { initialLang: Lang; children: React.ReactNode }) {
  const [lang, setLangState] = useState(initialLang);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback(
    (key: MessageKey, params?: Params) =>
      messages[lang][key].replace(/\{(\w+)\}/g, (_, name) => String(params?.[name] ?? `{${name}}`)),
    [lang],
  );

  const tError = useCallback(
    (code: string) => t((`error.${code}` in messages[lang] ? `error.${code}` : 'error.generic') as MessageKey),
    [lang, t],
  );

  return <Ctx.Provider value={{ lang, setLang, t, tError }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}
