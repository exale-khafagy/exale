import { getContent, contentMap } from '@/lib/api';

export default async function ProjectsPage() {
  let blocks: Awaited<ReturnType<typeof getContent>> = [];
  try {
    blocks = await getContent('projects');
  } catch {}
  const c = contentMap(blocks);

  return (
    <div className="max-w-4xl mx-auto py-24 px-6">
      <h1 className="text-5xl font-bold text-white mb-8">
        {c.projects_headline ?? 'Our Projects'}
      </h1>
      <p className="text-white/70 text-lg">
        {c.projects_intro ?? 'Featured projects and case studies. Content coming soon.'}
      </p>
    </div>
  );
}
