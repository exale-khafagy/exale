import Link from 'next/link';
import { getContent, contentMap } from '@/lib/api';

const PARTNERS = [
  { name: 'Lighthouse Labs', tag: 'Tech' },
  { name: 'Venture Grove', tag: 'VC' },
  { name: 'Foundry Partners', tag: 'Legal' },
  { name: 'Nimbus Cloud', tag: 'Cloud' },
  { name: 'Arcade Digital', tag: 'Dev' },
  { name: 'Studio Motion', tag: 'Design' },
];

export default async function PartnersPage() {
  let blocks: Awaited<ReturnType<typeof getContent>> = [];
  try {
    blocks = await getContent('partners');
  } catch {}
  const c = contentMap(blocks);

  const intro =
    c.network_text ??
    "Our success is intertwined with yours, and that of our valued network. At Exale, we thrive on creating powerful collaborations. We build partnerships that facilitate seamless execution, enabling the exchange of valuable services and fostering an ecosystem where every entity contributes to collective achievement. We work together, rely on each other, and grow together.";

  return (
    <div className="max-w-6xl mx-auto py-16 md:py-24 px-6">
      <div className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl font-bold mb-5 text-gray-900 tracking-tight">
          {c.network_headline ?? 'Our Network'}
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">{intro}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {PARTNERS.map((p) => (
          <div
            key={p.name}
            className="hover-card glass-panel flex flex-col items-center justify-center p-8 text-center aspect-square"
          >
            <span className="font-bold text-gray-900 text-xl">{p.name}</span>
            <span className="text-xs text-gray-500 mt-2 uppercase tracking-wide">{p.tag}</span>
          </div>
        ))}
      </div>
      <div className="text-center">
        <Link href="/apply" className="btn-primary inline-block px-8 py-3">
          Partner with us
        </Link>
      </div>
    </div>
  );
}
