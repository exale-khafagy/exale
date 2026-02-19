'use client';

import { useAuth } from '@clerk/nextjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiGet } from '@/lib/api-auth';
import { getHubPath } from '@/lib/useHubPath';
import Link from 'next/link';

type ActivityType = 'contact' | 'application' | 'media' | 'admin';

interface ActivityItem {
  id: string;
  type: ActivityType;
  description: string;
  detail?: string;
  createdAt: string;
  link?: string;
}

export default function ActivityPage() {
  const { getToken } = useAuth();
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<ActivityType | 'all'>('all');
  const [daysFilter, setDaysFilter] = useState<number>(30);

  const fetchActivity = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [contacts, applications, media, admins] = await Promise.all([
        apiGet<Array<{ id: string; name: string; createdAt: string }>>('/contact', token).catch(() => []),
        apiGet<Array<{ id: string; name: string; createdAt: string }>>('/apply', token).catch(() => []),
        apiGet<Array<{ id: string; name: string; createdAt: string }>>('/media', token).catch(() => []),
        apiGet<Array<{ id: string; email: string; createdAt: string }>>('/admin', token).catch(() => []),
      ]);

      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - daysFilter);

      const activities: ActivityItem[] = [
        ...contacts.map((c) => ({
          id: `contact-${c.id}`,
          type: 'contact' as const,
          description: `Contact from ${c.name}`,
          detail: c.name,
          createdAt: c.createdAt,
          link: getHubPath('/hub/inbox'),
        })),
        ...applications.map((a) => ({
          id: `apply-${a.id}`,
          type: 'application' as const,
          description: `Application from ${a.name}`,
          detail: a.name,
          createdAt: a.createdAt,
          link: getHubPath('/hub/apply'),
        })),
        ...media.map((m) => ({
          id: `media-${m.id}`,
          type: 'media' as const,
          description: `File uploaded: ${m.name}`,
          detail: m.name,
          createdAt: m.createdAt,
          link: getHubPath('/hub/media'),
        })),
        ...admins.map((a) => ({
          id: `admin-${a.id}`,
          type: 'admin' as const,
          description: `Admin added: ${a.email}`,
          detail: a.email,
          createdAt: a.createdAt,
          link: getHubPath('/hub/admins'),
        })),
      ];

      const filtered = activities
        .filter((a) => new Date(a.createdAt) >= cutoff)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setItems(filtered);
    } catch (e) {
      setError(e instanceof Error && e.message === 'UNAUTHORIZED' ? "You don't have access." : 'Failed to load activity.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [getToken, daysFilter]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  const filteredItems = useMemo(() => {
    if (typeFilter === 'all') return items;
    return items.filter((i) => i.type === typeFilter);
  }, [items, typeFilter]);

  function exportCsv() {
    if (filteredItems.length === 0) return;
    const header = ['Date', 'Type', 'Description'];
    const rows = filteredItems.map((i) => [
      new Date(i.createdAt).toISOString(),
      i.type,
      i.description,
    ]);
    const csv = [header, ...rows]
      .map((cols) =>
        cols
          .map((c) => {
            const val = String(c ?? '');
            const needsQuote = /[",\n]/.test(val);
            return needsQuote ? `"${val.replace(/"/g, '""')}"` : val;
          })
          .join(','),
      )
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exale-activity-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const typeLabels: Record<ActivityType | 'all', string> = {
    all: 'All',
    contact: 'Contacts',
    application: 'Applications',
    media: 'Media',
    admin: 'Admins',
  };

  const typeColors: Record<ActivityType, string> = {
    contact: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    application: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    media: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    admin: 'bg-royal-violet/10 text-royal-violet dark:bg-royal-violet/20 dark:text-royal-violet',
  };

  if (loading) {
    return (
      <div className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-royal-violet rounded-full animate-spin" />
        <span>Loading activity...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Activity Log</h1>
          <p className="text-gray-600 dark:text-gray-400">Track changes and actions in the dashboard</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
        <button
          onClick={fetchActivity}
          className="px-4 py-2 bg-royal-violet text-white rounded-lg text-sm font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Activity Log</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Track changes and actions in the dashboard</p>
        </div>
        <button
          onClick={exportCsv}
          disabled={filteredItems.length === 0}
          className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 text-sm font-medium"
        >
          Export CSV
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(['all', 'contact', 'application', 'media', 'admin'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              typeFilter === t
                ? 'bg-royal-violet text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {typeLabels[t]}
          </button>
        ))}
        <select
          value={daysFilter}
          onChange={(e) => setDaysFilter(Number(e.target.value))}
          className="w-full sm:w-auto sm:ml-auto px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={365}>Last year</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
        {filteredItems.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
            No activity in the selected period.
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <span
                  className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full shrink-0 ${
                    typeColors[item.type]
                  }`}
                >
                  {typeLabels[item.type]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{item.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
                {item.link && (
                  <Link
                    href={item.link}
                    className="shrink-0 text-sm text-royal-violet hover:underline font-medium self-start sm:self-center"
                  >
                    View
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
