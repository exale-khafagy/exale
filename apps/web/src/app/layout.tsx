import type { Metadata, Viewport } from 'next';
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

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? 'G-39KEHMNYXV';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

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
        <head>
          {GA_ID ? (
            <>
              <script
                async
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              />
              <script
                dangerouslySetInnerHTML={{
                  __html: [
                    'window.dataLayer = window.dataLayer || [];',
                    'function gtag(){dataLayer.push(arguments);}',
                    "gtag('js', new Date());",
                    "gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'granted' });",
                    `gtag('config', '${GA_ID}', { send_page_view: true });`,
                  ].join('\n'),
                }}
              />
            </>
          ) : null}
        </head>
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
