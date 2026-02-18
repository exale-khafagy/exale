import { getContent, contentMap } from '@/lib/api';
import { getSeoMetadata } from '@/lib/seo';
import { Hero } from '@/components/landing/Hero';
import { AboutCta } from '@/components/landing/AboutCta';
import { PartnersTeaser } from '@/components/landing/PartnersTeaser';
import { Philosophy } from '@/components/landing/Philosophy';
import { ContactForm } from '@/components/landing/ContactForm';

export async function generateMetadata() {
  const meta = await getSeoMetadata('home');
  return {
    title: meta.title,
    description: meta.description,
    openGraph: meta.openGraph,
    twitter: meta.twitter,
  };
}

export default async function HomePage() {
  let blocks: Awaited<ReturnType<typeof getContent>> = [];
  try {
    blocks = await getContent('home');
  } catch {
    // fallback
  }
  const c = contentMap(blocks);

  return (
    <>
      <Hero />
      <AboutCta />
      <PartnersTeaser />
      <Philosophy />
      <ContactForm
        headline={c.contact_headline ?? 'Got Any Questions?'}
        ctaText={c.contact_cta ?? 'Send Message'}
      />
    </>
  );
}
