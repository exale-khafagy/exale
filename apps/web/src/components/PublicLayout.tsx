'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';
import { ScrollProgress } from './ScrollProgress';

const DASHBOARD_HOST = process.env.NEXT_PUBLIC_DASHBOARD_HOST || 'dashboard.exale.net';

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const scrollRef = useRef<HTMLElement>(null);
  const [isDashboardSubdomain, setIsDashboardSubdomain] = useState(false);

  useEffect(() => {
    const host = typeof window !== 'undefined' ? window.location.hostname : '';
    setIsDashboardSubdomain(
      host === DASHBOARD_HOST || host === 'dashboard.localhost'
    );
  }, []);

  const isHub = pathname?.startsWith('/hub') || isDashboardSubdomain;
  const isLanding = (pathname === '/' || pathname === '') && !isDashboardSubdomain;

  useEffect(() => {
    if (isLanding && scrollRef.current) {
      scrollRef.current.scrollTo(0, 0);
    }
  }, [pathname, isLanding]);

  if (isHub) {
    return <>{children}</>;
  }

  if (isLanding) {
    return (
      <>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Header />
        <ScrollProgress scrollRef={scrollRef} />
        <main
          id="main-content"
          ref={scrollRef}
          className="h-screen overflow-y-auto overflow-x-hidden snap-y snap-mandatory pt-20 bg-stone-100"
        >
          {children}
          <Footer />
        </main>
      </>
    );
  }

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="relative pt-20 min-h-screen bg-background overflow-x-hidden">{children}</main>
      <Footer />
    </>
  );
}
