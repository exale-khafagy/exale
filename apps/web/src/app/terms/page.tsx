import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Exale',
  description: 'Terms and conditions for using Exale services.',
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto py-16 md:py-24 px-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Terms & Conditions</h1>
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          By using Exale&apos;s services and website, you agree to these terms and conditions.
        </p>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">Use of Services</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          You agree to use our services in compliance with applicable laws and in a manner that
          does not infringe the rights of others.
        </p>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">Contact</h2>
        <p className="text-gray-600 dark:text-gray-400">
          For questions about these terms, contact us through the form on our website.
        </p>
      </div>
    </div>
  );
}
