'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { UploadDropzone } from '@/lib/uploadthing';

const inputClass =
  'w-full px-4 py-4 rounded-xl bg-white/80 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-royal-violet focus:ring-2 focus:ring-royal-violet/20 outline-none transition-all duration-200';

export default function ApplyPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    industry: '',
    message: '',
    website: '', // honeypot – leave empty
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          industry: formData.industry,
          message: formData.message,
          fileUrl: fileUrl ?? undefined,
          honeypot: formData.website,
        }),
      });
      if (res.status === 429) {
        setStatus('error');
        return; // Rate limited
      }
      if (!res.ok) throw new Error('Failed');
      setStatus('success');
      setFormData({ name: '', email: '', phone: '', industry: '', message: '', website: '' });
      setFileUrl(null);
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 md:py-24 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
          Let&apos;s build something great.
        </h1>
        <p className="text-gray-600 text-lg leading-relaxed">
          Curious to learn more about how Exale can support your business? Do you have an idea
          you&apos;d like to discuss? We&apos;re eager to connect with you, understand your vision,
          and explore how we can embark on this journey together.
        </p>
      </motion.div>
      <motion.form
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        onSubmit={handleSubmit}
        className="glass-panel p-6 sm:p-8 md:p-10 rounded-3xl space-y-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <input
            type="text"
            placeholder="Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={inputClass}
          />
          <input
            type="email"
            placeholder="Email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={inputClass}
          />
        </div>
        <input
          type="tel"
          placeholder="Phone Number"
          required
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className={inputClass}
        />
        <input
          type="text"
          placeholder="Industry"
          required
          value={formData.industry}
          onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
          className={inputClass}
        />
        <textarea
          placeholder="Tell us about your idea..."
          required
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className={`${inputClass} resize-none`}
        />
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          className="absolute opacity-0 pointer-events-none h-0 w-0"
        />
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Pitch Deck / CV (PDF or Doc)
          </label>
          <UploadDropzone
            endpoint="applyAttachment"
            onClientUploadComplete={(res) => {
              if (res?.[0]?.url) setFileUrl(res[0].url);
            }}
            onUploadError={(error) => {
              console.error(error);
            }}
            appearance={{
              container:
                'ut-flex ut-flex-col ut-items-center ut-justify-center ut-p-8 ut-mt-2 ut-rounded-xl ut-border ut-border-dashed ut-border-gray-200 ut-bg-white/50 ut-cursor-pointer ut-transition-colors hover:ut-border-royal-violet/50',
              label: 'ut-text-gray-600 ut-text-sm',
              button:
                'ut-bg-royal-violet ut-text-white ut-rounded-full ut-px-6 ut-py-2 ut-font-medium ut-cursor-pointer ut-mt-2 ut-transition-opacity hover:ut-opacity-90',
            }}
          />
          {fileUrl && (
            <p className="mt-2 text-sm text-green-600 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              File uploaded successfully
            </p>
          )}
        </div>
        {status === 'success' && (
          <p className="text-green-600 text-sm font-medium">
            Application submitted! We&apos;ll be in touch soon.
          </p>
        )}
        {status === 'error' && (
          <p className="text-red-600 text-sm font-medium">
            Something went wrong. Please try again in a moment.
          </p>
        )}
        <button
          type="submit"
          disabled={status === 'loading'}
          className="btn-primary w-full py-4 text-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? 'Submitting...' : 'Submit Application'}
        </button>
      </motion.form>
      <p className="mt-6 text-center text-sm text-gray-500">
        Prefer to chat first?{' '}
        <Link href="/#contact" className="text-royal-violet font-semibold hover:underline">
          Contact us
        </Link>
      </p>
    </div>
  );
}
