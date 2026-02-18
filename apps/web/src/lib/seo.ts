import { getContent, contentMap } from './api';

const DEFAULT_META: Record<string, { title: string; description: string }> = {
  home: { title: 'Exale — Not Every Beginning Has An Ending', description: 'Business development holding company. We help bring your vision to life.' },
  apply: { title: 'Apply | Exale', description: 'Submit your application to partner with Exale.' },
  services: { title: 'Services | Exale', description: 'Web development, strategic planning, branding and design.' },
  projects: { title: 'Projects | Exale', description: 'Explore our work and partnerships.' },
  partners: { title: 'Partners | Exale', description: 'Our network of trusted partners.' },
  media: { title: 'Media Center | Exale', description: 'Press releases, brand assets, and coverage.' },
  blog: { title: 'Insights & Stories | Exale', description: 'How to unleash your potential.' },
};

export type SeoPage = keyof typeof DEFAULT_META;

export async function getSeoMetadata(page: SeoPage) {
  const defaults = DEFAULT_META[page];
  if (!defaults) return { title: 'Exale', description: 'Business development holding company.' };

  try {
    const blocks = await getContent('seo');
    const c = contentMap(blocks);
    const title = c[`seo_${page}_title`] || defaults.title;
    const description = c[`seo_${page}_description`] || defaults.description;
    const ogImage = c[`seo_${page}_og_image`];

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        ...(ogImage && { images: [ogImage] }),
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
    };
  } catch {
    return {
      title: defaults.title,
      description: defaults.description,
    };
  }
}
