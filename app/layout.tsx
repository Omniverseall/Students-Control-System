import type { Metadata } from 'next';
import { Inter, Newsreader } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'cyrillic'],
});

const newsreader = Newsreader({
  variable: '--font-newsreader',
  subsets: ['latin'],
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'CRM | Teacher Panel',
  description: 'Premium Teacher Automation Panel',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${inter.variable} ${newsreader.variable} dark`}>
      <body className="bg-background text-primary antialiased min-h-screen flex flex-col font-sans selection:bg-white/20 selection:text-white">
        {children}
      </body>
    </html>
  );
}
