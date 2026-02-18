import { getSeoMetadata } from '@/lib/seo';

export async function generateMetadata() {
  const meta = await getSeoMetadata('services');
  return {
    title: meta.title,
    description: meta.description,
    openGraph: meta.openGraph,
    twitter: meta.twitter,
  };
}

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
