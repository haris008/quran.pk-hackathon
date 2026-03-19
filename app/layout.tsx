import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'Bilingual Quran Radio — Quran.com Hackathon',
  description:
    'Verse-by-verse Quran radio: hear Arabic recitation then the English translation for every ayah. Built for the Quran Foundation Hackathon.',
  keywords: ['Quran', 'Arabic', 'translation', 'radio', 'bilingual', 'recitation'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
