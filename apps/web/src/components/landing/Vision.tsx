'use client';

import { motion } from 'framer-motion';

interface Expertise {
  title: string;
  desc: string;
}

interface VisionProps {
  headline?: string;
  visionText?: string;
  founderStory?: string;
  philosophyFull?: string;
  expertise?: Expertise[];
}

const DEFAULT_EXPERTISE: Expertise[] = [
  { title: 'Branding', desc: 'Crafting compelling identities that resonate' },
  { title: 'Business Development', desc: 'Forging pathways for growth and expansion' },
  { title: 'Marketing & Advertising', desc: 'Connecting businesses with their audience' },
  { title: 'Management', desc: 'Leading teams and operations efficiently' },
  { title: 'Graphic Design', desc: 'Visualizing ideas into impactful aesthetics' },
  { title: 'Logistics', desc: 'Streamlining operations for optimal performance' },
];

const DEFAULT_VISION = 'At Exale, we are dedicated to guiding you throughout your entrepreneurial journey, from inception to achieving complete business independence. We view ourselves as your committed partner, fostering a relationship built on mutual reliance and collaborative decision-making every step of the way. We believe that every great idea deserves the chance to flourish, and every entrepreneur deserves unwavering support to navigate the complexities of building a successful business.';
const DEFAULT_FOUNDER = "Exale was founded in Cairo, Egypt, in 2025, by Ahmed Khafagy, a visionary with a deep-seated passion for entrepreneurship and business development. Ahmed brings a wealth of diverse experience to Exale, spanning numerous critical fields essential for business growth. His practical approach is rooted in direct experience, having successfully executed three different startups.";
const DEFAULT_PHILOSOPHY = "Ahmed Khafagy firmly believes that everyone deserves a chance to pursue their entrepreneurial dreams. He champions the idea that the initial spark of excitement that ignites a new venture is a powerful force that must be harnessed and nurtured, rather than allowed to settle. This philosophy is the cornerstone of Exale's mission: to empower entrepreneurs to not just start, but to sustain and scale their businesses, ensuring that the initial enthusiasm translates into lasting independence and success. We are here to ensure that your journey is not just begun, but completed with strength and autonomy.";

export function Vision({
  headline = 'Our Vision: Your Business, Independent and Thriving',
  visionText = DEFAULT_VISION,
  founderStory = DEFAULT_FOUNDER,
  philosophyFull = DEFAULT_PHILOSOPHY,
  expertise = DEFAULT_EXPERTISE,
}: VisionProps) {
  return (
    <section className="py-28 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.h2
          initial={{ opacity: 1, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-white mb-16 tracking-tight"
        >
          {headline}
        </motion.h2>
        <motion.div
          initial={{ opacity: 1, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="space-y-12 text-white/75 text-lg leading-relaxed"
        >
          <p>{visionText}</p>
          <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <h3 className="text-lg font-semibold text-white mb-4">
              The Foundation of Exale: Ahmed Khafagy&apos;s Journey
            </h3>
            <p>{founderStory}</p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {expertise.map((e) => (
                <div
                  key={e.title}
                  className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]"
                >
                  <h4 className="font-semibold text-white text-sm">{e.title}</h4>
                  <p className="text-white/60 text-sm mt-1">{e.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <h3 className="text-lg font-semibold text-white mb-4">
              Our Philosophy: Unleashing Potential, Sustaining Momentum
            </h3>
            <p>{philosophyFull}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
