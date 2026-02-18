import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const contentBlocks = [
  // HOME SECTION - Content used on the homepage
  { key: 'hero_headline', value: 'Not Every Beginning Has An Ending', type: 'text' as const, section: 'home' },
  { key: 'hero_subheadline', value: 'Ready to take your first step?', type: 'text' as const, section: 'home' },
  { key: 'about_ready_text', value: 'Do you have a groundbreaking idea waiting to be unleashed? At Exale, we specialize in helping individuals like you bring their vision to life. From the moment you connect with us, we listen attentively, understand the core of your idea, and work to identify and resolve any challenges you face. Your entrepreneurial journey begins here.', type: 'rich_text' as const, section: 'home' },
  { key: 'about_cta_text', value: 'Start Your Journey', type: 'text' as const, section: 'home' },
  { key: 'partners_headline', value: 'Those we rely on.', type: 'text' as const, section: 'home' },
  { key: 'partners_text', value: 'Our success is intertwined with yours. We build partnerships that facilitate seamless execution.', type: 'rich_text' as const, section: 'home' },
  { key: 'partners_cta', value: 'View All Partners', type: 'text' as const, section: 'home' },
  { key: 'philosophy_headline', value: 'You take a step; We take you a mile.', type: 'text' as const, section: 'home' },
  { key: 'philosophy_text', value: "Your ambition drives us. We believe in fostering long-term partnerships built on mutual trust and shared success. Unlike traditional models, we're invested in your journey, offering proper solutions and guidance without necessarily charging for our services. We become your dedicated partner, collaborating on every decision and ensuring your business achieves independence and sustained growth. Together, we turn vision into reality, mile after mile.", type: 'rich_text' as const, section: 'home' },
  { key: 'contact_headline', value: 'Got Any Questions?', type: 'text' as const, section: 'home' },
  { key: 'contact_cta', value: 'Send Message', type: 'text' as const, section: 'home' },
  { key: 'vision_headline', value: "Our Vision: Your Business, Independent and Thriving", type: 'text' as const, section: 'home' },
  { key: 'vision_text', value: "At Exale, we are dedicated to guiding you throughout your entrepreneurial journey, from inception to achieving complete business independence. We view ourselves as your committed partner, fostering a relationship built on mutual reliance and collaborative decision-making every step of the way. We believe that every great idea deserves the chance to flourish, and every entrepreneur deserves unwavering support to navigate the complexities of building a successful business.", type: 'rich_text' as const, section: 'home' },
  { key: 'founder_story', value: "Exale was founded in Cairo, Egypt, in 2025, by Ahmed Khafagy, a visionary with a deep-seated passion for entrepreneurship and business development. Ahmed brings a wealth of diverse experience to Exale, spanning numerous critical fields essential for business growth. His practical approach is rooted in direct experience, having successfully executed three different startups.", type: 'rich_text' as const, section: 'home' },
  { key: 'philosophy_full', value: "Ahmed Khafagy firmly believes that everyone deserves a chance to pursue their entrepreneurial dreams. He champions the idea that the initial spark of excitement that ignites a new venture is a powerful force that must be harnessed and nurtured, rather than allowed to settle. This philosophy is the cornerstone of Exale's mission: to empower entrepreneurs to not just start, but to sustain and scale their businesses, ensuring that the initial enthusiasm translates into lasting independence and success. We are here to ensure that your journey is not just begun, but completed with strength and autonomy.", type: 'rich_text' as const, section: 'home' },
  { key: 'footer_cta_headline', value: "Let's build something great.", type: 'text' as const, section: 'home' },
  { key: 'footer_cta_text', value: "Curious to learn more about how Exale can support your business? Do you have an idea you'd like to discuss? We're eager to connect with you, understand your vision, and explore how we can embark on this journey together. Reach out to us today!", type: 'rich_text' as const, section: 'home' },
  { key: 'footer_cta_button', value: 'Submit Application', type: 'text' as const, section: 'home' },

  // SERVICES SECTION - Content for /services page
  { key: 'services_headline', value: 'Our Services', type: 'text' as const, section: 'services' },
  { key: 'services_intro', value: 'We provide tailored solutions to ensure your business achieves independence and sustained growth.', type: 'rich_text' as const, section: 'services' },
  { key: 'services_cta_text', value: 'Start Your Journey', type: 'text' as const, section: 'services' },
  { key: 'service_1_title', value: 'Web & App Development', type: 'text' as const, section: 'services' },
  { key: 'service_1_desc', value: 'Full stack development built for scale. We create robust digital experiences that serve as the foundation of your business.', type: 'rich_text' as const, section: 'services' },
  { key: 'service_1_icon', value: '💻', type: 'text' as const, section: 'services' },
  { key: 'service_2_title', value: 'Strategic Planning', type: 'text' as const, section: 'services' },
  { key: 'service_2_desc', value: 'Business planning and market fit analysis. We help you navigate the complexities of the market with data-driven strategies.', type: 'rich_text' as const, section: 'services' },
  { key: 'service_2_icon', value: '🎯', type: 'text' as const, section: 'services' },
  { key: 'service_3_title', value: 'Branding & Design', type: 'text' as const, section: 'services' },
  { key: 'service_3_desc', value: 'Identity, Design & Storytelling. We craft compelling visual narratives that resonate with your target audience.', type: 'rich_text' as const, section: 'services' },
  { key: 'service_3_icon', value: '✨', type: 'text' as const, section: 'services' },
  { key: 'service_4_title', value: '', type: 'text' as const, section: 'services' },
  { key: 'service_4_desc', value: '', type: 'rich_text' as const, section: 'services' },
  { key: 'service_4_icon', value: '', type: 'text' as const, section: 'services' },
  { key: 'service_5_title', value: '', type: 'text' as const, section: 'services' },
  { key: 'service_5_desc', value: '', type: 'rich_text' as const, section: 'services' },
  { key: 'service_5_icon', value: '', type: 'text' as const, section: 'services' },

  // PARTNERS SECTION - Content for /partners page
  { key: 'network_headline', value: 'Our Network', type: 'text' as const, section: 'partners' },
  { key: 'network_text', value: "Our success is intertwined with yours, and that of our valued network. At Exale, we thrive on creating powerful collaborations. We build partnerships that facilitate seamless execution, enabling the exchange of valuable services and fostering an ecosystem where every entity contributes to collective achievement. We work together, rely on each other, and grow together.", type: 'rich_text' as const, section: 'partners' },
  { key: 'partners_cta_text', value: 'Partner with us', type: 'text' as const, section: 'partners' },
  { key: 'partner_1_name', value: '', type: 'text' as const, section: 'partners' },
  { key: 'partner_1_tag', value: '', type: 'text' as const, section: 'partners' },
  { key: 'partner_1_logo', value: '', type: 'image' as const, section: 'partners' },
  { key: 'partner_2_name', value: '', type: 'text' as const, section: 'partners' },
  { key: 'partner_2_tag', value: '', type: 'text' as const, section: 'partners' },
  { key: 'partner_2_logo', value: '', type: 'image' as const, section: 'partners' },
  { key: 'partner_3_name', value: '', type: 'text' as const, section: 'partners' },
  { key: 'partner_3_tag', value: '', type: 'text' as const, section: 'partners' },
  { key: 'partner_3_logo', value: '', type: 'image' as const, section: 'partners' },

  // MEDIA SECTION - Content for /media page
  { key: 'media_headline', value: 'Media Center', type: 'text' as const, section: 'media' },
  { key: 'media_subtext', value: 'Press releases, brand assets, and coverage.', type: 'text' as const, section: 'media' },
  { key: 'media_item_1_label', value: 'Press Release #1 (Coming Soon)', type: 'text' as const, section: 'media' },
  { key: 'media_item_1_image', value: '', type: 'image' as const, section: 'media' },
  { key: 'media_item_2_label', value: 'Brand Assets', type: 'text' as const, section: 'media' },
  { key: 'media_item_2_image', value: '', type: 'image' as const, section: 'media' },
  { key: 'media_item_3_label', value: 'Gallery', type: 'text' as const, section: 'media' },
  { key: 'media_item_3_image', value: '', type: 'image' as const, section: 'media' },
  { key: 'media_item_4_label', value: '', type: 'text' as const, section: 'media' },
  { key: 'media_item_4_image', value: '', type: 'image' as const, section: 'media' },
  { key: 'media_item_5_label', value: '', type: 'text' as const, section: 'media' },
  { key: 'media_item_5_image', value: '', type: 'image' as const, section: 'media' },

  // BLOG SECTION - Content for /blog page
  { key: 'blog_headline', value: 'Insights & Stories', type: 'text' as const, section: 'blog' },
  { key: 'blog_subheadline', value: 'How to Unleash Your Potential', type: 'text' as const, section: 'blog' },
  { key: 'blog_teaser', value: 'The journey of a thousand miles begins with a single step. Stay tuned.', type: 'rich_text' as const, section: 'blog' },
  { key: 'blog_label', value: 'Entrepreneurship', type: 'text' as const, section: 'blog' },
  { key: 'blog_post_1_title', value: '', type: 'text' as const, section: 'blog' },
  { key: 'blog_post_1_content', value: '', type: 'rich_text' as const, section: 'blog' },
  { key: 'blog_post_1_image', value: '', type: 'image' as const, section: 'blog' },
  { key: 'blog_post_1_author', value: '', type: 'text' as const, section: 'blog' },
  { key: 'blog_post_1_date', value: '', type: 'text' as const, section: 'blog' },
  { key: 'blog_post_2_title', value: '', type: 'text' as const, section: 'blog' },
  { key: 'blog_post_2_content', value: '', type: 'rich_text' as const, section: 'blog' },
  { key: 'blog_post_2_image', value: '', type: 'image' as const, section: 'blog' },
  { key: 'blog_post_2_author', value: '', type: 'text' as const, section: 'blog' },
  { key: 'blog_post_2_date', value: '', type: 'text' as const, section: 'blog' },

  // PROJECTS SECTION - Content for /projects page
  { key: 'projects_headline', value: 'Our Projects', type: 'text' as const, section: 'projects' },
  { key: 'projects_intro', value: 'Featured projects and case studies. Content coming soon.', type: 'rich_text' as const, section: 'projects' },
  { key: 'project_1_title', value: '', type: 'text' as const, section: 'projects' },
  { key: 'project_1_description', value: '', type: 'rich_text' as const, section: 'projects' },
  { key: 'project_1_image', value: '', type: 'image' as const, section: 'projects' },
  { key: 'project_1_link', value: '', type: 'text' as const, section: 'projects' },
  { key: 'project_2_title', value: '', type: 'text' as const, section: 'projects' },
  { key: 'project_2_description', value: '', type: 'rich_text' as const, section: 'projects' },
  { key: 'project_2_image', value: '', type: 'image' as const, section: 'projects' },
  { key: 'project_2_link', value: '', type: 'text' as const, section: 'projects' },
  { key: 'project_3_title', value: '', type: 'text' as const, section: 'projects' },
  { key: 'project_3_description', value: '', type: 'rich_text' as const, section: 'projects' },
  { key: 'project_3_image', value: '', type: 'image' as const, section: 'projects' },
  { key: 'project_3_link', value: '', type: 'text' as const, section: 'projects' },
];

async function main() {
  for (const block of contentBlocks) {
    await prisma.contentBlock.upsert({
      where: { key: block.key },
      create: block,
      update: { value: block.value, type: block.type, section: block.section },
    });
  }
  console.log(`Seeded ${contentBlocks.length} content blocks.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
