'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { getContent } from '@/lib/api';
import type { ContentBlock } from '@/lib/api';

const SEO_PAGES = [
  { slug: 'home', path: '/', label: 'Home' },
  { slug: 'apply', path: '/apply', label: 'Apply' },
  { slug: 'services', path: '/services', label: 'Services' },
  { slug: 'projects', path: '/projects', label: 'Projects' },
  { slug: 'partners', path: '/partners', label: 'Partners' },
  { slug: 'media', path: '/media', label: 'Media' },
  { slug: 'blog', path: '/blog', label: 'Blog' },
];

const DEFAULT_SEO: Record<string, { title: string; description: string }> = {
  home: { title: 'Exale — Not Every Beginning Has An Ending', description: 'Business development holding company. We help bring your vision to life.' },
  apply: { title: 'Apply | Exale', description: 'Submit your application to partner with Exale.' },
  services: { title: 'Services | Exale', description: 'Web development, strategic planning, branding and design.' },
  projects: { title: 'Projects | Exale', description: 'Explore our work and partnerships.' },
  partners: { title: 'Partners | Exale', description: 'Our network of trusted partners.' },
  media: { title: 'Media Center | Exale', description: 'Press releases, brand assets, and coverage.' },
  blog: { title: 'Insights & Stories | Exale', description: 'How to unleash your potential.' },
};

export default function SEOPage() {
  const { getToken } = useAuth();
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [activePage, setActivePage] = useState('home');

  useEffect(() => {
    getContent('seo')
      .then(setBlocks)
      .catch(() => setBlocks([]))
      .finally(() => setLoading(false));
  }, []);

  const getBlock = (key: string) => blocks.find((b) => b.key === key)?.value ?? '';
  const setBlock = (key: string, value: string) => {
    const existing = blocks.find((b) => b.key === key);
    if (existing) {
      setBlocks((prev) => prev.map((b) => (b.key === key ? { ...b, value } : b)));
    } else {
      setBlocks((prev) => [...prev, { id: '', key, value, type: 'text' as const, section: 'seo' }]);
    }
  };

  const edited = SEO_PAGES.reduce(
    (acc, p) => ({
      ...acc,
      [p.slug]: {
        title: getBlock(`seo_${p.slug}_title`) || DEFAULT_SEO[p.slug]?.title || '',
        description: getBlock(`seo_${p.slug}_description`) || DEFAULT_SEO[p.slug]?.description || '',
        ogImage: getBlock(`seo_${p.slug}_og_image`) || '',
      },
    }),
    {} as Record<string, { title: string; description: string; ogImage: string }>,
  );

  const current = edited[activePage] ?? { title: '', description: '', ogImage: '' };

  async function handleSave() {
    const token = await getToken();
    if (!token) return;
    setSaving(true);
    setMessage(null);
    try {
      const toSave: { key: string; value: string; type: 'text'; section: string }[] = [];
      SEO_PAGES.forEach((p) => {
        const data = edited[p.slug];
        if (data) {
          toSave.push({ key: `seo_${p.slug}_title`, value: data.title, type: 'text', section: 'seo' });
          toSave.push({ key: `seo_${p.slug}_description`, value: data.description, type: 'text', section: 'seo' });
          toSave.push({ key: `seo_${p.slug}_og_image`, value: data.ogImage, type: 'text', section: 'seo' });
        }
      });
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/content/bulk`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ blocks: toSave }),
        },
      );
      if (res.status === 401) {
        setMessage("You don't have access.");
        return;
      }
      if (!res.ok) throw new Error('Failed');
      const updated = await getContent('seo');
      setBlocks(updated);
      setMessage('SEO settings saved.');
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage('Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  function updateCurrent(field: 'title' | 'description' | 'ogImage', value: string) {
    const key = `seo_${activePage}_${field}`;
    setBlock(key, value);
  }

  if (loading) {
    return (
      <div className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-royal-violet rounded-full animate-spin" />
        <span>Loading SEO settings...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">SEO Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage meta titles, descriptions, and Open Graph settings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-royal-violet hover:bg-royal-violet/90 disabled:opacity-50 text-white font-medium rounded-lg shadow-sm"
        >
          {saving ? 'Saving...' : 'Save All'}
        </button>
      </div>

      {message && (
        <div
          className={`mb-4 px-4 py-2 rounded-lg text-sm ${
            message.includes('Failed') ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
          }`}
        >
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Pages</h2>
            <div className="space-y-1">
              {SEO_PAGES.map((p) => (
                <button
                  key={p.slug}
                  onClick={() => setActivePage(p.slug)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activePage === p.slug
                      ? 'bg-royal-violet text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {SEO_PAGES.find((p) => p.slug === activePage)?.label} — SEO
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={current.title}
                  onChange={(e) => updateCurrent('title', e.target.value)}
                  placeholder="50–60 characters recommended"
                  maxLength={70}
                  className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-royal-violet/40"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {current.title.length}/70 characters
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Meta Description
                </label>
                <textarea
                  value={current.description}
                  onChange={(e) => updateCurrent('description', e.target.value)}
                  placeholder="150–160 characters recommended"
                  maxLength={170}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-royal-violet/40 resize-none"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {current.description.length}/170 characters
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Open Graph Image URL
                </label>
                <input
                  type="text"
                  value={current.ogImage}
                  onChange={(e) => updateCurrent('ogImage', e.target.value)}
                  placeholder="https://exale.net/images/og-image.png"
                  className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-royal-violet/40"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Image shown when sharing on social media (1200×630px recommended)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
