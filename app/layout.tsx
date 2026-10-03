import type { Metadata } from 'next';
import LanguageToggle from '@/components/ui/LanguageToggle';
import { I18nProvider } from '@/lib/i18n/I18nProvider';
import { getLang } from '@/lib/i18n/server';
import './globals.css';
import './tailwind.css';

export const metadata: Metadata = {
  title: 'Math Games',
  description: 'Learn math while playing games',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <html lang={lang}>
      <body>
        <I18nProvider initialLang={lang}>
          <LanguageToggle />
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
