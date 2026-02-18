import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { NextSSRPlugin } from '@uploadthing/react/next-ssr-plugin';
import { extractRouterConfig } from 'uploadthing/server';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { PublicLayout } from '@/components/PublicLayout';
import { ProfileSync } from '@/components/ProfileSync';
import { SchemaOrg } from '@/components/SchemaOrg';
import { CookieConsent } from '@/components/CookieConsent';
import { ourFileRouter } from '@/app/api/uploadthing/core';
import './globals.css';
import '@uploadthing/react/styles.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Exale — Not Every Beginning Has An Ending',
  description: 'Business development holding company. We help bring your vision to life.',
  icons: { icon: '/images/x-exale.png' },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://exale.net'),
  openGraph: {
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${plusJakarta.variable} font-sans antialiased bg-background`}
        >
          <SchemaOrg />
          <CookieConsent />
          <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
          <ProfileSync />
          <PublicLayout>{children}</PublicLayout>
        </body>
      </html>
    </ClerkProvider>
  );
}
