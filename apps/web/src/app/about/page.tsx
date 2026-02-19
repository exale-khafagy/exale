import { getContent, contentMap } from '@/lib/api';

const SKILLS = [
  { title: 'Branding', desc: 'Crafting compelling identities that resonate' },
  { title: 'Business Development', desc: 'Forging pathways for growth and expansion' },
  { title: 'Marketing & Advertising', desc: 'Connecting businesses with their audience' },
  { title: 'Management', desc: 'Leading teams and operations efficiently' },
  { title: 'Graphic Design', desc: 'Visualizing ideas into impactful aesthetics' },
  { title: 'Logistics', desc: 'Streamlining operations for optimal performance' },
];

export default async function AboutPage() {
  let blocks: Awaited<ReturnType<typeof getContent>> = [];
  try {
    blocks = await getContent('home');
  } catch {
    // fallback
  }
  const c = contentMap(blocks);

  const visionText =
    c.vision_text ??
    'At Exale, we are dedicated to guiding you throughout your entrepreneurial journey, from inception to achieving complete business independence. We view ourselves as your committed partner, fostering a relationship built on mutual reliance and collaborative decision-making every step of the way.';

  const founderStory =
    c.founder_story ??
    'Exale was founded in Cairo, Egypt, in 2025, by Ahmed Khafagy, a visionary with a deep-seated passion for entrepreneurship and business development. Ahmed brings a wealth of diverse experience to Exale, spanning numerous critical fields essential for business growth.';

  const philosophyText =
    c.philosophy_full ??
    "Ahmed Khafagy firmly believes that everyone deserves a chance to pursue their entrepreneurial dreams. He champions the idea that the initial spark of excitement that ignites a new venture is a powerful force that must be harnessed and nurtured. This philosophy is the cornerstone of Exale's mission.";

  return (
    <div className="max-w-5xl mx-auto py-12 md:py-24 px-4 sm:px-6 space-y-16 md:space-y-24">
      <section>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-gray-900 tracking-tight leading-tight">
          Our Vision: <br />
          <span className="gradient-text">Your Business, Independent and Thriving</span>
        </h1>
        <div className="glass-panel p-6 sm:p-8 md:p-12 rounded-3xl">
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed">{visionText}</p>
        </div>
      </section>

      <section>
        <h2 className="text-xl sm:text-2xl font-bold mb-5 text-gray-900">
          The Foundation of Exale: <span className="gradient-text">Ahmed Khafagy&apos;s Journey</span>
        </h2>
        <p className="text-gray-600 mb-8 leading-relaxed text-lg">{founderStory}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {SKILLS.map((s) => (
            <div
              key={s.title}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-royal-violet/30 hover:shadow-md transition-all duration-300"
            >
              <h3 className="font-bold text-gray-900">{s.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="bg-exale-dark text-white p-6 sm:p-8 md:p-12 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-royal-violet rounded-full blur-[100px] opacity-30 pointer-events-none" />
          <h2 className="text-xl sm:text-2xl font-bold mb-5 relative z-10">
            Our Philosophy: Unleashing Potential, Sustaining Momentum
          </h2>
          <p className="text-gray-300 leading-relaxed text-lg relative z-10">{philosophyText}</p>
        </div>
      </section>
    </div>
  );
}
