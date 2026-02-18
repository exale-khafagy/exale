'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
      <p className="text-white/60 mb-6">Unable to load the page. The API may be unavailable.</p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
        >
          Try again
        </button>
        <Link
          href="/"
          className="px-4 py-2 bg-royal-violet text-white rounded-lg hover:bg-royal-violet/90 transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
