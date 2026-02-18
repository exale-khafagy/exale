import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://exale.net';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/hub', '/profile', '/api/'] },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
