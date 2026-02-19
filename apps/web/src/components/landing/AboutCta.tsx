'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const INTRO =
  'Do you have a groundbreaking idea waiting to be unleashed? At Exale, we specialize in helping individuals like you bring their vision to life. From the moment you connect with us, we listen attentively, understand the core of your idea, and work to identify and resolve any challenges you face. Your entrepreneurial journey begins here.';

export function AboutCta() {
  return (
    <section
      id="about-cta"
      className="min-h-screen snap-start snap-always flex flex-col items-center justify-center py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden bg-stone-100"
    >
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/images/background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        aria-hidden
      />
      <div className="absolute inset-0 z-[1] bg-stone-100/55" aria-hidden />
      <div className="max-w-4xl w-full text-center relative z-10">
        <motion.h2
          initial={{ opacity: 1, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="text-2xl sm:text-3xl md:text-5xl font-bold mb-6 sm:mb-8 text-gray-900 leading-[1.15] tracking-tight"
        >
          Ready to take your{' '}
          <span className="gradient-text">first step?</span>
        </motion.h2>
        <motion.div
          initial={{ opacity: 1, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
          className="glass-panel p-6 sm:p-8 md:p-12 rounded-2xl"
        >
          <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-8 max-w-2xl mx-auto">
            {INTRO}
          </p>
          <Link
            href="/apply"
            className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 group"
          >
            Start Your Journey
            <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
