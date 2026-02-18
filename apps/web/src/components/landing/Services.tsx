'use client';

import { motion } from 'framer-motion';

interface Service {
  title: string;
  desc: string;
  icon?: string;
}

interface ServicesProps {
  headline: string;
  intro: string;
  services: Service[];
}

export function Services({ headline, intro, services }: ServicesProps) {
  return (
    <section className="py-28 px-6 bg-white/[0.02]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 1, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">{headline}</h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">{intro}</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {services.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 1, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-royal-violet/30 hover:bg-white/[0.05] transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-royal-violet/20 flex items-center justify-center mb-6 group-hover:bg-royal-violet/30 transition-colors text-2xl">
                {s.icon ?? (i === 0 ? '💻' : i === 1 ? '🎯' : '✨')}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{s.title}</h3>
              <p className="text-white/60 leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
