'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

const PARTNER_PLACEHOLDER_COUNT = 6;

export function PartnersTeaser() {
  return (
    <section className="h-screen min-h-screen snap-start flex flex-col items-center justify-center py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden bg-stone-100">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/images/rely-background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        aria-hidden
      />
      <div className="absolute inset-0 z-[1] bg-stone-100/65" aria-hidden />
      <motion.div
        initial={{ opacity: 1, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="max-w-5xl w-full text-center relative z-10"
      >
        <p className="text-xs font-medium text-gray-500 uppercase tracking-[0.15em] mb-3">
          Our Network
        </p>
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900 tracking-tight">
          Those we{' '}
          <span className="gradient-text">rely on.</span>
        </h2>
        <p className="text-gray-600 text-base leading-relaxed max-w-xl mx-auto mb-12">
          Our success is intertwined with yours. We build partnerships that facilitate seamless execution.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-8 md:gap-10 mb-12">
          {Array.from({ length: PARTNER_PLACEHOLDER_COUNT }, (_, i) => (
            <div
              key={i}
              className="flex items-center justify-center p-4 rounded-xl bg-white/70 border border-gray-200/80 shadow-sm min-h-[100px]"
            >
              <Image
                src="/images/x-exale.png"
                alt="Partner logo placeholder"
                width={120}
                height={120}
                className="w-20 h-20 md:w-24 md:h-24 object-contain opacity-60"
              />
            </div>
          ))}
        </div>
        <Link
          href="/partners"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-royal-violet transition-colors"
        >
          View All Partners
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </motion.div>
    </section>
  );
}
