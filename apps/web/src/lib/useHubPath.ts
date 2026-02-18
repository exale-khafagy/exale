'use client';

import { useEffect, useState } from 'react';

const DASHBOARD_HOST = process.env.NEXT_PUBLIC_DASHBOARD_HOST || 'dashboard.exale.net';

function resolveHubPath(path: string): string {
  if (typeof window === 'undefined') return path;
  const isDashboardSubdomain =
    window.location.hostname === DASHBOARD_HOST || window.location.hostname === 'dashboard.localhost';
  if (isDashboardSubdomain) {
    return path === '/hub' ? '/' : path.replace(/^\/hub/, '') || '/';
  }
  return path;
}

/** Use during render - safe from hydration mismatch (returns path until mounted, then subdomain-aware path). */
export function useHubPath(path: string): string {
  const [resolved, setResolved] = useState(path);
  useEffect(() => {
    setResolved(resolveHubPath(path));
  }, [path]);
  return resolved;
}

/** Call only after mount (e.g. inside useEffect/callbacks). Safe for client-only code. */
export function getHubPath(path: string): string {
  return resolveHubPath(path);
}
