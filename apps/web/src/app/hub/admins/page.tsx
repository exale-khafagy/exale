'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api-auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
const FOUNDER_EMAIL = 'khafagy.ahmedibrahim@gmail.com';

interface Admin {
  id: string;
  clerkId: string;
  email: string;
  createdAt: string;
}

export default function AdminsPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [email, setEmail] = useState('');
  const [clerkId, setClerkId] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    async function load() {
      const token = await getToken();
      if (!token) return;
      try {
        const data = await apiGet<Admin[]>('/admin', token);
        setAdmins(data);
      } catch {
        setAdmins([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [getToken]);

  async function handleSearchEmail() {
    if (!email.trim()) {
      setMessage('Please enter an email');
      return;
    }
    setSearching(true);
    setMessage(null);
    const token = await getToken();
    if (!token) return;
    try {
      const profile = await apiGet<{ clerkId: string; email: string } | null>(
        `/profile/by-email/${encodeURIComponent(email.trim())}`,
        token,
      );
      if (profile) {
        setClerkId(profile.clerkId);
        setMessage('Profile found! Clerk ID filled automatically.');
      } else {
        setMessage('No profile found with this email. User must sign in first to create their profile.');
        setClerkId('');
      }
    } catch {
      setMessage('Failed to search. User may need to sign in first.');
      setClerkId('');
    } finally {
      setSearching(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !clerkId.trim()) {
      setMessage('Email and Clerk ID are required');
      return;
    }
    const token = await getToken();
    if (!token) return;
    setAdding(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_URL}/admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: email.trim(), clerkId: clerkId.trim() }),
      });
      if (res.status === 401) {
        setMessage('Unauthorized');
        return;
      }
      if (!res.ok) {
        const err = await res.json();
        setMessage(err.message || 'Failed to add admin');
        return;
      }
      const newAdmin = await res.json();
      setAdmins([...admins, newAdmin]);
      setEmail('');
      setClerkId('');
      setMessage('Admin added successfully');
    } catch {
      setMessage('Failed to add admin');
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(clerkIdToRemove: string) {
    if (!confirm('Remove this admin?')) return;
    const token = await getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/admin/${clerkIdToRemove}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setAdmins(admins.filter((a) => a.clerkId !== clerkIdToRemove));
        setMessage('Admin removed');
      } else {
        setMessage('Failed to remove admin');
      }
    } catch {
      setMessage('Failed to remove admin');
    }
  }

  if (loading) {
    return (
      <div className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-royal-violet rounded-full animate-spin" />
        <span>Loading admins...</span>
      </div>
    );
  }

  const isFounder = user?.primaryEmailAddress?.emailAddress?.toLowerCase() === FOUNDER_EMAIL.toLowerCase();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Management</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Control who can access and manage the Exale dashboard.
        </p>
      </div>

      <div className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Admin</h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          To add an admin, the user must first sign in to create their profile. Then you can add them here using their Clerk ID and email.
        </p>
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-royal-violet/40"
              />
              <button
                type="button"
                onClick={handleSearchEmail}
                disabled={searching || !email.trim()}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-900 dark:text-white rounded-lg text-sm font-medium transition-colors"
              >
                {searching ? 'Searching...' : 'Find'}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Clerk ID</label>
            <input
              type="text"
              value={clerkId}
              onChange={(e) => setClerkId(e.target.value)}
              placeholder="user_xxxxx (auto-filled when email is found)"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-royal-violet/40"
            />
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
              Click "Find" to auto-fill from email, or enter manually
            </p>
          </div>
          {message && (
            <p
              className={`text-sm ${
                message.includes('success') || message.includes('removed')
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={adding}
            className="px-6 py-2 bg-royal-violet hover:bg-royal-violet/90 disabled:opacity-50 text-white font-medium rounded-lg shadow-sm"
          >
            {adding ? 'Adding...' : 'Add Admin'}
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Clerk ID</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Added</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {admins.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                  No admins yet.
                </td>
              </tr>
            ) : (
              admins.map((admin) => {
                const isFounderAdmin = admin.email.toLowerCase() === FOUNDER_EMAIL.toLowerCase();
                return (
                  <tr key={admin.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {admin.email}
                      {isFounderAdmin && (
                        <span className="ml-2 text-xs text-royal-violet font-semibold">(Founder)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-700 dark:text-gray-300">
                      {admin.clerkId}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {!isFounderAdmin && (
                        <button
                          onClick={() => handleRemove(admin.clerkId)}
                          className="px-3 py-1 text-xs bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
