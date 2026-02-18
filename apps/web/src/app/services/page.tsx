import Link from 'next/link';
import { getContent, contentMap } from '@/lib/api';

const SERVICES = [
  {
    icon: '💻',
    titleKey: 'service_1_title' as const,
    descKey: 'service_1_desc' as const,
    title: 'Web & App Development',
    desc: 'Full stack development built for scale. We create robust digital experiences that serve as the foundation of your business.',
  },
  {
    icon: '🎯',
    titleKey: 'service_2_title' as const,
    descKey: 'service_2_desc' as const,
    title: 'Strategic Planning',
    desc: 'Business planning and market fit analysis. We help you navigate the complexities of the market with data-driven strategies.',
  },
  {
    icon: '✨',
    titleKey: 'service_3_title' as const,
    descKey: 'service_3_desc' as const,
    title: 'Branding & Design',
    desc: 'Identity, Design & Storytelling. We craft compelling visual narratives that resonate with your target audience.',
  },
];

export default async function ServicesPage() {
  let blocks: Awaited<ReturnType<typeof getContent>> = [];
  try {
    blocks = await getContent('services');
  } catch {}
  const c = contentMap(blocks);

  return (
    <div className="max-w-6xl mx-auto py-16 md:py-24 px-6">
      <div className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900 tracking-tight">
          {c.services_headline ?? 'Our Services'}
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
          {c.services_intro ?? 'We provide tailored solutions to ensure your business achieves independence and sustained growth.'}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {SERVICES.map((s) => (
          <div
            key={s.title}
            className="hover-card bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="w-14 h-14 bg-royal-violet/10 rounded-xl flex items-center justify-center mb-6 text-2xl">
              {s.icon}
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              {(c as Record<string, string | undefined>)[s.titleKey] ?? s.title}
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              {(c as Record<string, string | undefined>)[s.descKey] ?? s.desc}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-16 text-center">
        <Link href="/apply" className="btn-primary inline-block px-8 py-3">
          Start Your Journey
        </Link>
      </div>
    </div>
  );
}
