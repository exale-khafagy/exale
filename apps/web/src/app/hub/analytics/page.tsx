'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api-auth';

interface AnalyticsData {
  formStats: {
    contactTotal: number;
    contactNew: number;
    contactByConcern: Record<string, number>;
    applicationsTotal: number;
    applicationsNew: number;
    applicationsByIndustry: Record<string, number>;
    conversionRate: number;
  };
  timeRange: {
    start: string;
    end: string;
  };
}

export default function AnalyticsPage() {
  const { getToken } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    async function fetchAnalytics() {
      const token = await getToken();
      if (!token) return;
      try {
        // Fetch contact and application submissions
        const [contacts, applications] = await Promise.all([
          apiGet<Array<{ concern: string; status: string; createdAt: string }>>('/contact', token).catch(() => []),
          apiGet<Array<{ industry: string; status: string; createdAt: string }>>('/apply', token).catch(() => []),
        ]);

        const now = new Date();
        const ranges: Record<string, number> = {
          '7d': 7,
          '30d': 30,
          '90d': 90,
          'all': Infinity,
        };
        const days = ranges[timeRange];
        const cutoff = days === Infinity ? new Date(0) : new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

        const filteredContacts = contacts.filter((c) => new Date(c.createdAt) >= cutoff);
        const filteredApplications = applications.filter((a) => new Date(a.createdAt) >= cutoff);

        // Calculate concern distribution
        const concernCounts: Record<string, number> = {};
        filteredContacts.forEach((c) => {
          concernCounts[c.concern] = (concernCounts[c.concern] || 0) + 1;
        });

        // Calculate industry distribution
        const industryCounts: Record<string, number> = {};
        filteredApplications.forEach((a) => {
          industryCounts[a.industry] = (industryCounts[a.industry] || 0) + 1;
        });

        // Calculate conversion rate (simplified: applications / contacts)
        const conversionRate =
          filteredContacts.length > 0
            ? (filteredApplications.length / filteredContacts.length) * 100
            : 0;

        setData({
          formStats: {
            contactTotal: filteredContacts.length,
            contactNew: filteredContacts.filter((c) => c.status === 'NEW').length,
            contactByConcern: concernCounts,
            applicationsTotal: filteredApplications.length,
            applicationsNew: filteredApplications.filter((a) => a.status === 'NEW').length,
            applicationsByIndustry: industryCounts,
            conversionRate,
          },
          timeRange: {
            start: cutoff.toISOString(),
            end: now.toISOString(),
          },
        });
        setError(null);
      } catch (e) {
        setError(
          e instanceof Error && e.message === 'UNAUTHORIZED'
            ? "You don't have access."
            : 'Failed to load analytics.',
        );
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [getToken, timeRange]);

  if (loading) {
    return (
      <div className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-royal-violet rounded-full animate-spin" />
        <span>Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
    return (
      <div className="space-y-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h2 className="text-red-600 dark:text-red-400 font-semibold mb-2">Failed to load analytics</h2>
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

  if (!data) return null;

  const topConcerns = Object.entries(data.formStats.contactByConcern)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  const topIndustries = Object.entries(data.formStats.applicationsByIndustry)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Track website performance and form submissions</p>
        </div>
        <div className="flex items-center gap-2">
          {(['7d', '30d', '90d', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-royal-violet text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {range === 'all' ? 'All Time' : range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">Contact Submissions</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{data.formStats.contactTotal}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {data.formStats.contactNew} new
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">Applications</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{data.formStats.applicationsTotal}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {data.formStats.applicationsNew} new
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">Conversion Rate</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {data.formStats.conversionRate.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Contacts → Applications</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">Total Submissions</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {data.formStats.contactTotal + data.formStats.applicationsTotal}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">All forms</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Contact Concerns</h2>
          {topConcerns.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No data available</p>
          ) : (
            <div className="space-y-3">
              {topConcerns.map(([concern, count]) => {
                const maxCount = Math.max(...topConcerns.map(([, c]) => c));
                const percentage = (count / maxCount) * 100;
                return (
                  <div key={concern}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{concern}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{count}</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-royal-violet h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Application Industries</h2>
          {topIndustries.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No data available</p>
          ) : (
            <div className="space-y-3">
              {topIndustries.map(([industry, count]) => {
                const maxCount = Math.max(...topIndustries.map(([, c]) => c));
                const percentage = (count / maxCount) * 100;
                return (
                  <div key={industry}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{industry}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{count}</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-royal-violet h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <p className="text-blue-600 dark:text-blue-400 text-sm">
          <strong>Note:</strong> This dashboard shows form submission analytics. To view website traffic metrics (page
          views, sessions, etc.), integrate Google Analytics Reporting API or use a third-party analytics service.
        </p>
      </div>
    </div>
  );
}
