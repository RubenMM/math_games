import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Math Games',
  description: 'Learn math while playing games',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
