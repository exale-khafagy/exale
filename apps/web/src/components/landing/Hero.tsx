'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function Hero() {
  return (
    <section className="min-h-screen snap-start snap-always flex flex-col items-center justify-center px-4 text-center relative overflow-hidden bg-exale-dark">
      {/* Background image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/images/header-background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        aria-hidden
      />
      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/50 via-black/20 to-black/70" aria-hidden />

      <div className="relative z-10 flex flex-col items-center justify-center h-full pb-24">
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <Image
            src="/images/x-exale.png"
            alt="Exale"
            width={256}
            height={256}
            className="w-40 md:w-60"
          />
        </motion.div>
        <motion.h1
          initial={{ opacity: 1, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-xl sm:text-2xl md:text-3xl font-semibold shining-text max-w-2xl mx-auto tracking-wide px-2"
        >
          Not Every Beginning Has An Ending
        </motion.h1>
        <motion.p
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-8 text-white/40 text-xs uppercase tracking-[0.2em]"
        >
          Your journey starts here
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-8 sm:bottom-12 z-10"
      >
        <Link
          href="#about-cta"
          className="group flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors duration-300"
          aria-label="Scroll down to content"
        >
          <span className="text-xs uppercase tracking-[0.25em]">Scroll for more</span>
          <span className="flex h-10 w-6 items-center justify-center rounded-full border-2 border-current opacity-80 group-hover:opacity-100 transition-opacity">
            <span className="animate-bounce block">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </span>
          </span>
        </Link>
      </motion.div>
    </section>
  );
}
