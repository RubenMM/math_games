import type { Metadata } from 'next';
import { Fredoka } from 'next/font/google';
import FunBackground from '@/components/ui/FunBackground';
import LanguageToggle from '@/components/ui/LanguageToggle';
import { I18nProvider } from '@/lib/i18n/I18nProvider';
import { getLang } from '@/lib/i18n/server';
import './globals.css';
import './fun.css';
import './tailwind.css';

const fredoka = Fredoka({ subsets: ['latin', 'latin-ext'], variable: '--font-fredoka' });

export const metadata: Metadata = {
  title: 'Math Games',
  description: 'Learn math while playing games',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <html lang={lang} className={fredoka.variable}>
      <body>
        <I18nProvider initialLang={lang}>
          <FunBackground />
          <LanguageToggle />
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
