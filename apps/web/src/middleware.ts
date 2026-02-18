import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextFetchEvent, NextRequest } from 'next/server';

const DASHBOARD_HOST = process.env.NEXT_PUBLIC_DASHBOARD_HOST || 'dashboard.exale.net';
const MAIN_SITE_HOST = process.env.NEXT_PUBLIC_SITE_HOST || 'exale.net';

const HUB_PATH_MAP: Record<string, string> = {
  '/': '/hub',
  '/inbox': '/hub/inbox',
  '/apply': '/hub/apply',
  '/analytics': '/hub/analytics',
  '/media': '/hub/media',
  '/cms': '/hub/cms',
  '/seo': '/hub/seo',
  '/activity': '/hub/activity',
  '/admins': '/hub/admins',
  '/settings': '/hub/settings',
};

function isDashboardHost(host: string | null): boolean {
  if (!host) return false;
  const h = host.replace(/:\d+$/, '');
  return h === DASHBOARD_HOST || h === 'dashboard.localhost';
}

function isMainSiteHost(host: string | null): boolean {
  if (!host) return false;
  const h = host.replace(/:\d+$/, '');
  return h === MAIN_SITE_HOST || h === 'www.exale.net';
}

async function subdomainMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const host = request.headers.get('host') ?? '';
  const url = request.nextUrl.clone();
  const path = url.pathname || '/';

  if (isDashboardHost(host)) {
    const rewritePath = HUB_PATH_MAP[path] ?? (path.startsWith('/hub') ? path : null);
    if (rewritePath) {
      url.pathname = rewritePath;
      return NextResponse.rewrite(url);
    }
  }

  if (isMainSiteHost(host) && path.startsWith('/hub')) {
    const dashboardPath = path === '/hub' || path === '/hub/' ? '/' : path.replace(/^\/hub/, '') || '/';
    const dashboardUrl = new URL(dashboardPath, `https://${DASHBOARD_HOST}`);
    dashboardUrl.search = url.search;
    return NextResponse.redirect(dashboardUrl.toString());
  }

  return null;
}

export default async function middleware(request: NextRequest, event: NextFetchEvent) {
  const subdomainRes = await subdomainMiddleware(request);
  if (subdomainRes) return subdomainRes;
  return clerkMiddleware()(request, event);
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
