'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useMemo, useState } from 'react';
import { apiGet, apiPatch, apiDelete } from '@/lib/api-auth';

interface ApplicationSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  industry: string;
  message: string;
  fileUrl: string | null;
  status: 'NEW' | 'READ' | string;
  createdAt: string;
}

interface Profile {
  companyName: string | null;
  linkedInUrl: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
}

export default function InboxApplyPage() {
  const { getToken } = useAuth();
  const [submissions, setSubmissions] = useState<ApplicationSubmission[]>([]);
  const [selected, setSelected] = useState<ApplicationSubmission | null>(null);
  const [matchingProfile, setMatchingProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NEW' | 'READ'>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const token = await getToken();
      if (!token) return;
      try {
        const data = await apiGet<ApplicationSubmission[] | unknown>('/apply', token);
        setSubmissions(Array.isArray(data) ? data : []);
        setError(null);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to load.';
        setError(
          msg === 'UNAUTHORIZED'
            ? "You don't have access."
            : msg.startsWith('Failed to fetch')
              ? 'Something went wrong. Please try again.'
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

  function clearActionFeedback() {
    setActionError(null);
    setActionMessage(null);
  }

  async function updateStatus(id: string, status: 'NEW' | 'READ') {
    const token = await getToken();
    if (!token) return;
    clearActionFeedback();
    try {
      const res = await apiPatch(`/apply/${id}`, token, { status });
      if (res.ok) {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status } : s)),
        );
        if (selected?.id === id) {
          setSelected({ ...selected, status });
        }
      } else {
        setActionError('Failed to update status');
      }
    } catch {
      setActionError('Failed to update status');
    }
  }

  const filteredSubmissions = useMemo(() => {
    const list = Array.isArray(submissions) ? submissions : [];
    const term = search.trim().toLowerCase();
    return list.filter((s) => {
      const normalizedStatus =
        s.status === 'NEW' || s.status === 'READ' ? s.status : 'NEW';
      const matchesStatus =
        statusFilter === 'ALL' ? true : normalizedStatus === statusFilter;
      const matchesSearch =
        !term ||
        s.name.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term) ||
        s.phone.toLowerCase().includes(term) ||
        s.industry.toLowerCase().includes(term);
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
    clearActionFeedback();
    try {
      const results = await Promise.all(
        selectedIds.map((id) =>
          apiPatch(`/apply/${id}`, token, { status: target }).then((r) => ({ id, ok: r.ok })),
        ),
      );
      const failed = results.filter((r) => !r.ok).length;
      if (failed > 0) {
        setActionError(failed === selectedIds.length ? 'Failed to update' : `Failed to update ${failed} of ${selectedIds.length}`);
      } else {
        setSubmissions((prev) =>
          prev.map((s) => (selectedIds.includes(s.id) ? { ...s, status: target } : s)),
        );
        if (selected && selectedIds.includes(selected.id)) {
          setSelected({ ...selected, status: target });
        }
        setActionMessage(`Marked as ${target.toLowerCase()}`);
        setTimeout(clearActionFeedback, 3000);
      }
    } catch {
      setActionError('Failed to update. Check your connection.');
    }
  }

  async function bulkDelete() {
    const token = await getToken();
    if (!token || selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} application(s)? This cannot be undone.`)) return;
    clearActionFeedback();
    try {
      const results = await Promise.all(
        selectedIds.map((id) =>
          apiDelete(`/apply/${id}`, token).then((r) => ({ id, ok: r.ok })),
        ),
      );
      const failed = results.filter((r) => !r.ok).length;
      if (failed > 0) {
        setActionError(failed === selectedIds.length ? 'Failed to delete' : `Failed to delete ${failed} of ${selectedIds.length}`);
      } else {
        const okIds = results.filter((r) => r.ok).map((r) => r.id);
        setSubmissions((prev) => prev.filter((s) => !okIds.includes(s.id)));
        if (selected && okIds.includes(selected.id)) setSelected(null);
        setSelectedIds((prev) => prev.filter((id) => !okIds.includes(id)));
        setActionMessage('Deleted');
        setTimeout(clearActionFeedback, 3000);
      }
    } catch {
      setActionError('Failed to delete. Check your connection.');
    }
  }

  function exportCsv() {
    if (filteredSubmissions.length === 0) return;
    const header = [
      'Date',
      'Name',
      'Email',
      'Phone',
      'Industry',
      'Message',
      'Status',
      'Attachment',
    ];
    const rows = filteredSubmissions.map((s) => [
      new Date(s.createdAt).toISOString(),
      s.name,
      s.email,
      s.phone,
      s.industry,
      s.message.replace(/\r?\n/g, ' '),
      s.status,
      s.fileUrl ?? '',
    ]);
    const csv = [header, ...rows]
      .map((cols) =>
        cols
          .map((c) => {
            const val = c ?? '';
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
    a.download = `exale-applications-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-royal-violet rounded-full animate-spin" />
        <span>Loading applications...</span>
      </div>
    );
  }

  if (error) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
    return (
      <div className="space-y-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h2 className="text-red-600 dark:text-red-400 font-semibold mb-2">
            Failed to load applications
          </h2>
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
              const data = await apiGet<ApplicationSubmission[] | unknown>('/apply', token);
              setSubmissions(Array.isArray(data) ? data : []);
              setError(null);
            } catch (e) {
              const msg = e instanceof Error ? e.message : 'Failed to load.';
              setError(
                msg === 'UNAUTHORIZED'
                  ? "You don't have access."
                  : msg.startsWith('Failed to fetch')
                    ? 'Something went wrong. Please try again.'
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Applications
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage job and partnership applications
        </p>
      </div>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Search name, email, phone, industry..."
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
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {(actionMessage || actionError) && (
            <span
              className={
                actionError
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-green-600 dark:text-green-400'
              }
            >
              {actionError || actionMessage}
            </span>
          )}
          {selectedIds.length > 0 && (
            <>
              <span className="text-gray-600 dark:text-gray-400">
                {selectedIds.length} selected
              </span>
              <button
                type="button"
                onClick={() => bulkUpdateStatus('READ')}
                className="px-3 py-1 rounded-lg bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 hover:opacity-90"
              >
                Mark read
              </button>
              <button
                type="button"
                onClick={() => bulkUpdateStatus('NEW')}
                className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Mark new
              </button>
              <button
                type="button"
                onClick={bulkDelete}
                className="px-3 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => { setSelectedIds([]); clearActionFeedback(); }}
                className="px-3 py-1 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Clear selection
              </button>
            </>
          )}
          <button
            type="button"
            onClick={exportCsv}
            className="ml-auto px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Download CSV
          </button>
        </div>
      </div>
      {/* Application list (same card layout on all screen sizes so desktop and mobile stay in sync) */}
      {filteredSubmissions.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={toggleSelectAllVisible}
              className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-royal-violet focus:ring-royal-violet/50"
            />
            Select all visible
          </label>
        </div>
      )}
      <div className="space-y-3">
        {filteredSubmissions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center">
            <div className="flex flex-col items-center gap-4 text-gray-500 dark:text-gray-400">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center opacity-60">
                <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p>No applications yet.</p>
            </div>
          </div>
        ) : (
          filteredSubmissions.map((s) => (
            <div
              key={s.id}
              onClick={() => setSelected(s)}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 active:bg-gray-50 dark:active:bg-gray-700/50 cursor-pointer transition-colors"
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
                        (s.status === 'NEW' || !s.status)
                          ? 'bg-royal-violet/10 text-royal-violet dark:bg-royal-violet/20 dark:text-royal-violet'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {s.status || 'NEW'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{s.industry}</p>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </p>
                    {s.fileUrl && (
                      <a
                        href={s.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-royal-violet hover:underline font-medium"
                      >
                        Download
                      </a>
                    )}
                  </div>
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
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {selected.name}
            </h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">
                  Email
                </dt>
                <dd className="text-gray-900 dark:text-white">{selected.email}</dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">
                  Phone
                </dt>
                <dd className="text-gray-900 dark:text-white">{selected.phone}</dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">
                  Industry
                </dt>
                <dd className="text-gray-900 dark:text-white">{selected.industry}</dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">
                  Message
                </dt>
                <dd className="text-gray-900 dark:text-white whitespace-pre-wrap">
                  {selected.message}
                </dd>
              </div>
              {matchingProfile && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <dt className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-2">
                    Member profile
                  </dt>
                  <dd className="space-y-1 text-sm">
                    {matchingProfile.companyName && (
                      <p className="text-gray-900 dark:text-white">
                        <span className="text-gray-500 dark:text-gray-400">
                          Company:
                        </span>{' '}
                        {matchingProfile.companyName}
                      </p>
                    )}
                    {matchingProfile.linkedInUrl && (
                      <a
                        href={matchingProfile.linkedInUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-royal-violet hover:underline block"
                      >
                        LinkedIn
                      </a>
                    )}
                    {matchingProfile.twitterUrl && (
                      <a
                        href={matchingProfile.twitterUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-royal-violet hover:underline block"
                      >
                        Twitter
                      </a>
                    )}
                    {matchingProfile.instagramUrl && (
                      <a
                        href={matchingProfile.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-royal-violet hover:underline block"
                      >
                        Instagram
                      </a>
                    )}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">
                  Attachment
                </dt>
                <dd>
                  {selected.fileUrl ? (
                    <a
                      href={selected.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-royal-violet hover:underline font-medium"
                    >
                      Download file
                    </a>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">None</span>
                  )}
                </dd>
              </div>
            </dl>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() =>
                  updateStatus(
                    selected.id,
                    (selected.status === 'READ' ? 'NEW' : 'READ') as 'NEW' | 'READ',
                  )
                }
                className="px-4 py-2 bg-royal-violet text-white rounded-lg text-sm font-medium hover:bg-royal-violet/90 transition-colors"
              >
                Mark {selected.status === 'READ' ? 'New' : 'Read'}
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
