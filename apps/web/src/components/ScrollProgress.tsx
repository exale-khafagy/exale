'use client';

import { useEffect, useState } from 'react';

export function ScrollProgress({ scrollRef }: { scrollRef: React.RefObject<HTMLElement | null> }) {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const update = () => {
      const st = el.scrollTop;
      const sh = el.scrollHeight - el.clientHeight;
      setPercent(sh > 0 ? (st / sh) * 100 : 0);
    };

    el.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    update();
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [scrollRef]);

  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 h-[50vh] w-px bg-white/5 rounded-full z-40 hidden lg:block">
      <div
        className="absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-royal-violet shadow-[0_0_16px_rgba(106,77,255,0.5)] transition-[top] duration-100 ease-out"
        style={{ top: `${percent}%` }}
      />
    </div>
  );
}
