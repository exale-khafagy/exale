'use client';

import { useAuth } from '@clerk/nextjs';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { apiGet } from '@/lib/api-auth';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  concern: string;
  message: string;
  status: 'NEW' | 'READ';
  createdAt: string;
}

interface Profile {
  companyName: string | null;
  linkedInUrl: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
}

export default function InboxContactPage() {
  const { getToken } = useAuth();
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [selected, setSelected] = useState<ContactSubmission | null>(null);
  const [matchingProfile, setMatchingProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NEW' | 'READ'>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      const token = await getToken();
      if (!token) return;
      try {
        const data = await apiGet<ContactSubmission[]>('/contact', token);
        setSubmissions(data);
        setError(null);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to load.';
        setError(
          msg === 'UNAUTHORIZED'
            ? "You don't have access."
            : msg.startsWith('Failed to fetch')
              ? `API error: ${msg}`
              : msg,
        );
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [getToken]);

  useEffect(() => {
    if (!selected?.email) {
      setMatchingProfile(null);
      return;
    }
    async function fetchProfile() {
      const token = await getToken();
      if (!token) return;
      try {
        const p = await apiGet<Profile | null>(
          `/profile/by-email/${encodeURIComponent(selected!.email)}`,
          token,
        );
        setMatchingProfile(p);
      } catch {
        setMatchingProfile(null);
      }
    }
    fetchProfile();
  }, [selected?.email, getToken]);

  async function markRead(id: string, status: 'NEW' | 'READ') {
    const token = await getToken();
    if (!token) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/contact/${id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          credentials: 'include',
          body: JSON.stringify({ status: status === 'NEW' ? 'READ' : 'NEW' }),
        },
      );
      if (res.ok) {
        setSubmissions((prev) =>
          prev.map((s) =>
            s.id === id ? { ...s, status: s.status === 'NEW' ? 'READ' : 'NEW' } : s,
          ),
        );
        if (selected?.id === id)
          setSelected({ ...selected, status: selected.status === 'NEW' ? 'READ' : 'NEW' });
      }
    } catch {}
  }

  const filteredSubmissions = useMemo(() => {
    const term = search.trim().toLowerCase();
    return submissions.filter((s) => {
      const matchesStatus =
        statusFilter === 'ALL' ? true : s.status === statusFilter;
      const matchesSearch =
        !term ||
        s.name.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term) ||
        s.phone.toLowerCase().includes(term) ||
        s.concern.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [submissions, search, statusFilter]);

  const allVisibleSelected =
    filteredSubmissions.length > 0 &&
    filteredSubmissions.every((s) => selectedIds.includes(s.id));

  function toggleSelectAllVisible() {
    if (allVisibleSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !filteredSubmissions.some((s) => s.id === id)),
      );
    } else {
      setSelectedIds((prev) => [
        ...prev,
        ...filteredSubmissions
          .map((s) => s.id)
          .filter((id) => !prev.includes(id)),
      ]);
    }
  }

  function toggleRowSelected(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function bulkUpdateStatus(target: 'NEW' | 'READ') {
    const token = await getToken();
    if (!token || selectedIds.length === 0) return;
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/contact/${id}`,
            {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              credentials: 'include',
              body: JSON.stringify({ status: target }),
            },
          ),
        ),
      );
      setSubmissions((prev) =>
        prev.map((s) =>
          selectedIds.includes(s.id) ? { ...s, status: target } : s,
        ),
      );
      if (selected && selectedIds.includes(selected.id)) {
        setSelected({ ...selected, status: target });
      }
    } catch {
      // swallow, UI already optimistic
    }
  }

  function exportCsv() {
    if (filteredSubmissions.length === 0) return;
    const header = [
      'Date',
      'Name',
      'Email',
      'Phone',
      'Concern',
      'Message',
      'Status',
    ];
    const rows = filteredSubmissions.map((s) => [
      new Date(s.createdAt).toISOString(),
      s.name,
      s.email,
      s.phone,
      s.concern,
      s.message.replace(/\r?\n/g, ' '),
      s.status,
    ]);
    const csv =
      [header, ...rows]
        .map((cols) =>
          cols
            .map((c) => {
              const val = c ?? '';
              const needsQuote = /[",\n]/.test(val);
              return needsQuote
                ? `"${val.replace(/"/g, '""')}"`
                : val;
            })
            .join(','),
        )
        .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exale-contact-inbox-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-royal-violet rounded-full animate-spin" />
        <span>Loading submissions...</span>
      </div>
    );
  }
  
  if (error) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
    return (
      <div className="space-y-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h2 className="text-red-600 dark:text-red-400 font-semibold mb-2">Failed to load submissions</h2>
          <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">{error}</p>
          {error === "You don't have access." && (
            <p className="text-gray-600 dark:text-gray-400 text-xs mt-2">
              Site owner? Add your Clerk user as an admin: in <code className="bg-black/10 dark:bg-white/10 px-1 rounded">apps/api</code> run <code className="bg-black/10 dark:bg-white/10 px-1 rounded">npm run db:add-admin &lt;clerk-user-id&gt; &lt;email&gt;</code> (see DEPLOY_STEPS.md).
            </p>
          )}
          {error !== "You don't have access." && (
            <div className="text-gray-600 dark:text-gray-400 text-xs space-y-1">
              <p>• Make sure the API server is running at {API_URL}</p>
              <p>• Check your browser console for detailed errors</p>
              <p>• Verify your authentication token is valid</p>
            </div>
          )}
        </div>
        <button
          onClick={async () => {
            setLoading(true);
            setError(null);
            const token = await getToken();
            if (!token) return;
            try {
              const data = await apiGet<ContactSubmission[]>('/contact', token);
              setSubmissions(data);
              setError(null);
            } catch (e) {
              const msg = e instanceof Error ? e.message : 'Failed to load.';
              setError(
                msg === 'UNAUTHORIZED'
                  ? "You don't have access."
                  : msg.startsWith('Failed to fetch')
                    ? `API error: ${msg}`
                    : msg,
              );
            } finally {
              setLoading(false);
            }
          }}
          className="px-4 py-2 bg-royal-violet hover:bg-royal-violet/90 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Contact Inbox</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage contact form submissions</p>
      </div>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Search by name, email, phone, concern..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 max-w-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-royal-violet/50"
          />
          <div className="flex items-center gap-1 text-xs">
            {(['ALL', 'NEW', 'READ'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-2.5 py-1 rounded-full font-medium ${
                  statusFilter === f
                    ? 'bg-royal-violet text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                {f === 'ALL' ? 'All' : f === 'NEW' ? 'New' : 'Read'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {selectedIds.length > 0 && (
            <>
              <span className="text-gray-600 dark:text-gray-400">
                {selectedIds.length} selected
              </span>
              <button
                onClick={() => bulkUpdateStatus('READ')}
                className="px-3 py-1 rounded-lg bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 hover:opacity-90"
              >
                Mark read
              </button>
              <button
                onClick={() => bulkUpdateStatus('NEW')}
                className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Mark new
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-3 py-1 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Clear
              </button>
            </>
          )}
          <button
            onClick={exportCsv}
            className="ml-auto px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Download CSV
          </button>
        </div>
      </div>
      {/* Desktop table */}
      <div className="hidden md:block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAllVisible}
                  className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-royal-violet focus:ring-royal-violet/50"
                />
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Concern
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredSubmissions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-4 text-gray-500 dark:text-gray-400">
                    <Image
                      src="/images/empty-tickets.png"
                      alt="No submissions"
                      width={120}
                      height={80}
                      className="opacity-40"
                    />
                    <p>No submissions yet.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredSubmissions.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => setSelected(s)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(s.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleRowSelected(s.id);
                      }}
                      className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-royal-violet focus:ring-royal-violet/50"
                    />
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {s.name}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {s.concern}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                        s.status === 'NEW' 
                          ? 'bg-royal-violet/10 text-royal-violet dark:bg-royal-violet/20 dark:text-royal-violet' 
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {filteredSubmissions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center">
            <div className="flex flex-col items-center gap-4 text-gray-500 dark:text-gray-400">
              <Image
                src="/images/empty-tickets.png"
                alt="No submissions"
                width={120}
                height={80}
                className="opacity-40"
              />
              <p>No submissions yet.</p>
            </div>
          </div>
        ) : (
          filteredSubmissions.map((s) => (
            <div
              key={s.id}
              onClick={() => setSelected(s)}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm active:bg-gray-50 dark:active:bg-gray-700/50 cursor-pointer transition-colors"
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(s.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleRowSelected(s.id);
                  }}
                  className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 dark:border-gray-600 text-royal-violet focus:ring-royal-violet/50"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{s.name}</p>
                    <span
                      className={`shrink-0 inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                        s.status === 'NEW'
                          ? 'bg-royal-violet/10 text-royal-violet dark:bg-royal-violet/20 dark:text-royal-violet'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{s.concern}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selected && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 max-w-lg w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{selected.name}</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">Email</dt>
                <dd className="text-gray-900 dark:text-white">{selected.email}</dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">Phone</dt>
                <dd className="text-gray-900 dark:text-white">{selected.phone}</dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">Concern</dt>
                <dd className="text-gray-900 dark:text-white">{selected.concern}</dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">Message</dt>
                <dd className="text-gray-900 dark:text-white whitespace-pre-wrap">{selected.message}</dd>
              </div>
              {matchingProfile && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <dt className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-2">Member profile</dt>
                  <dd className="space-y-1 text-sm">
                    {matchingProfile.companyName && (
                      <p className="text-gray-900 dark:text-white"><span className="text-gray-500 dark:text-gray-400">Company:</span> {matchingProfile.companyName}</p>
                    )}
                    {matchingProfile.linkedInUrl && (
                      <a href={matchingProfile.linkedInUrl} target="_blank" rel="noopener noreferrer" className="text-royal-violet hover:underline block">LinkedIn</a>
                    )}
                    {matchingProfile.twitterUrl && (
                      <a href={matchingProfile.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-royal-violet hover:underline block">Twitter</a>
                    )}
                    {matchingProfile.instagramUrl && (
                      <a href={matchingProfile.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-royal-violet hover:underline block">Instagram</a>
                    )}
                  </dd>
                </div>
              )}
            </dl>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => markRead(selected.id, selected.status)}
                className="px-4 py-2 bg-royal-violet text-white rounded-lg text-sm font-medium hover:bg-royal-violet/90 transition-colors"
              >
                Mark {selected.status === 'NEW' ? 'Read' : 'New'}
              </button>
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
