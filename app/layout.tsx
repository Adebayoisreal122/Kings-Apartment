import type { Metadata, Viewport } from 'next';
import { Jost, DM_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import PWARegister from '@/components/PWARegister';

const display = Jost({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-display' });
const body = DM_Sans({ subsets: ['latin'], variable: '--font-body' });
export const metadata: Metadata = {
  title: "The King's Apartment",
  description: 'Book a stay at any The King\u2019s Apartment branch.',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icons/favicon-32.png', apple: '/icons/apple-touch-icon.png' },
};
export const viewport: Viewport = { themeColor: '#071B3E' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} scroll-smooth`}>
      <body className="font-sans"><AuthProvider>{children}</AuthProvider><PWARegister /></body>
    </html>
  );
}
