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

  const linkClass =
    'text-xs uppercase tracking-[0.18em] font-semibold text-white/85 hover:text-white transition-colors whitespace-nowrap py-2';

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-exale-dark/95 backdrop-blur-md border-b border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-3 flex items-center gap-4 min-h-[56px]">
        <Link
          href="/"
          className="shrink-0 transition-opacity hover:opacity-80"
          aria-label="Exale home"
        >
          <Image
            src="/images/exale-logo.png"
            alt=""
            width={120}
            height={40}
            className="h-8 w-auto object-contain"
            priority
          />
        </Link>

        {/* One layout for all: nav scrolls horizontally on small screens, normal row on large */}
        <nav
          className="header-nav-scroll flex-1 min-w-0 flex items-center justify-end gap-4 sm:gap-6 lg:gap-8 overflow-x-auto py-1 -mx-2 px-2"
          aria-label="Main navigation"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass}>
              {link.label}
            </Link>
          ))}
          {!isLoaded ? (
            <Link href="/sign-in" className={`${linkClass} shrink-0`}>
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
                  <Link href="/hub" className={`${linkClass} shrink-0`}>
                    Dashboard
                  </Link>
                )}
                <span className="shrink-0 pl-1">
                  <UserButton afterSignOutUrl="/" />
                </span>
              </SignedIn>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
