'use client';

import { motion } from 'framer-motion';

const TEXT =
  "Your ambition drives us. We believe in fostering long-term partnerships built on mutual trust and shared success. Unlike traditional models, we're invested in your journey, offering proper solutions and guidance without necessarily charging for our services. We become your dedicated partner, collaborating on every decision and ensuring your business achieves independence and sustained growth. Together, we turn vision into reality, mile after mile.";

export function Philosophy() {
  return (
    <section className="h-screen min-h-screen snap-start flex flex-col items-center justify-center py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden bg-stone-100">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/images/mile-background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        aria-hidden
      />
      <div className="absolute inset-0 z-[1] bg-stone-100/55" aria-hidden />
      <motion.div
        initial={{ opacity: 1, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="text-center max-w-4xl mx-auto relative z-10"
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-8 sm:mb-10 leading-[1.12] tracking-tight">
          You take a step;
          <br />
          <span className="gradient-text">We take you a mile.</span>
        </h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
          className="glass-panel p-6 sm:p-8 md:p-10 rounded-2xl text-left max-w-3xl mx-auto"
        >
          <p className="text-gray-600 text-base md:text-lg leading-[1.7]">{TEXT}</p>
        </motion.div>
      </motion.div>
    </section>
  );
}
