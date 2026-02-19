'use client';

import { useAuth } from '@clerk/nextjs';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { UploadDropzone } from '@/lib/uploadthing';
import { apiGet } from '@/lib/api-auth';

interface MediaFile {
  id: string;
  url: string;
  name: string;
  size: number;
  type: string;
  uploadedBy: string | null;
  createdAt: string;
}

export default function MediaLibraryPage() {
  const { getToken } = useAuth();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [uploading, setUploading] = useState(false);

  const fetchFiles = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<MediaFile[]>('/media', token);
      setFiles(data ?? []);
      setError(null);
    } catch (e) {
      const err = e as Error & { status?: number };
      if (err.message === 'UNAUTHORIZED') {
        setError("You don't have access.");
      } else if (err.status === 500) {
        setError('Server error. The database may need the MediaFile collection. Run db:generate and db:push in apps/api (stop the API first).');
      } else {
        setError('Failed to load media files. Check that the API is running.');
      }
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  async function handleUploadComplete(res: { url: string; name: string; size: number; type: string }) {
    setUploading(true);
    const token = await getToken();
    if (!token) return;

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
      const createRes = await fetch(`${API_URL}/media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url: res.url,
          name: res.name,
          size: res.size,
          type: res.type,
        }),
      });

      if (createRes.ok) {
        const newFile = await createRes.json();
        setFiles((prev) => [newFile, ...prev]);
      }
    } catch (err) {
      console.error('Failed to register file:', err);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this file?')) return;

    const token = await getToken();
    if (!token) return;

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
      const res = await fetch(`${API_URL}/media/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== id));
      } else {
        throw new Error('Failed to delete');
      }
    } catch (err) {
      alert('Failed to delete file');
    }
  }

  const filteredFiles = files.filter((file) => {
    const matchesSearch = !search || file.name.toLowerCase().includes(search.toLowerCase());
    const matchesType =
      filterType === 'all' ||
      (filterType === 'image' && file.type.startsWith('image/')) ||
      (filterType === 'pdf' && file.type === 'application/pdf') ||
      (filterType === 'other' && !file.type.startsWith('image/') && file.type !== 'application/pdf');
    return matchesSearch && matchesType;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const isImage = (type: string) => type.startsWith('image/');

  if (loading) {
    return (
      <div className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-royal-violet rounded-full animate-spin" />
        <span>Loading media library...</span>
      </div>
    );
  }

  if (error && files.length === 0 && !loading) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
    return (
      <div className="space-y-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Media Library</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage images, documents, and files</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h2 className="text-red-600 dark:text-red-400 font-semibold mb-2">Failed to load media library</h2>
          <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">{error}</p>
          {error !== "You don't have access." && (
            <div className="text-gray-600 dark:text-gray-400 text-xs space-y-2 mb-4">
              <p className="font-medium">Fix steps:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Stop the API server (Ctrl+C in its terminal)</li>
                <li>In a terminal: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded block mt-1">cd apps/api</code> then <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded block mt-1">npm run db:generate</code> then <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded block mt-1">npm run db:push</code></li>
                <li>Restart the API server with <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">npm run dev</code></li>
              </ol>
              <p>• API should be at {API_URL}</p>
            </div>
          )}
        </div>
        <button
          onClick={() => fetchFiles()}
          className="px-4 py-2 bg-royal-violet hover:bg-royal-violet/90 text-white rounded-lg text-sm font-medium"
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Media Library</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Manage images, documents, and files</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${
              viewMode === 'grid'
                ? 'bg-royal-violet text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${
              viewMode === 'list'
                ? 'bg-royal-violet text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mb-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upload Files</h2>
        <UploadDropzone
          endpoint="mediaLibrary"
          onClientUploadComplete={(res) => {
            if (res && res[0]) {
              handleUploadComplete(res[0]);
            }
          }}
          onUploadError={(error) => {
            alert(`Upload failed: ${error.message}`);
            setUploading(false);
          }}
          onUploadBegin={() => setUploading(true)}
        />
      </div>

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 max-w-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-royal-violet/50"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-royal-violet/50"
          >
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="pdf">PDFs</option>
            <option value="other">Other</option>
          </select>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {filteredFiles.length} {filteredFiles.length === 1 ? 'file' : 'files'}
        </p>
      </div>

      {filteredFiles.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">No files found.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="aspect-square bg-gray-100 dark:bg-gray-900 relative">
                {isImage(file.type) ? (
                  <Image
                    src={file.url}
                    alt={file.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white rounded-lg hover:bg-gray-100"
                    >
                      <svg className="w-5 h-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="p-2 bg-white rounded-lg hover:bg-red-50"
                    >
                      <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatFileSize(file.size)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Preview
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Uploaded
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredFiles.map((file) => (
                <tr key={file.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-4 py-3">
                    {isImage(file.type) ? (
                      <Image
                        src={file.url}
                        alt={file.name}
                        width={48}
                        height={48}
                        className="rounded object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{file.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{file.type}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{formatFileSize(file.size)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(file.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-royal-violet hover:underline text-sm"
                      >
                        Open
                      </a>
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="text-red-600 dark:text-red-400 hover:underline text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
