'use client';

import Link from 'next/link';

export function FloatingApplyButton() {
  return (
    <Link
      href="/apply"
      className="fixed bottom-8 right-8 z-[100] flex items-center justify-center min-w-[4.5rem] h-14 px-5 rounded-full bg-royal-violet hover:bg-royal-violet/90 text-white text-sm font-bold shadow-[0_4px_24px_rgba(106,77,255,0.4)] hover:shadow-[0_6px_32px_rgba(106,77,255,0.5)] ring-2 ring-white/10 hover:ring-white/20 transition-all"
      aria-label="Apply"
    >
      Apply
    </Link>
  );
}
