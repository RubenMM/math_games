import { cookies, headers } from 'next/headers';
import { DEFAULT_LANG, isLang, LANG_COOKIE, type Lang } from './messages';

/** Saved choice first, then the browser's Accept-Language, then English. */
export async function getLang(): Promise<Lang> {
  const saved = (await cookies()).get(LANG_COOKIE)?.value;
  if (isLang(saved)) return saved;
  const accept = (await headers()).get('accept-language') ?? '';
  return accept.toLowerCase().startsWith('es') ? 'es' : DEFAULT_LANG;
}
