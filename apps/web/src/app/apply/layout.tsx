import { getSeoMetadata } from '@/lib/seo';

export async function generateMetadata() {
  const meta = await getSeoMetadata('apply');
  return {
    title: meta.title,
    description: meta.description,
    openGraph: meta.openGraph,
    twitter: meta.twitter,
  };
}

export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
