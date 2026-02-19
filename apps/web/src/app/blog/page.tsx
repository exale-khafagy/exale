import { getContent, contentMap } from '@/lib/api';

export default async function BlogPage() {
  let blocks: Awaited<ReturnType<typeof getContent>> = [];
  try {
    blocks = await getContent('blog');
  } catch {}
  const c = contentMap(blocks);

  return (
    <div className="max-w-4xl mx-auto py-12 md:py-24 px-4 sm:px-6">
      <h1 className="text-3xl md:text-4xl font-bold mb-10 text-gray-900 tracking-tight">
        {c.blog_headline ?? 'Insights & Stories'}
      </h1>
      <article className="hover-card bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="aspect-video w-full bg-gray-100 rounded-xl mb-6 flex items-center justify-center text-gray-300">
          Image Placeholder
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
          <span className="text-royal-violet font-bold uppercase tracking-wide">
            {c.blog_label ?? 'Entrepreneurship'}
          </span>
          <span>•</span>
          <span>Coming Soon</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {c.blog_subheadline ?? 'How to Unleash Your Potential'}
        </h2>
        <p className="text-gray-600 leading-relaxed">
          {c.blog_teaser ?? 'The journey of a thousand miles begins with a single step. Stay tuned.'}
        </p>
      </article>
    </div>
  );
}
