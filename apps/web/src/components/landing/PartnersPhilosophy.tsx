'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface PartnersPhilosophyProps {
  partnersHeadline: string;
  partnersText: string;
  partnersCta: string;
  philosophyHeadline: string;
  philosophyText: string;
}

const DEFAULT_PARTNERS_TEXT =
  'Our success is intertwined with yours. We build partnerships that facilitate seamless execution.';
const DEFAULT_PHILOSOPHY_TEXT =
  "Your ambition drives us. We believe in fostering long-term partnerships built on mutual trust and shared success. Unlike traditional models, we're invested in your journey, offering proper solutions and guidance without necessarily charging for our services. We become your dedicated partner, collaborating on every decision and ensuring your business achieves independence and sustained growth. Together, we turn vision into reality, mile after mile.";

export function PartnersPhilosophy({
  partnersHeadline = 'Those we rely on.',
  partnersText = DEFAULT_PARTNERS_TEXT,
  partnersCta = 'View All Partners',
  philosophyHeadline = 'You take a step;We take you a mile.',
  philosophyText = DEFAULT_PHILOSOPHY_TEXT,
}: PartnersPhilosophyProps) {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 md:gap-20">
        <motion.div
          initial={{ opacity: 1, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-left"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
            {partnersHeadline}
          </h2>
          <p className="text-white/70 text-lg leading-relaxed mb-6">{partnersText}</p>
          <Link
            href="/partners"
            className="inline-flex items-center gap-2 text-royal-violet hover:text-royal-violet/80 font-semibold transition-colors"
          >
            {partnersCta}
            <span>→</span>
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 1, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-left"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
            {philosophyHeadline}
          </h2>
          <p className="text-white/70 text-lg leading-relaxed">{philosophyText}</p>
        </motion.div>
      </div>
    </section>
  );
}
