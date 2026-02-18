'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface Partner {
  name: string;
  tag: string;
}

interface NetworkProps {
  headline?: string;
  text?: string;
  partners?: Partner[];
}

const DEFAULT_PARTNERS: Partner[] = [
  { name: 'Lighthouse Labs', tag: 'Tech' },
  { name: 'Venture Grove', tag: 'VC' },
  { name: 'Foundry Partners', tag: 'Legal' },
  { name: 'Nimbus Cloud', tag: 'Cloud' },
  { name: 'Arcade Digital', tag: 'Dev' },
  { name: 'Studio Motion', tag: 'Design' },
];

const DEFAULT_TEXT =
  'Our success is intertwined with yours, and that of our valued network. At Exale, we thrive on creating powerful collaborations. We build partnerships that facilitate seamless execution, enabling the exchange of valuable services and fostering an ecosystem where every entity contributes to collective achievement. We work together, rely on each other, and grow together.';

export function Network({
  headline = 'Our Network',
  text = DEFAULT_TEXT,
  partners = DEFAULT_PARTNERS,
}: NetworkProps) {
  return (
    <section className="py-28 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 1, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            {headline}
          </h2>
          <p className="text-white/70 text-lg max-w-3xl mx-auto leading-relaxed mb-10">
            {text}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 1, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12"
        >
          {partners.map((p, i) => (
            <div
              key={p.name}
              className="p-6 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center"
            >
              <p className="text-white font-semibold">{p.name}</p>
              <p className="text-white/50 text-sm mt-1">{p.tag}</p>
            </div>
          ))}
        </motion.div>
        <div className="text-center">
          <Link
            href="/partners"
            className="inline-flex items-center gap-2 text-royal-violet hover:text-royal-violet/80 font-semibold transition-colors"
          >
            Partner with us
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
