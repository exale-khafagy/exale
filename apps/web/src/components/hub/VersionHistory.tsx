'use client';

import { useState } from 'react';
import { apiGet, apiPost } from '@/lib/api-auth';

export interface ContentVersion {
  id: string;
  blockKey: string;
  value: string;
  createdAt: string;
}

interface VersionHistoryProps {
  blockKey: string;
  getToken: () => Promise<string | null>;
  onRollback: (blockKey: string) => void;
}

function truncate(value: string, maxLen: number): string {
  const stripped = value.replace(/<[^>]+>/g, '').trim();
  if (stripped.length <= maxLen) return stripped;
  return stripped.slice(0, maxLen) + '…';
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

export function VersionHistory({ blockKey, getToken, onRollback }: VersionHistoryProps) {
  const [open, setOpen] = useState(false);
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [rollingBack, setRollingBack] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadVersions() {
    const token = await getToken();
    if (!token) {
      setError('Not signed in');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<ContentVersion[]>(`/content/${encodeURIComponent(blockKey)}/versions`, token);
      setVersions(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load versions');
      setVersions([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleRollback(versionId: string) {
    const token = await getToken();
    if (!token) return;
    setRollingBack(versionId);
    setError(null);
    try {
      const res = await apiPost(`/content/${encodeURIComponent(blockKey)}/rollback`, token, { versionId });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Rollback failed');
      }
      onRollback(blockKey);
      setOpen(false);
      setVersions((prev) => prev.filter((v) => v.id !== versionId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Rollback failed');
    } finally {
      setRollingBack(null);
    }
  }

  async function toggle() {
    if (!open && versions.length === 0) await loadVersions();
    setOpen(!open);
  }

  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={toggle}
        className="text-xs text-royal-violet hover:underline"
      >
        {open ? 'Hide history' : 'View history'}
      </button>
      {open && (
        <div className="mt-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-3 max-h-48 overflow-y-auto">
          {loading ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading…</p>
          ) : error ? (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : versions.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No previous versions</p>
          ) : (
            <ul className="space-y-2">
              {versions.map((v) => (
                <li
                  key={v.id}
                  className="flex items-start justify-between gap-2 text-sm border-b border-gray-200 dark:border-gray-700 pb-2 last:border-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(v.createdAt)}</p>
                    <p className="text-gray-700 dark:text-gray-300 truncate" title={truncate(v.value, 200)}>
                      {truncate(v.value, 80)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRollback(v.id)}
                    disabled={!!rollingBack}
                    className="shrink-0 px-2 py-1 text-xs font-medium text-royal-violet hover:bg-royal-violet/10 rounded disabled:opacity-50"
                  >
                    {rollingBack === v.id ? 'Restoring…' : 'Restore'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
