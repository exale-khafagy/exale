'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api-auth';
import { useHubPath } from '@/lib/useHubPath';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

interface Stats {
  contactTotal: number;
  contactNew: number;
  applicationsTotal: number;
  applicationsNew: number;
}

export default function HubPage() {
  const { getToken } = useAuth();
  const inboxPath = useHubPath('/hub/inbox');
  const applyPath = useHubPath('/hub/apply');
  const cmsPath = useHubPath('/hub/cms');
  const adminsPath = useHubPath('/hub/admins');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        // Fetch both contact and application submissions
        const [contacts, applications] = await Promise.all([
          apiGet<Array<{ status: string }>>('/contact', token).catch(() => []),
          apiGet<Array<{ status: string }>>('/apply', token).catch(() => []),
        ]);

        setStats({
          contactTotal: contacts.length,
          contactNew: contacts.filter((c) => c.status === 'NEW').length,
          applicationsTotal: applications.length,
          applicationsNew: applications.filter((a) => a.status === 'NEW').length,
        });
        setError(null);
      } catch (e) {
        setError(e instanceof Error && e.message === 'UNAUTHORIZED' ? "You don't have access." : 'Failed to load stats.');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [getToken]);

  if (loading) {
    return (
      <div className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-royal-violet rounded-full animate-spin" />
        <span>Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h2 className="text-red-600 dark:text-red-400 font-semibold mb-2">Failed to load dashboard</h2>
          <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">{error}</p>
          {error !== "You don't have access." && (
            <div className="text-gray-600 dark:text-gray-400 text-xs space-y-1">
              <p>• Make sure the API server is running at {API_URL}</p>
              <p>• Check your browser console for detailed errors</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard Overview</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's what's happening with your website.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link
          href={inboxPath}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg hover:border-royal-violet/50 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Contact Submissions
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                New vs total this week
              </p>
            </div>
            {stats && stats.contactNew > 0 && (
              <span className="bg-royal-violet text-white text-xs font-bold px-2 py-1 rounded-full">
                {stats.contactNew} new
              </span>
            )}
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats?.contactTotal ?? 0}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                Total submissions
              </p>
            </div>
            <div className="flex items-end gap-0.5 h-12">
              {[0.2, 0.5, 0.8, 0.4, 0.9].map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 rounded-t-full bg-royal-violet/30 dark:bg-royal-violet/40"
                  style={{ height: `${h * 100}%` }}
                />
              ))}
            </div>
          </div>
        </Link>

        <Link
          href={applyPath}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg hover:border-royal-violet/50 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Applications
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                Pipeline at a glance
              </p>
            </div>
            {stats && stats.applicationsNew > 0 && (
              <span className="bg-royal-violet text-white text-xs font-bold px-2 py-1 rounded-full">
                {stats.applicationsNew} new
              </span>
            )}
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats?.applicationsTotal ?? 0}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                Total applications
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 text-emerald-700 dark:text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Healthy
              </span>
            </div>
          </div>
        </Link>

        <Link
          href={cmsPath}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg hover:border-royal-violet/50 transition-all"
        >
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">Content Management</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">—</p>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Edit website content</p>
        </Link>

        <Link
          href={adminsPath}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg hover:border-royal-violet/50 transition-all"
        >
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">Admin Users</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">—</p>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Manage access</p>
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Link
            href={inboxPath}
            className="px-4 py-2 bg-royal-violet text-white rounded-lg text-sm font-medium hover:bg-royal-violet/90 transition-colors"
          >
            View Contact Submissions
          </Link>
          <Link
            href={applyPath}
            className="px-4 py-2 bg-royal-violet text-white rounded-lg text-sm font-medium hover:bg-royal-violet/90 transition-colors"
          >
            View Applications
          </Link>
          <Link
            href={cmsPath}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Edit Content
          </Link>
          <Link
            href={SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            View Website
          </Link>
        </div>
      </div>
    </div>
  );
}
