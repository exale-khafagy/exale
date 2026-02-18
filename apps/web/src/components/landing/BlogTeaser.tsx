'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface BlogTeaserProps {
  headline: string;
  label?: string;
  subheadline: string;
  teaser: string;
}

export function BlogTeaser({
  headline = 'Insights & Stories',
  label = 'Entrepreneurship•Coming Soon',
  subheadline = 'How to Unleash Your Potential',
  teaser = 'The journey of a thousand miles begins with a single step. Stay tuned.',
}: BlogTeaserProps) {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-12 tracking-tight text-center">
          {headline}
        </h2>
        <motion.div
          initial={{ opacity: 1, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-12 md:gap-16 items-center"
        >
          <div className="aspect-[4/3] rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
            <span className="text-white/40 text-sm">Image Placeholder</span>
          </div>
          <div>
            <p className="text-royal-violet text-sm font-semibold uppercase tracking-wider mb-4">
              {label}
            </p>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight">
              {subheadline}
            </h3>
            <p className="text-white/70 text-lg leading-relaxed mb-8">{teaser}</p>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-royal-violet hover:text-royal-violet/80 font-semibold transition-colors"
            >
              Read more
              <span>→</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
