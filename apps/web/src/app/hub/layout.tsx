'use client';

import { SignedIn, SignedOut, RedirectToSignIn, SignOutButton, useAuth, useUser } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import { apiGet } from '@/lib/api-auth';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { CommandPalette } from '@/components/hub/CommandPalette';

const HubAuthContext = createContext<{ role: HubRole | null }>({ role: null });
export function useHubRole() {
  return useContext(HubAuthContext).role;
}

const DASHBOARD_HOST = process.env.NEXT_PUBLIC_DASHBOARD_HOST || 'dashboard.exale.net';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://exale.net';

export type HubRole =
  | 'FOUNDER'
  | 'TIER2_ADMIN'
  | 'ADMIN'
  | 'MODERATOR'
  | 'CONTENT_WRITER'
  | 'SEO'
  | 'EDITOR';

const ROLES_WORKFORCE: HubRole[] = ['FOUNDER', 'TIER2_ADMIN'];
const ROLES_SETTINGS: HubRole[] = ['FOUNDER', 'TIER2_ADMIN', 'ADMIN'];
const ROLES_INBOX_APPLY: HubRole[] = ['FOUNDER', 'TIER2_ADMIN', 'ADMIN', 'MODERATOR'];
const ROLES_MEDIA: HubRole[] = ['FOUNDER', 'TIER2_ADMIN', 'ADMIN', 'MODERATOR', 'CONTENT_WRITER'];
const ROLES_CONTENT: HubRole[] = ['FOUNDER', 'TIER2_ADMIN', 'ADMIN', 'CONTENT_WRITER', 'SEO'];
const ROLES_SEO: HubRole[] = ['FOUNDER', 'TIER2_ADMIN', 'ADMIN', 'SEO'];
const ROLES_ALL: HubRole[] = [
  'FOUNDER',
  'TIER2_ADMIN',
  'ADMIN',
  'MODERATOR',
  'CONTENT_WRITER',
  'SEO',
  'EDITOR',
];

const navItemsAll: Array<{
  hub: string;
  subdomain: string;
  label: string;
  allowedRoles: HubRole[];
}> = [
  { hub: '/hub', subdomain: '/', label: 'Overview', allowedRoles: ROLES_ALL },
  { hub: '/hub/inbox', subdomain: '/inbox', label: 'Contact Inbox', allowedRoles: ROLES_INBOX_APPLY },
  { hub: '/hub/apply', subdomain: '/apply', label: 'Applications', allowedRoles: ROLES_INBOX_APPLY },
  { hub: '/hub/analytics', subdomain: '/analytics', label: 'Analytics', allowedRoles: ROLES_ALL },
  { hub: '/hub/media', subdomain: '/media', label: 'Media', allowedRoles: ROLES_MEDIA },
  { hub: '/hub/cms', subdomain: '/cms', label: 'Content', allowedRoles: ROLES_CONTENT },
  { hub: '/hub/seo', subdomain: '/seo', label: 'SEO', allowedRoles: ROLES_SEO },
  { hub: '/hub/activity', subdomain: '/activity', label: 'Activity', allowedRoles: ROLES_ALL },
  { hub: '/hub/admins', subdomain: '/admins', label: 'Workforce', allowedRoles: ROLES_WORKFORCE },
  { hub: '/hub/settings', subdomain: '/settings', label: 'Settings', allowedRoles: ROLES_SETTINGS },
];

function AccessDeniedScreen({ siteUrl }: { siteUrl: string }) {
  useEffect(() => {
    const t = setTimeout(() => {
      window.location.href = siteUrl;
    }, 8000);
    return () => clearTimeout(t);
  }, [siteUrl]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Dashboard access only for admins</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          You don&apos;t have admin access. Sign in from the marketing website first to request access.
        </p>
        <p className="text-gray-500 dark:text-gray-500 text-sm mb-6">
          Redirecting you to exale.net in 8 seconds…
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href={siteUrl} className="btn-primary inline-block px-6 py-3">
            Go to exale.net
          </Link>
          <SignOutButton signOutOptions={{ redirectUrl: siteUrl }}>
            <button className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              Sign out
            </button>
          </SignOutButton>
        </div>
      </div>
    </div>
  );
}

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
  const [role, setRole] = useState<HubRole | null>(null);
  const [checking, setChecking] = useState(true);
  const [isDashboardSubdomain, setIsDashboardSubdomain] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navItems = navItemsAll.filter(
    (i) => role && i.allowedRoles.includes(role),
  );

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
          const result = await apiGet<{
            isAdmin: boolean;
            role?: HubRole | string;
          }>('/admin/check', authToken);
          if (!result.isAdmin && isFounderEmail && !retryDelay) {
            return doCheck(2000);
          }
          return result;
        }
        try {
          const result = await doCheck();
          setIsAdmin(result.isAdmin);
          const roleVal = (result.role as HubRole) ?? (result.isAdmin ? 'ADMIN' : null);
          setRole(roleVal);
          if (!result.isAdmin && !isFounderEmail) {
            if (typeof window !== 'undefined' && (window.location.hostname === DASHBOARD_HOST || window.location.hostname === 'dashboard.localhost')) {
              window.location.href = SITE_URL;
            } else {
              router.push('/');
            }
          } else if (!result.isAdmin && isFounderEmail) {
            setIsAdmin(true);
            setRole('FOUNDER');
          }
          // Redirect away from pages this role cannot access
          const host = typeof window !== 'undefined' ? window.location.hostname : '';
          const isSub = host === DASHBOARD_HOST || host === 'dashboard.localhost';
          const workforcePath = isSub ? '/admins' : '/hub/admins';
          const settingsPath = isSub ? '/settings' : '/hub/settings';
          const hubPath = isSub ? '/' : '/hub';
          if (result.isAdmin && roleVal) {
            if (pathname === workforcePath && !ROLES_WORKFORCE.includes(roleVal)) {
              router.push(hubPath);
            } else if (pathname === settingsPath && !ROLES_SETTINGS.includes(roleVal)) {
              router.push(hubPath);
            } else if (
              pathname?.startsWith(isSub ? '/inbox' : '/hub/inbox') &&
              !ROLES_INBOX_APPLY.includes(roleVal)
            ) {
              router.push(hubPath);
            } else if (
              pathname?.startsWith(isSub ? '/apply' : '/hub/apply') &&
              !ROLES_INBOX_APPLY.includes(roleVal)
            ) {
              router.push(hubPath);
            } else if (
              pathname?.startsWith(isSub ? '/media' : '/hub/media') &&
              !ROLES_MEDIA.includes(roleVal)
            ) {
              router.push(hubPath);
            } else if (
              pathname?.startsWith(isSub ? '/cms' : '/hub/cms') &&
              !ROLES_CONTENT.includes(roleVal)
            ) {
              router.push(hubPath);
            } else if (
              pathname?.startsWith(isSub ? '/seo' : '/hub/seo') &&
              !ROLES_SEO.includes(roleVal)
            ) {
              router.push(hubPath);
            }
          }
        } catch (err) {
          if (isFounderEmail) {
            setIsAdmin(true);
            setRole('FOUNDER');
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
          setRole('FOUNDER');
        } else {
          setIsAdmin(false);
          if (typeof window !== 'undefined' && (window.location.hostname === DASHBOARD_HOST || window.location.hostname === 'dashboard.localhost')) {
            window.location.href = 'https://exale.net';
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

  useEffect(() => {
    if (!sidebarOpen) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    document.addEventListener('keydown', onEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onEscape);
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

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
          <AccessDeniedScreen siteUrl={SITE_URL} />
        ) : (
          <HubAuthContext.Provider value={{ role }}>
          <>
            <CommandPalette />
            <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
              {/* Mobile backdrop */}
              <div
                className={`fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity duration-200 ${
                  sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setSidebarOpen(false)}
                aria-hidden
              />

              {/* Sidebar - fixed overlay on mobile, static on desktop */}
              <aside
                className={`fixed lg:relative inset-y-0 left-0 z-40 w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col transform transition-transform duration-200 ease-out shadow-lg lg:shadow-none ${
                  sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}
              >
                <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                  <Link href={isDashboardSubdomain ? '/' : '/hub'} className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
                    <Image
                      src="/images/exale-logo.png"
                      alt="Exale Dashboard"
                      width={100}
                      height={36}
                      className="h-8 w-auto object-contain dark:brightness-0 dark:invert"
                    />
                    <span className="text-gray-500 dark:text-gray-400 text-xs font-medium ml-2">Dashboard</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden p-2 -mr-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    aria-label="Close menu"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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
                        onClick={() => setSidebarOpen(false)}
                        className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors min-h-[44px] flex items-center ${
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
                <header className="h-16 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center justify-between px-4 sm:px-6 gap-4">
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    aria-label="Open menu"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <div className="flex-1 lg:flex-none" />
                  <div className="flex items-center gap-2 sm:gap-4">
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
                    <a
                      href={SITE_URL}
                      onClick={(e) => { e.preventDefault(); window.location.href = SITE_URL; }}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors shrink-0"
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Go to exale.net
                    </a>
                    <a
                      href={SITE_URL}
                      onClick={(e) => { e.preventDefault(); window.location.href = SITE_URL; }}
                      className="sm:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
                      aria-label="Go to exale.net"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    <Link
                      href={isDashboardSubdomain ? `${SITE_URL}/profile` : '/profile'}
                      className="flex items-center gap-2 rounded-full overflow-hidden shrink-0 ml-2 border border-gray-200 dark:border-gray-600 hover:opacity-90 transition-opacity"
                      aria-label="Profile (sign out from profile page)"
                    >
                      {user?.imageUrl ? (
                        <img src={user.imageUrl} alt="" className="w-8 h-8 rounded-full object-cover" width={32} height={32} />
                      ) : (
                        <span className="w-8 h-8 rounded-full bg-royal-violet/20 flex items-center justify-center text-royal-violet text-sm font-semibold">
                          {[user?.firstName, user?.lastName].map((n) => n?.[0]).filter(Boolean).join('') || '?'}
                        </span>
                      )}
                    </Link>
                  </div>
                </header>
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto bg-gray-50 dark:bg-gray-900">{children}</main>
              </div>
            </div>
          </>
          </HubAuthContext.Provider>
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
