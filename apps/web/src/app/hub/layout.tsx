'use client';

import { SignedIn, SignedOut, RedirectToSignIn, SignOutButton, useAuth, useUser } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api-auth';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { CommandPalette } from '@/components/hub/CommandPalette';

const DASHBOARD_HOST = process.env.NEXT_PUBLIC_DASHBOARD_HOST || 'dashboard.exale.net';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const navItemsAll = [
  { hub: '/hub', subdomain: '/', label: 'Overview' },
  { hub: '/hub/inbox', subdomain: '/inbox', label: 'Contact Inbox' },
  { hub: '/hub/apply', subdomain: '/apply', label: 'Applications' },
  { hub: '/hub/analytics', subdomain: '/analytics', label: 'Analytics' },
  { hub: '/hub/media', subdomain: '/media', label: 'Media' },
  { hub: '/hub/cms', subdomain: '/cms', label: 'Content' },
  { hub: '/hub/seo', subdomain: '/seo', label: 'SEO' },
  { hub: '/hub/activity', subdomain: '/activity', label: 'Activity' },
  { hub: '/hub/admins', subdomain: '/admins', label: 'Admins', adminOnly: true },
  { hub: '/hub/settings', subdomain: '/settings', label: 'Settings', adminOnly: true },
];

function HubLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { getToken } = useAuth();
  const { user } = useUser();
  const { theme, toggleTheme } = useTheme();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [role, setRole] = useState<'EDITOR' | 'ADMIN' | null>(null);
  const [checking, setChecking] = useState(true);
  const [isDashboardSubdomain, setIsDashboardSubdomain] = useState(false);
  const navItems = navItemsAll.filter((i) => !('adminOnly' in i && i.adminOnly) || role === 'ADMIN');

  useEffect(() => {
    const host = typeof window !== 'undefined' ? window.location.hostname : '';
    setIsDashboardSubdomain(host === DASHBOARD_HOST || host === 'dashboard.localhost');
  }, []);

  useEffect(() => {
    async function checkAdmin() {
      if (!user) {
        setChecking(false);
        return;
      }

      const FOUNDER_EMAIL = 'khafagy.ahmedibrahim@gmail.com';
      const userEmail = user.primaryEmailAddress?.emailAddress?.toLowerCase();
      const isFounderEmail = userEmail === FOUNDER_EMAIL.toLowerCase();

      try {
        const token = await getToken();
        if (!token) {
          if (isFounderEmail) {
            setIsAdmin(true);
            setRole('ADMIN');
            setChecking(false);
            return;
          }
          setChecking(false);
          return;
        }
        const authToken: string = token;

        // ProfileSync (root layout) handles profile creation; founder gets Admin via sync.
        // If /admin/check fails or returns false for founder, ProfileSync may still be running - retry once.
        async function doCheck(retryDelay?: number) {
          if (retryDelay) await new Promise((r) => setTimeout(r, retryDelay));
          const result = await apiGet<{ isAdmin: boolean; role?: 'EDITOR' | 'ADMIN' }>('/admin/check', authToken);
          if (!result.isAdmin && isFounderEmail && !retryDelay) {
            return doCheck(2000);
          }
          return result;
        }
        try {
          const result = await doCheck();
          setIsAdmin(result.isAdmin);
          setRole(result.role ?? (result.isAdmin ? 'ADMIN' : null));
          if (!result.isAdmin && !isFounderEmail) {
            if (typeof window !== 'undefined' && (window.location.hostname === DASHBOARD_HOST || window.location.hostname === 'dashboard.localhost')) {
              window.location.href = SITE_URL;
            } else {
              router.push('/');
            }
          } else if (!result.isAdmin && isFounderEmail) {
            setIsAdmin(true);
            setRole('ADMIN');
          }
          // Redirect editors away from admin-only pages (compute host client-side)
          const host = typeof window !== 'undefined' ? window.location.hostname : '';
          const isSub = host === DASHBOARD_HOST || host === 'dashboard.localhost';
          const adminsPath = isSub ? '/admins' : '/hub/admins';
          const settingsPath = isSub ? '/settings' : '/hub/settings';
          const hubPath = isSub ? '/' : '/hub';
          if (result.isAdmin && result.role === 'EDITOR' && (pathname === adminsPath || pathname === settingsPath)) {
            router.push(hubPath);
          }
        } catch (err) {
          if (isFounderEmail) {
            setIsAdmin(true);
            setRole('ADMIN');
          } else {
            setIsAdmin(false);
            if (typeof window !== 'undefined' && (window.location.hostname === DASHBOARD_HOST || window.location.hostname === 'dashboard.localhost')) {
              window.location.href = SITE_URL;
            } else {
              router.push('/');
            }
          }
        }
      } catch (err) {
        // If all checks fail but user is founder, allow access
        if (isFounderEmail) {
          setIsAdmin(true);
          setRole('ADMIN');
        } else {
          setIsAdmin(false);
          if (typeof window !== 'undefined' && (window.location.hostname === DASHBOARD_HOST || window.location.hostname === 'dashboard.localhost')) {
            window.location.href = SITE_URL;
          } else {
            router.push('/');
          }
        }
      } finally {
        setChecking(false);
      }
    }
    checkAdmin();
  }, [user, getToken, router, pathname]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 border-t-royal-violet rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Checking access...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        {isAdmin === false ? (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">You don&apos;t have admin access.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href={SITE_URL}
                  className="btn-primary inline-block"
                >
                  Go to Exale.net
                </Link>
                <SignOutButton signOutOptions={{ redirectUrl: SITE_URL }}>
                  <button className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    Sign out
                  </button>
                </SignOutButton>
              </div>
            </div>
          </div>
        ) : (
          <>
            <CommandPalette />
            <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
            <aside className="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-300 dark:bg-gray-900 flex flex-col">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <Link href={isDashboardSubdomain ? '/' : '/hub'} className="flex items-center gap-2">
                  <Image
                    src="/images/exale-logo.png"
                    alt="Exale Dashboard"
                    width={100}
                    height={36}
                    className="h-8 w-auto object-contain dark:brightness-0 dark:invert"
                  />
                  <span className="text-gray-500 dark:text-gray-400 text-xs font-medium ml-2">Dashboard</span>
                </Link>
              </div>
              <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                  const href = isDashboardSubdomain ? item.subdomain : item.hub;
                  const isActive =
                    href === (isDashboardSubdomain ? '/' : '/hub')
                      ? pathname === href
                      : pathname === href || pathname?.startsWith(href + '/');
                  return (
                    <Link
                      key={item.hub}
                      href={href}
                      className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-royal-violet/10 text-royal-violet dark:bg-royal-violet/20 dark:text-royal-violet'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </aside>
            <div className="flex-1 flex flex-col min-w-0">
              <header className="h-16 border-b border-gray-200 dark:border-gray-700 bg-gray-300 dark:bg-gray-900 flex items-center justify-between px-6 gap-4">
                <div className="flex-1" />
                <div className="flex items-center gap-4">
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
                    aria-label="Toggle theme"
                  >
                    {theme === 'light' ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )}
                  </button>
                  <Link href={SITE_URL} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    View Site
                  </Link>
                  <UserButton afterSignOutUrl={SITE_URL} />
                </div>
              </header>
              <main className="flex-1 p-6 overflow-auto bg-gray-50 dark:bg-gray-900">{children}</main>
            </div>
          </div>
          </>
        )}
      </SignedIn>
    </>
  );
}

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <HubLayoutContent>{children}</HubLayoutContent>
    </ThemeProvider>
  );
}
