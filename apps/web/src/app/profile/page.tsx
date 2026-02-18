'use client';

import { SignOutButton, useAuth, useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { apiGet, apiPut } from '@/lib/api-auth';
import { UploadButton } from '@/lib/uploadthing';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

interface Profile {
  id: string;
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  phone: string | null;
  companyName: string | null;
  linkedInUrl: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
}

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
  const [form, setForm] = useState({
    phone: '',
    companyName: '',
    linkedInUrl: '',
    twitterUrl: '',
    instagramUrl: '',
  });

  async function loadProfile() {
    const token = await getToken();
    if (!token || !user) return null;
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
        }
      }
      return data;
    } catch {
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
        setForm({
          phone: data.phone ?? '',
          companyName: data.companyName ?? '',
          linkedInUrl: data.linkedInUrl ?? '',
          twitterUrl: data.twitterUrl ?? '',
          instagramUrl: data.instagramUrl ?? '',
        });
      }
      setLoading(false);
    }
    load();
  }, [getToken, user]);

  async function handleRetry() {
    if (!user) return;
    setRetrying(true);
    const data = await loadProfile();
    setProfile(data);
    if (data) {
      setForm({
        phone: data.phone ?? '',
        companyName: data.companyName ?? '',
        linkedInUrl: data.linkedInUrl ?? '',
        twitterUrl: data.twitterUrl ?? '',
        instagramUrl: data.instagramUrl ?? '',
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
        phone: form.phone || undefined,
        companyName: form.companyName || undefined,
        linkedInUrl: form.linkedInUrl || undefined,
        twitterUrl: form.twitterUrl || undefined,
        instagramUrl: form.instagramUrl || undefined,
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

  // API profile not ready yet - show Clerk data + retry
  if (!profile) {
    const clerkName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Profile';
    const clerkEmail = user.primaryEmailAddress?.emailAddress ?? '';
    return (
      <div className="max-w-xl mx-auto py-24 px-6">
        <div className="glass-panel p-8 rounded-2xl text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{clerkName}</h1>
          {clerkEmail && <p className="text-gray-600 mb-6">{clerkEmail}</p>}
          <p className="text-gray-600 mb-6">
            Your profile is being set up. If this message persists, the connection to our server may be delayed.
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
          <p className="mt-4 text-sm text-gray-500">
            Make sure the API is running at {API_URL}
          </p>
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
            profile.linkedInUrl,
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Edit profile</h2>
          <input
            type="tel"
            placeholder="Phone number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={inputClass}
          />
          <input
            type="text"
            placeholder="Company name"
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            className={inputClass}
          />
          <input
            type="url"
            placeholder="LinkedIn profile URL"
            value={form.linkedInUrl}
            onChange={(e) => setForm({ ...form, linkedInUrl: e.target.value })}
            className={inputClass}
          />
          <input
            type="url"
            placeholder="Twitter / X profile URL"
            value={form.twitterUrl}
            onChange={(e) => setForm({ ...form, twitterUrl: e.target.value })}
            className={inputClass}
          />
          <input
            type="url"
            placeholder="Instagram profile URL"
            value={form.instagramUrl}
            onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
            className={inputClass}
          />
          {message && (
            <p className={`text-sm ${message.includes('updated') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="btn-primary disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>

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
