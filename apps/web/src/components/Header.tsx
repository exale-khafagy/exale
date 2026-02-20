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
  'text-xs uppercase tracking-[0.18em] font-semibold text-white/75 hover:text-white transition-all duration-300 whitespace-nowrap py-2';

export function Header() {
  const { user } = useUser();
  const { getToken, isLoaded } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

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

  const userInitials =
    [user?.firstName, user?.lastName]
      .map((n) => n?.[0])
      .filter(Boolean)
      .join('') || '?';

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-exale-dark/80 backdrop-blur-xl backdrop-saturate-150 border-b border-white/[0.08] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 min-h-[64px]">
        {/* Logo */}
        <Link
          href="/"
          className="shrink-0 transition-transform hover:scale-105 duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded"
          aria-label="Exale home"
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

        {/* Navigation & Auth */}
        <nav
          className="flex-1 flex items-center justify-end gap-5 sm:gap-8 overflow-x-auto py-2 -mx-2 px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          aria-label="Main navigation"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {/* Main Links */}
          <div className="flex items-center gap-5 sm:gap-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={baseLinkClass}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions / Profile / Auth (Grouped with a subtle divider) */}
          <div className="flex items-center border-l border-white/20 pl-5 sm:pl-8 ml-2 shrink-0 h-8">
            {!isLoaded ? (
              <div className="w-20 h-4 bg-white/10 animate-pulse rounded" />
            ) : (
              <>
                <SignedOut>
                  <SignInButton mode="redirect" forceRedirectUrl="/">
                    <button className={baseLinkClass}>Sign In</button>
                  </SignInButton>
                </SignedOut>

                <SignedIn>
                  {(isAdmin || isFounderEmail) && (
                    <Link href="/hub" className={`${baseLinkClass} mr-6`}>
                      Dashboard
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 border border-white/20 overflow-hidden transition-all hover:ring-2 hover:ring-white/40 hover:bg-white/20 shrink-0"
                    aria-label="Go to your profile"
                  >
                    {user?.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-xs font-bold uppercase tracking-wider">
                        {userInitials}
                      </span>
                    )}
                  </Link>
                </SignedIn>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
