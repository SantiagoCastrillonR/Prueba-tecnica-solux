import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { BRAND } from '@/lib/brand';
import { Providers } from '@/providers/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: { default: BRAND.product, template: `%s · ${BRAND.product}` },
  description: 'Chat en tiempo real',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#050505',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='es'>
      <body className='min-h-dvh antialiased'>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
