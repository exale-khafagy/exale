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

const baseLinkClass =
  'text-xs uppercase tracking-[0.18em] font-semibold text-white/80 hover:text-white transition-all duration-300 whitespace-nowrap';

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

  const userInitials = [user?.firstName, user?.lastName]
    .map((n) => n?.[0])
    .filter(Boolean)
    .join('') || '?';

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-exale-dark/95 backdrop-blur-xl border-b border-white/[0.08] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 min-h-[64px]">
        
        {/* Logo */}
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

        {/* Desktop Navigation (Strictly visible on 'lg' screens and up) */}
        <nav className="hidden lg:flex flex-1 items-center justify-end gap-8" aria-label="Main navigation">
          <div className="flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={`${baseLinkClass} py-2`}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center border-l border-white/20 pl-8 shrink-0 h-8">
            {!isLoaded ? (
              <div className="w-16 h-4 bg-white/10 animate-pulse rounded" />
            ) : (
              <>
                <SignedOut>
                  <SignInButton mode="redirect" forceRedirectUrl="/">
                    <button className={`${baseLinkClass} py-2`}>Sign In</button>
                  </SignInButton>
                </SignedOut>

                <SignedIn>
                  {(isAdmin || isFounderEmail) && (
                    <Link href="/hub" className={`${baseLinkClass} mr-6 py-2`}>
                      Dashboard
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 border border-white/20 overflow-hidden transition-all hover:ring-2 hover:ring-white/40 hover:bg-white/20 shrink-0"
                  >
                    {user?.imageUrl ? (
                      <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-xs font-bold uppercase tracking-wider">{userInitials}</span>
                    )}
                  </Link>
                </SignedIn>
              </>
            )}
          </div>
        </nav>

        {/* Mobile Hamburger Toggle Button (Strictly visible on smaller screens) */}
        <button
          className="block lg:hidden p-2 text-white/80 hover:text-white transition-colors z-50"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      <div 
        className={`lg:hidden absolute top-full left-0 right-0 bg-exale-dark/95 backdrop-blur-xl border-b border-white/10 transition-all duration-300 ease-in-out overflow-hidden ${
          isMobileMenuOpen ? 'max-h-[500px] opacity-100 py-4 shadow-2xl' : 'max-h-0 opacity-0 py-0'
        }`}
      >
        <div className="flex flex-col px-4 gap-4">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`${baseLinkClass} block py-2 border-b border-white/5`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-2 flex items-center justify-between">
            {!isLoaded ? (
              <div className="w-16 h-4 bg-white/10 animate-pulse rounded" />
            ) : (
              <>
                <SignedOut>
                  <SignInButton mode="redirect" forceRedirectUrl="/">
                    <button className={`${baseLinkClass} w-full text-left py-2`}>Sign In</button>
                  </SignInButton>
                </SignedOut>

                <SignedIn>
                  {(isAdmin || isFounderEmail) && (
                    <Link 
                      href="/hub" 
                      className={`${baseLinkClass} py-2`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 py-2 group"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 border border-white/20 overflow-hidden group-hover:ring-2 group-hover:ring-white/40">
                      {user?.imageUrl ? (
                        <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-xs font-bold uppercase tracking-wider">{userInitials}</span>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">
                      Profile
                    </span>
                  </Link>
                </SignedIn>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}