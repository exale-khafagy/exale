'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface ContactFormProps {
  headline: string;
  ctaText: string;
}

const inputClass =
  'p-4 rounded-xl bg-white/70 border border-gray-200/80 text-gray-900 placeholder:text-gray-400 focus:border-royal-violet focus:ring-2 focus:ring-royal-violet/20 outline-none transition-all duration-200';

export function ContactForm({ headline, ctaText }: ContactFormProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    message: '',
    website: '', // honeypot – leave empty
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          company: formData.company,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          concern: formData.company, // API expects concern
          honeypot: formData.website,
        }),
      });
      if (res.status === 429) {
        setStatus('error');
        return; // Rate limited – show generic error
      }
      if (!res.ok) throw new Error('Failed');
      setStatus('success');
      setFormData({ name: '', company: '', email: '', phone: '', message: '', website: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <section
      id="contact"
      className="h-screen min-h-screen snap-start flex flex-col items-center justify-center py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden bg-stone-100"
    >
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/images/contact-background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        aria-hidden
      />
      <div className="absolute inset-0 z-[1] bg-stone-100/55" aria-hidden />
      <motion.h2
        initial={{ opacity: 1, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 relative z-10"
      >
        {headline}
      </motion.h2>
      <motion.p
        initial={{ opacity: 1, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.05 }}
        className="text-gray-600 mb-10 max-w-md text-center relative z-10"
      >
        We&apos;d love to hear from you. Reach out and let&apos;s start a conversation.
      </motion.p>
      <motion.form
        initial={{ opacity: 1, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="glass-panel p-6 sm:p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl w-full max-w-4xl relative z-10"
      >
        <input
          name="name"
          required
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={inputClass}
        />
        <input
          name="concern"
          required
          placeholder="Company or topic of interest"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          className={inputClass}
        />
        <input
          name="email"
          required
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={inputClass}
        />
        <input
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className={inputClass}
        />
        <textarea
          name="message"
          required
          placeholder="Your message"
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className={`${inputClass} md:col-span-2 min-h-[140px] resize-none`}
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
        <div className="md:col-span-2 flex flex-col gap-3 items-end">
          {status === 'success' && (
            <p className="text-green-600 text-sm font-medium w-full flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Message sent! We&apos;ll get back to you soon.
            </p>
          )}
          {status === 'error' && (
            <p className="text-red-600 text-sm font-medium w-full">
              Something went wrong. Please try again in a moment.
            </p>
          )}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="btn-primary w-full md:w-auto px-8 py-3.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? 'Sending...' : ctaText}
          </button>
        </div>
      </motion.form>
    </section>
  );
}
