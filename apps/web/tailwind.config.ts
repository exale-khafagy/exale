import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        xs: '480px',
      },
      colors: {
        background: '#F8F9FB',
        'exale-dark': '#0E0E12',
        'royal-violet': '#6A4DFF',
        violet: '#6A4DFF',
        accent: '#6A4DFF',
      },
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'ui-serif', 'serif'],
        mono: ['ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(180deg, rgba(106,77,255,0.08) 0%, transparent 50%, rgba(0,0,0,0.3) 100%)',
        'hero-glow': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(106,77,255,0.25), transparent)',
      },
      boxShadow: {
        'glow-violet': '0 0 40px rgba(106, 77, 255, 0.25)',
        'glow-violet-lg': '0 0 60px rgba(106, 77, 255, 0.3)',
        'glass': '0 2px 12px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
        'glass-hover': '0 12px 40px -8px rgba(106, 77, 255, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.6) inset',
        'card': '0 1px 3px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 8px 30px -6px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        'panel': '1.25rem',
        'button': '0.75rem',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
};

export default config;
