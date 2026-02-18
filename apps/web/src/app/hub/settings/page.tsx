'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api-auth';

interface Settings {
  id: string;
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  notifyEmail: string;
  googleAnalyticsId: string | null;
  timezone: string;
}

export default function SettingsPage() {
  const { getToken } = useAuth();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      const token = await getToken();
      if (!token) return;
      try {
        const data = await apiGet<Settings>('/settings', token);
        setSettings(data);
        setError(null);
      } catch (e) {
        setError(
          e instanceof Error && e.message === 'UNAUTHORIZED'
            ? "You don't have access."
            : 'Failed to load settings.',
        );
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, [getToken]);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form || !settings) return;

    const token = await getToken();
    if (!token) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData(form);
      const updates: Partial<Settings> = {
        siteName: formData.get('siteName') as string,
        siteDescription: formData.get('siteDescription') as string,
        contactEmail: formData.get('contactEmail') as string,
        notifyEmail: formData.get('notifyEmail') as string,
        googleAnalyticsId: formData.get('googleAnalyticsId') as string || null,
        timezone: formData.get('timezone') as string,
      };

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
      const res = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        throw new Error('Failed to save settings');
      }

      const updated = await res.json();
      setSettings(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-royal-violet rounded-full animate-spin" />
        <span>Loading settings...</span>
      </div>
    );
  }

  if (error && !settings) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
    return (
      <div className="space-y-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h2 className="text-red-600 dark:text-red-400 font-semibold mb-2">Failed to load settings</h2>
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage website-wide settings and configurations</p>
      </div>

      {success && (
        <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-green-600 dark:text-green-400 text-sm font-medium">Settings saved successfully!</p>
        </div>
      )}

      {error && settings && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">General Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Site Name
              </label>
              <input
                type="text"
                name="siteName"
                defaultValue={settings?.siteName || ''}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-royal-violet/40"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Site Description
              </label>
              <textarea
                name="siteDescription"
                defaultValue={settings?.siteDescription || ''}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-royal-violet/40"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Timezone
              </label>
              <select
                name="timezone"
                defaultValue={settings?.timezone || 'UTC'}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-royal-violet/40"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Paris">Paris (CET)</option>
                <option value="Asia/Dubai">Dubai (GST)</option>
                <option value="Africa/Cairo">Cairo (EET)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Email Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                name="contactEmail"
                defaultValue={settings?.contactEmail || ''}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-royal-violet/40"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Email address shown to users for contact inquiries
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notification Email
              </label>
              <input
                type="email"
                name="notifyEmail"
                defaultValue={settings?.notifyEmail || ''}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-royal-violet/40"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Email address that receives notifications for new submissions
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Integrations</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Google Analytics Measurement ID
              </label>
              <input
                type="text"
                name="googleAnalyticsId"
                defaultValue={settings?.googleAnalyticsId || ''}
                placeholder="G-XXXXXXXXXX"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-royal-violet/40"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Your GA4 Measurement ID (e.g., G-XXXXXXXXXX). Leave empty to disable analytics.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-royal-violet hover:bg-royal-violet/90 disabled:opacity-50 text-white font-medium rounded-lg shadow-sm transition-colors"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
