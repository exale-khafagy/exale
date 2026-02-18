import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Exale',
  description: 'Privacy policy for Exale. How we use cookies and handle your data.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-16 md:py-24 px-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Privacy Policy</h1>
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Exale (&quot;we&quot;, &quot;our&quot;) respects your privacy. This policy describes how we collect,
          use, and protect your information.
        </p>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">Cookies</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          We use cookies and similar technologies to improve your experience and analyze site traffic.
          By accepting cookies, you consent to analytics (e.g. Google Analytics) to understand how
          visitors use our site.
        </p>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">Data We Collect</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          When you contact us or submit an application, we collect the information you provide
          (name, email, phone, message, etc.) to respond and improve our services.
        </p>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">Contact</h2>
        <p className="text-gray-600 dark:text-gray-400">
          For questions about this policy, contact us through the form on our website.
        </p>
      </div>
    </div>
  );
}
