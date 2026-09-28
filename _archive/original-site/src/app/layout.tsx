import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'KINETIK — Creative Technology & Digital Studio',
  description:
    'Award-winning creative technology and digital experience studio crafting cinematic WebGL, brand systems, and visionary digital products.',
  openGraph: {
    title: 'KINETIK — Creative Technology & Digital Studio',
    description:
      'Award-winning creative technology and digital experience studio crafting cinematic WebGL, brand systems, and visionary digital products.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Syne:wght@500;600;700;800&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#09090b] text-[#f4f4f5] antialiased selection:bg-white selection:text-black overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
