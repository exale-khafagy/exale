'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface FooterCtaProps {
  headline: string;
  text: string;
  buttonText: string;
}

export function FooterCta({ headline, text, buttonText }: FooterCtaProps) {
  return (
    <section className="py-28 px-6 bg-gradient-to-b from-white/[0.03] to-transparent">
      <motion.div
        initial={{ opacity: 1, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto text-center"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">{headline}</h2>
        <p className="text-white/70 text-lg mb-12 leading-relaxed">{text}</p>
        <Link
          href="/apply"
          className="inline-flex items-center justify-center px-12 py-4 bg-royal-violet hover:bg-royal-violet/90 text-white font-semibold rounded-full transition-all hover:shadow-xl hover:shadow-royal-violet/25"
        >
          {buttonText}
        </Link>
      </motion.div>
    </section>
  );
}
