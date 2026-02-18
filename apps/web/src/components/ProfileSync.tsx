'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useEffect, useRef } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export function ProfileSync() {
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const synced = useRef(false);

  useEffect(() => {
    if (!isSignedIn || !user || synced.current) return;

    const u = user;

    async function sync() {
      const token = await getToken();
      if (!token) return;

      try {
        await fetch(`${API_URL}/profile/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
          body: JSON.stringify({
            email: u.primaryEmailAddress?.emailAddress ?? '',
            firstName: u.firstName ?? undefined,
            lastName: u.lastName ?? undefined,
          }),
        });
        synced.current = true;
      } catch {
        // Silently fail; profile will sync on next load
      }
    }

    sync();
  }, [isSignedIn, user, getToken]);

  return null;
}
