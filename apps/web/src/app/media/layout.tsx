import { getSeoMetadata } from '@/lib/seo';

export async function generateMetadata() {
  const meta = await getSeoMetadata('media');
  return {
    title: meta.title,
    description: meta.description,
    openGraph: meta.openGraph,
    twitter: meta.twitter,
  };
}

export default function MediaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
