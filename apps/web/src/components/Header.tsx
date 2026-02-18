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
  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.primaryEmailAddress?.emailAddress || 'Profile'
    : 'Profile';

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

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-exale-dark border-b border-white/[0.08]">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
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
        <nav className="flex items-center gap-4 sm:gap-6 md:gap-8" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[11px] uppercase tracking-[0.15em] font-medium text-white/80 hover:text-white transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-6 shrink-0">
          {!isLoaded ? (
            <Link
              href="/sign-in"
              className="text-[11px] uppercase tracking-[0.15em] font-medium text-white/80 hover:text-white transition-colors duration-200"
            >
              Sign In
            </Link>
          ) : (
            <>
              <SignedOut>
                <SignInButton mode="redirect" forceRedirectUrl="/">
                  <button className="text-[11px] uppercase tracking-[0.15em] font-medium text-white/80 hover:text-white transition-colors duration-200">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                {(isAdmin || isFounderEmail) && (
                  <Link
                    href="/hub"
                    className="text-[11px] uppercase tracking-[0.15em] font-medium text-white/80 hover:text-white transition-colors duration-200"
                  >
                    Dashboard
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="text-[11px] uppercase tracking-[0.15em] font-medium text-white/80 hover:text-white transition-colors duration-200 max-w-[140px] truncate"
                  title={displayName}
                >
                  {displayName}
                </Link>
                <div>
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

