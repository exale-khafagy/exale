'use client';

import {
  SignInButton,
  SignedIn,
  SignedOut,
  useAuth,
  useUser,
} from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api-auth';

const navLinks = [
  { href: '/services', label: 'Services' },
  { href: '/partners', label: 'Partners' },
  { href: '/media', label: 'Media' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
  { href: '/apply', label: 'Apply' },
];

export function Header() {
  const { user } = useUser();
  const { getToken, isLoaded } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const FOUNDER_EMAIL = 'khafagy.ahmedibrahim@gmail.com';
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  const isFounderEmail = userEmail === FOUNDER_EMAIL.toLowerCase();

  useEffect(() => {
    async function checkAdmin(retryDelay?: number) {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      try {
        const token = await getToken();
        if (!token) {
          setIsAdmin(false);
          return;
        }
        if (retryDelay) await new Promise((r) => setTimeout(r, retryDelay));
        try {
          const result = await apiGet<{ isAdmin: boolean }>('/admin/check', token);
          setIsAdmin(result.isAdmin);
        } catch (err) {
          if (isFounderEmail && !retryDelay) checkAdmin(2000);
          else if (isFounderEmail) setIsAdmin(true);
          else setIsAdmin(false);
        }
      } catch (err) {
        setIsAdmin(!!isFounderEmail);
      }
    }
    checkAdmin();
  }, [user, getToken, isFounderEmail]);

  const linkClass = 'text-xs uppercase tracking-[0.18em] font-semibold text-white/85 hover:text-white transition-colors';

  return (
    <>
      {/* Raw CSS to bypass Tailwind config issues entirely */}
      <style>{`
        .force-desktop-nav { display: none !important; }
        .force-mobile-btn { display: block !important; }
        
        @media (min-width: 800px) {
          .force-desktop-nav { display: flex !important; }
          .force-mobile-btn { display: none !important; }
        }
      `}</style>

      <header className="fixed top-0 left-0 right-0 z-[100] bg-exale-dark/95 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          
          {/* LOGO */}
          <Link
            href="/"
            className="shrink-0 transition-opacity hover:opacity-80 z-50"
            aria-label="Exale home"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Image
              src="/images/exale-logo.png"
              alt="Exale Logo"
              width={120}
              height={40}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>

          {/* DESKTOP VIEW (Forced by pure CSS) */}
          <nav className="force-desktop-nav items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass}>
                {link.label}
              </Link>
            ))}

            <div className="h-6 w-px bg-white/20 mx-2"></div>

            {!isLoaded ? (
              <div className="w-16 h-4 bg-white/10 animate-pulse rounded" />
            ) : (
              <>
                <SignedOut>
                  <SignInButton mode="redirect" forceRedirectUrl="/">
                    <button className={linkClass}>Sign In</button>
                  </SignInButton>
                </SignedOut>

                <SignedIn>
                  {(isAdmin || isFounderEmail) && (
                    <Link href="/hub" className={linkClass}>
                      Dashboard
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="w-8 h-8 rounded-full overflow-hidden border border-white/20 hover:border-white/60 transition-colors ml-4"
                  >
                    {user?.imageUrl ? (
                      <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                        {[user?.firstName, user?.lastName].map((n) => n?.[0]).filter(Boolean).join('') || '?'}
                      </div>
                    )}
                  </Link>
                </SignedIn>
              </>
            )}
          </nav>

          {/* MOBILE TOGGLE BUTTON (Forced by pure CSS) */}
          <button
            className="force-mobile-btn p-2 -mr-2 text-white z-50"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* MOBILE DROPDOWN MENU */}
        {isMobileMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-exale-dark/95 backdrop-blur-md border-b border-white/10 shadow-2xl flex flex-col p-4 z-40">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`${linkClass} py-4 border-b border-white/5`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="py-4">
              {!isLoaded ? (
                <div className="w-16 h-4 bg-white/10 animate-pulse rounded" />
              ) : (
                <>
                  <SignedOut>
                    <SignInButton mode="redirect" forceRedirectUrl="/">
                      <button className={`${linkClass} w-full text-left py-2`}>Sign In</button>
                    </SignInButton>
                  </SignedOut>

                  <SignedIn>
                    {(isAdmin || isFounderEmail) && (
                      <Link 
                        href="/hub" 
                        className={`${linkClass} block py-3 mb-2`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
                        {user?.imageUrl ? (
                          <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                            {[user?.firstName, user?.lastName].map((n) => n?.[0]).filter(Boolean).join('') || '?'}
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-white/85">Profile</span>
                    </Link>
                  </SignedIn>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}