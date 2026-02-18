'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import Link from 'next/link';

const CONSENT_KEY = 'cookie-consent';
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

type ConsentStatus = 'accepted' | 'rejected' | null;

export function CookieConsent() {
  const [consent, setConsent] = useState<ConsentStatus>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(CONSENT_KEY) as ConsentStatus | null;
    if (stored === 'accepted' || stored === 'rejected') {
      setConsent(stored);
      if (stored === 'accepted' && GA_ID && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
        (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('consent', 'update', {
          analytics_storage: 'granted',
        });
      }
    }
    setMounted(true);
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setConsent('accepted');
    if (GA_ID && typeof window !== 'undefined') {
      (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag?.('consent', 'update', {
        analytics_storage: 'granted',
      });
    }
  };

  const reject = () => {
    localStorage.setItem(CONSENT_KEY, 'rejected');
    setConsent('rejected');
  };

  const showBanner = mounted && consent === null;

  return (
    <>
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-consent" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('consent', 'default', {
                analytics_storage: 'denied',
                ad_storage: 'denied'
              });
              gtag('config', '${GA_ID}', { send_page_view: false });
            `}
          </Script>
        </>
      )}
      {showBanner && (
        <div
          role="dialog"
          aria-label="Cookie consent"
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-lg"
        >
          <div className="mx-auto max-w-4xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We use cookies to improve your experience and analyze site traffic. By clicking
              &quot;Accept&quot;, you consent to our use of cookies.{' '}
              <Link href="/privacy" className="text-royal-violet hover:underline">
                Privacy policy
              </Link>
            </p>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={reject}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Decline
              </button>
              <button
                onClick={accept}
                className="px-4 py-2 text-sm font-medium text-white bg-royal-violet hover:bg-royal-violet/90 rounded-lg transition-colors"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
