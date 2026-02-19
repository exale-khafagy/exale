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
    <footer className="w-full bg-exale-dark text-white py-20 md:py-24 relative overflow-hidden snap-start">
      <div
        className="absolute inset-0 opacity-[0.18] pointer-events-none"
        style={{
          backgroundImage: 'url(/images/footer-background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-exale-dark via-exale-dark/80 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-16 relative z-10">
        <div className="flex flex-col items-center md:items-start">
          <Image
            src="/images/exale-logo.png"
            alt="Exale"
            width={100}
            height={34}
            className="h-9 w-auto mb-6 opacity-95"
          />
          <p className="text-white/50 text-xs leading-relaxed uppercase tracking-[0.22em] font-medium max-w-[200px] md:max-w-none text-center md:text-left">
            Not every beginning has an ending.
          </p>
        </div>
        <div className="flex flex-col items-center md:items-start space-y-4">
          <h4 className="font-bold text-white text-xs uppercase tracking-[0.2em] mb-2">Contact</h4>
          <a href="tel:+201010881133" className="text-white/60 hover:text-white transition-colors text-sm">
            +20 101 088 1133
          </a>
          <a href="mailto:info@exale.net" className="text-white/60 hover:text-white transition-colors text-sm">
            info@exale.net
          </a>
          <span className="text-white/40 text-sm">Cairo, Egypt</span>
        </div>
        <div className="flex flex-col items-center md:items-start space-y-4">
          <h4 className="font-bold text-white text-xs uppercase tracking-[0.2em] mb-2">Company</h4>
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-white/60 hover:text-white transition-colors text-sm">
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex flex-col items-center md:items-start space-y-4">
          <h4 className="font-bold text-white text-xs uppercase tracking-[0.2em] mb-2">Legal</h4>
          {legalLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-white/60 hover:text-white transition-colors text-sm">
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 md:mt-20 pt-8 border-t border-white/[0.08] relative z-10">
        <p className="text-center text-xs text-white/40">© 2026 Exale. All rights reserved.</p>
      </div>
    </footer>
  );
}
