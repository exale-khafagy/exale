'use client';

import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
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

const linkClass =
  'text-[11px] uppercase tracking-[0.15em] font-medium text-white/80 hover:text-white transition-colors duration-200';

export function Header() {
  const { user } = useUser();
  const { getToken, isLoaded } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fallback: check if user is founder by email (client-side check)
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

        if (retryDelay) {
          await new Promise((r) => setTimeout(r, retryDelay));
        }

        try {
          const result = await apiGet<{ isAdmin: boolean }>('/admin/check', token);
          setIsAdmin(result.isAdmin);
        } catch (err) {
          // ProfileSync may still be running; retry once for founder
          if (isFounderEmail && !retryDelay) {
            checkAdmin(2000);
          } else if (isFounderEmail) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        }
      } catch (err) {
        setIsAdmin(!!isFounderEmail);
      }
    }
    checkAdmin();
  }, [user, getToken, isFounderEmail]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', onEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onEscape);
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-exale-dark border-b border-white/[0.08]">
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 shrink-0 transition-opacity hover:opacity-80"
        >
          <Image
            src="/images/exale-logo.png"
            alt="Exale"
            width={120}
            height={40}
            className="h-8 w-auto object-contain"
            priority
          />
        </Link>

        {/* Nav - visible from md up, hamburger below */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth - Sign In or Dashboard + UserButton when signed in */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          {!isLoaded ? (
            <Link href="/sign-in" className={linkClass}>
              Sign In
            </Link>
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
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </>
          )}
        </div>

        {/* Mobile menu button - visible when nav is hidden */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden p-2.5 -mr-2.5 text-white hover:text-white/90 bg-white/10 hover:bg-white/15 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[99] md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden
          />
          <div
            className="fixed top-0 right-0 h-full w-[min(320px,85vw)] bg-exale-dark border-l border-white/[0.08] z-[101] flex flex-col shadow-xl md:hidden"
            role="dialog"
            aria-label="Mobile navigation"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/[0.08]">
              <span className="text-white/60 text-xs uppercase tracking-wider font-medium">Menu</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 -mr-2.5 text-white/80 hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-1" aria-label="Main navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-4 px-4 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors min-h-[44px] flex items-center"
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-white/[0.08] my-4" />
              {!isLoaded ? (
                <Link
                  href="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-4 px-4 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors min-h-[44px] flex items-center"
                >
                  Sign In
                </Link>
              ) : (
                <>
                  <SignedOut>
                    <SignInButton mode="redirect" forceRedirectUrl="/">
                      <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full text-left py-4 px-4 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors min-h-[44px] flex items-center"
                      >
                        Sign In
                      </button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    {(isAdmin || isFounderEmail) && (
                      <Link
                        href="/hub"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-4 px-4 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors min-h-[44px] flex items-center"
                      >
                        Dashboard
                      </Link>
                    )}
                    <div className="py-4 px-4 flex items-center min-h-[44px]">
                      <UserButton afterSignOutUrl="/" />
                    </div>
                  </SignedIn>
                </>
              )}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}

