'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Command } from 'cmdk';

const DASHBOARD_HOST = process.env.NEXT_PUBLIC_DASHBOARD_HOST || 'dashboard.exale.net';

const hubItems = [
  { hub: '/hub', subdomain: '/', label: 'Overview' },
  { hub: '/hub/inbox', subdomain: '/inbox', label: 'Contact Inbox' },
  { hub: '/hub/apply', subdomain: '/apply', label: 'Applications' },
  { hub: '/hub/analytics', subdomain: '/analytics', label: 'Analytics' },
  { hub: '/hub/media', subdomain: '/media', label: 'Media' },
  { hub: '/hub/cms', subdomain: '/cms', label: 'Content' },
  { hub: '/hub/seo', subdomain: '/seo', label: 'SEO' },
  { hub: '/hub/activity', subdomain: '/activity', label: 'Activity' },
  { hub: '/hub/admins', subdomain: '/admins', label: 'Admins' },
  { hub: '/hub/settings', subdomain: '/settings', label: 'Settings' },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDashboardSubdomain, setIsDashboardSubdomain] = useState(false);

  useEffect(() => {
    const host = typeof window !== 'undefined' ? window.location.hostname : '';
    setIsDashboardSubdomain(host === DASHBOARD_HOST || host === 'dashboard.localhost');
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Navigate hub"
      className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl"
    >
      <Command.Input
        placeholder="Search pages..."
        className="w-full border-b border-gray-200 dark:border-gray-700 bg-transparent px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-0"
      />
      <Command.List className="max-h-72 overflow-auto p-2">
        <Command.Empty className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
          No results found.
        </Command.Empty>
        {hubItems.map((item) => {
          const href = isDashboardSubdomain ? item.subdomain : item.hub;
          return (
          <Command.Item
            key={item.hub}
            value={item.label}
            onSelect={() => {
              router.push(href);
              setOpen(false);
            }}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-gray-900 dark:text-white aria-selected:bg-royal-violet/10 aria-selected:text-royal-violet dark:aria-selected:bg-royal-violet/20"
          >
            {item.label}
          </Command.Item>
        );
        })}
      </Command.List>
      <div className="border-t border-gray-200 dark:border-gray-700 px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
        <kbd className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono">⌘K</kbd> or{' '}
        <kbd className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-mono">Ctrl+K</kbd> to
        open
      </div>
    </Command.Dialog>
  );
}
