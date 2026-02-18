'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface MediaCenterProps {
  headline: string;
  subtext: string;
  pressReleaseLabel?: string;
  pressReleaseComingSoon?: string;
}

const LINKS = [
  { label: 'Brand Assets', href: '/media' },
  { label: 'Gallery', href: '/media' },
];

export function MediaCenter({
  headline = 'Media Center',
  subtext = 'Press releases, brand assets, and coverage.',
  pressReleaseLabel = 'Press Release #1',
  pressReleaseComingSoon = 'Coming Soon',
}: MediaCenterProps) {
  return (
    <section className="py-20 px-6 bg-white/[0.02]">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 1, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            {headline}
          </h2>
          <p className="text-white/70 text-lg">{subtext}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 1, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-6"
        >
          <div className="px-6 py-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            <span className="text-white font-medium">{pressReleaseLabel}</span>
            <span className="ml-2 text-white/50 text-sm">({pressReleaseComingSoon})</span>
          </div>
          {LINKS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="px-6 py-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white hover:border-royal-violet/40 hover:bg-white/[0.06] transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
