import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Code of Conduct | Exale',
  description: 'Code of conduct for Exale partners and community.',
};

export default function CodeOfConductPage() {
  return (
    <div className="max-w-3xl mx-auto py-16 md:py-24 px-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Code of Conduct</h1>
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Exale is committed to fostering a respectful and inclusive environment for all partners,
          clients, and team members.
        </p>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">Our Values</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          We expect integrity, professionalism, and mutual respect in all interactions. Harassment,
          discrimination, or inappropriate conduct will not be tolerated.
        </p>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">Contact</h2>
        <p className="text-gray-600 dark:text-gray-400">
          To report a concern, contact us through the form on our website.
        </p>
      </div>
    </div>
  );
}
