import { getContent, contentMap } from '@/lib/api';

const ITEMS = [
  { label: 'Press Release #1 (Coming Soon)' },
  { label: 'Brand Assets' },
  { label: 'Gallery' },
];

export default async function MediaPage() {
  let blocks: Awaited<ReturnType<typeof getContent>> = [];
  try {
    blocks = await getContent('media');
  } catch {}
  const c = contentMap(blocks);

  return (
    <div className="max-w-6xl mx-auto py-12 md:py-24 px-4 sm:px-6">
      <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900 tracking-tight">
        {c.media_headline ?? 'Media Center'}
      </h1>
      <p className="text-gray-600 mb-12 text-lg">
        {(c as Record<string, string | undefined>).media_subtext ?? 'Press releases, brand assets, and coverage.'}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {ITEMS.map((item) => (
          <div
            key={item.label}
            className="aspect-video bg-white rounded-2xl flex items-center justify-center border border-gray-200 shadow-sm hover:border-royal-violet/30 hover:shadow-lg hover:shadow-royal-violet/5 transition-all duration-300"
          >
            <span className="text-gray-400 font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
