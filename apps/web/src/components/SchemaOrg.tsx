const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://exale.net';

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Exale',
      url: SITE_URL,
      description: 'Business development holding company. We help bring your vision to life.',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/images/exale-logo.png` },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Exale',
      description: 'Not every beginning has an ending.',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
  ],
};

export function SchemaOrg() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
