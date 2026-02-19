import Image from 'next/image';
import Link from 'next/link';

const footerLinks = [
  { href: '/services', label: 'Services' },
  { href: '/partners', label: 'Partners' },
  { href: '/blog', label: 'Blog' },
  { href: '/media', label: 'Media' },
  { href: '/apply', label: 'Apply' },
];

const legalLinks = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms & Conditions' },
  { href: '/code-of-conduct', label: 'Code of Conduct' },
];

export function Footer() {
  return (
    <footer className="w-full bg-exale-dark text-white py-16 md:py-20 relative overflow-hidden snap-start">
      <div
        className="absolute inset-0 opacity-[0.22] pointer-events-none"
        style={{
          backgroundImage: 'url(/images/footer-background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-exale-dark via-transparent to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-14 relative z-10">
        <div className="flex flex-col items-center md:items-start">
          <Image
            src="/images/exale-logo.png"
            alt="Exale"
            width={100}
            height={34}
            className="h-8 w-auto mb-5 opacity-90"
          />
          <p className="text-gray-500 text-xs leading-relaxed uppercase tracking-[0.2em] font-medium">
            Not every beginning has an ending.
          </p>
        </div>
        <div className="flex flex-col items-center md:items-start space-y-4">
          <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-1">Contact</h4>
          <a
            href="tel:+201010881133"
            className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            +20 101 088 1133
          </a>
          <a
            href="mailto:info@exale.net"
            className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            info@exale.net
          </a>
          <span className="text-gray-500 text-sm">Cairo, Egypt</span>
        </div>
        <div className="flex flex-col items-center md:items-start space-y-4">
          <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-1">Company</h4>
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex flex-col items-center md:items-start space-y-4">
          <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-1">Legal</h4>
          {legalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-12 md:mt-16 pt-6 md:pt-8 border-t border-white/10 relative z-10">
        <p className="text-center text-xs text-gray-600">© 2026 Exale Inc. All rights reserved.</p>
      </div>
    </footer>
  );
}
