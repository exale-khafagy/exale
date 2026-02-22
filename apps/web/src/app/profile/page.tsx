'use client';

import { SignOutButton, useAuth, useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { apiGet, apiPut } from '@/lib/api-auth';
import { UploadButton } from '@/lib/uploadthing';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

interface SocialChannel {
  platform: string;
  url: string;
}

interface Profile {
  id: string;
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  phone: string | null;
  companyName: string | null;
  title: string | null;
  socialChannels: SocialChannel[] | null;
}

const SOCIAL_PLATFORMS = [
  'LinkedIn',
  'Twitter / X',
  'Instagram',
  'Facebook',
  'GitHub',
  'YouTube',
  'Behance',
  'Dribbble',
  'Medium',
  'Website',
  'Other',
] as const;

const inputClass =
  'w-full px-4 py-3 rounded-xl bg-white/80 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-royal-violet focus:ring-2 focus:ring-royal-violet/20 outline-none transition-all';

export default function ProfilePage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadErrorDetail, setLoadErrorDetail] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    phone: '',
    companyName: '',
    title: '',
    socialChannels: [] as SocialChannel[],
  });

  async function loadProfile() {
    const token = await getToken();
    if (!token || !user) return null;
    setLoadError(null);
    setLoadErrorDetail(null);
    try {
      let data = await apiGet<Profile | null>('/profile/me', token);
      if (!data) {
        const syncRes = await fetch(`${API_URL}/profile/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            email: user.primaryEmailAddress?.emailAddress ?? '',
            firstName: user.firstName ?? undefined,
            lastName: user.lastName ?? undefined,
          }),
        });
        if (syncRes.ok) {
          data = await apiGet<Profile | null>('/profile/me', token);
        } else {
          const errText = await syncRes.text();
          setLoadError(
            syncRes.status === 401
              ? 'We couldn’t verify your sign-in. Please sign out and sign in again.'
              : 'We couldn’t sync your profile. Please try again in a moment.',
          );
        }
      }
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network or server error';
      setLoadErrorDetail(msg);
      setLoadError(
        msg === 'UNAUTHORIZED'
          ? 'We couldn’t verify your sign-in. Please sign out and sign in again.'
          : msg === 'SERVER_ERROR'
            ? 'Something went wrong on our end. Please try again in a moment.'
            : 'We couldn’t load your profile. Please try again.',
      );
      return null;
    }
  }

  useEffect(() => {
    async function load() {
      if (!user) {
        setLoading(false);
        return;
      }
      const data = await loadProfile();
      setProfile(data);
      if (data) {
        const channels = Array.isArray(data.socialChannels) ? data.socialChannels : [];
        setForm({
          phone: data.phone ?? '',
          companyName: data.companyName ?? '',
          title: data.title ?? '',
          socialChannels: channels.map((c: { platform?: string; url?: string }) => ({ platform: c.platform ?? 'Other', url: c.url ?? '' })),
        });
      }
      setLoading(false);
    }
    load();
  }, [getToken, user]);

  async function handleRetry() {
    if (!user) return;
    setRetrying(true);
    setLoadError(null);
    setLoadErrorDetail(null);
    const data = await loadProfile();
    setProfile(data);
    if (data) {
      const channels = Array.isArray(data.socialChannels) ? data.socialChannels : [];
      setForm({
        phone: data.phone ?? '',
        companyName: data.companyName ?? '',
        title: data.title ?? '',
        socialChannels: channels.map((c: { platform?: string; url?: string }) => ({ platform: c.platform ?? 'Other', url: c.url ?? '' })),
      });
    }
    setRetrying(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = await getToken();
    if (!token || !profile) return;
    setSaving(true);
    setMessage(null);
    try {
      await apiPut('/profile/me', token, {
        phone: form.phone.trim() || undefined,
        companyName: form.companyName.trim() || undefined,
        title: form.title.trim() || undefined,
        socialChannels: form.socialChannels.filter((c) => c.url.trim()).length
          ? form.socialChannels.filter((c) => c.url.trim()).map((c) => ({ platform: c.platform, url: c.url.trim() }))
          : undefined,
      });
      setMessage('Profile updated.');
      const data = await apiGet<Profile>('/profile/me', token);
      setProfile(data);
    } catch {
      setMessage('Failed to update.');
    } finally {
      setSaving(false);
    }
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-24 px-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Profile</h1>
        <p className="text-gray-600 mb-6">Sign in to view and manage your profile.</p>
        <Link href="/" className="btn-primary inline-block">
          Go to Home
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-24 px-6 text-center">
        <p className="text-gray-600">Loading your profile...</p>
      </div>
    );
  }

  // API profile not ready yet - show Clerk data + retry (this IS your profile page)
  if (!profile) {
    const clerkName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Profile';
    const clerkEmail = user.primaryEmailAddress?.emailAddress ?? '';
    return (
      <div className="max-w-xl mx-auto py-24 px-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Your profile</h1>
        <p className="text-gray-600 text-center mb-8">This is your profile page. Sign out is below.</p>
        <div className="glass-panel p-8 rounded-2xl">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">{clerkName}</h2>
          {clerkEmail && <p className="text-gray-600 mb-4">{clerkEmail}</p>}
          {loadError && (
            <>
              <p className="text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4 text-left text-sm">
                {loadError}
              </p>
              {typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && loadErrorDetail && (
                <p className="text-xs text-gray-500 mb-6 font-mono bg-gray-100 px-3 py-2 rounded break-all">
                  Debug: {loadErrorDetail}
                </p>
              )}
            </>
          )}
          <p className="text-gray-600 mb-6">
            Your full profile (with edit options for phone, company, and links) will appear here once your account is synced with our server. If it doesn’t load, use Try again.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="btn-primary disabled:opacity-50"
            >
              {retrying ? 'Retrying...' : 'Try again'}
            </button>
            <SignOutButton signOutOptions={{ redirectUrl: '/' }}>
              <button className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium">
                Sign out
              </button>
            </SignOutButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-16 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Profile</h1>
        <p className="text-gray-600 mb-4">Manage your contact and career info.</p>
        {(() => {
          const fields = [
            profile.phone,
            profile.companyName,
            profile.title,
            profile.firstName || profile.lastName,
          ];
          const filled = fields.filter(Boolean).length;
          const pct = Math.round((filled / fields.length) * 100);
          return (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full bg-royal-violet rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-sm text-gray-600">{pct}% complete</span>
            </div>
          );
        })()}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-8"
      >
        <div className="glass-panel p-6 rounded-2xl">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Profile picture</h2>
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
              {profile.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt="Profile"
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl text-gray-400 font-semibold">
                  {[profile.firstName, profile.lastName].map((n) => n?.[0]).filter(Boolean).join('') || '?'}
                </div>
              )}
            </div>
            <div>
              <UploadButton
                endpoint="profilePicture"
                onClientUploadComplete={async (res) => {
                  const url = res?.[0]?.url;
                  if (url && profile) {
                    const token = await getToken();
                    if (!token) return;
                    try {
                      await apiPut('/profile/me', token, { avatarUrl: url });
                      const data = await apiGet<Profile>('/profile/me', token);
                      setProfile(data);
                    } catch {
                      setMessage('Failed to save picture.');
                    }
                  }
                }}
                onUploadError={(err) => {
                  setMessage(err.message ?? 'Upload failed.');
                }}
                content={{
                  button({ ready, isUploading }) {
                    return isUploading ? 'Uploading...' : ready ? 'Change picture' : 'Loading...';
                  },
                }}
                appearance={{
                  button:
                    'ut-ready:bg-royal-violet ut-uploading:cursor-not-allowed ut-uploading:bg-royal-violet/70 bg-royal-violet text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                }}
              />
            </div>
          </div>
        </div>

        {/* Read-only: email & name (not editable) */}
        <div className="glass-panel p-6 rounded-2xl">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Basic info</h2>
          <dl className="space-y-3 text-gray-900">
            <div>
              <dt className="text-gray-500 text-sm">Email</dt>
              <dd>{profile.email}</dd>
            </div>
            <div>
              <dt className="text-gray-500 text-sm">Name</dt>
              <dd>{[profile.firstName, profile.lastName].filter(Boolean).join(' ') || '—'}</dd>
            </div>
          </dl>
        </div>

        {/* Editable info: view mode or edit mode */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Contact & links</h2>
            {!editing ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-sm font-medium text-royal-violet hover:text-royal-violet/80 transition-colors"
              >
                Edit
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const ch = Array.isArray(profile.socialChannels) ? profile.socialChannels : [];
                  setEditing(false);
                  setForm({
                    phone: profile.phone ?? '',
                    companyName: profile.companyName ?? '',
                    title: profile.title ?? '',
                    socialChannels: ch.map((c: { platform?: string; url?: string }) => ({ platform: c.platform ?? 'Other', url: c.url ?? '' })),
                  });
                }}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
          {!editing ? (
            <dl className="space-y-3 text-gray-900">
              <div>
                <dt className="text-gray-500 text-sm">Phone</dt>
                <dd>{profile.phone || '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500 text-sm">Company</dt>
                <dd>{profile.companyName || '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500 text-sm">Title</dt>
                <dd>{profile.title || '—'}</dd>
              </div>
              {(Array.isArray(profile.socialChannels) ? profile.socialChannels : []).length > 0 && (
                <div>
                  <dt className="text-gray-500 text-sm mb-1">Social & work</dt>
                  <dd className="space-y-1">
                    {(Array.isArray(profile.socialChannels) ? profile.socialChannels : []).map((c: SocialChannel, i: number) => (
                      <div key={i}>
                        <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-royal-violet hover:underline">
                          {c.platform}: {c.url}
                        </a>
                      </div>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          ) : (
            <form onSubmit={(e) => { handleSubmit(e); setEditing(false); }} className="space-y-4">
              <input type="tel" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
              <input type="text" placeholder="Company" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className={inputClass} />
              <input type="text" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
              <div>
                <span className="text-sm font-medium text-gray-700 block mb-2">Social & work (optional)</span>
                {form.socialChannels.map((ch, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <select
                      value={ch.platform}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          socialChannels: form.socialChannels.map((c, j) => (j === i ? { ...c, platform: e.target.value } : c)),
                        })
                      }
                      className={`${inputClass} flex-shrink-0 w-40`}
                    >
                      {SOCIAL_PLATFORMS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    <input
                      type="url"
                      placeholder="URL"
                      value={ch.url}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          socialChannels: form.socialChannels.map((c, j) => (j === i ? { ...c, url: e.target.value } : c)),
                        })
                      }
                      className={`${inputClass} flex-1`}
                    />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, socialChannels: form.socialChannels.filter((_, j) => j !== i) })}
                      className="px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setForm({ ...form, socialChannels: [...form.socialChannels, { platform: 'Other', url: '' }] })}
                  className="text-sm font-medium text-royal-violet hover:underline"
                >
                  + Add channel
                </button>
              </div>
              {message && <p className={`text-sm ${message.includes('updated') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
              <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </form>
          )}
        </div>

        {/* Sign out only from profile page */}
        <div className="pt-8 border-t border-gray-200">
          <SignOutButton signOutOptions={{ redirectUrl: '/' }}>
            <button className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium">
              Sign out
            </button>
          </SignOutButton>
        </div>
      </motion.div>
    </div>
  );
}
