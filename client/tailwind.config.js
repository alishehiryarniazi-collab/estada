/**
 * Estada design system — encoded as Tailwind theme tokens.
 * Colours from Section 3.2, typography from Section 3.3.
 * Using semantic names (primary / accent / cta) so components read clearly
 * and we never hardcode hex values in JSX.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolve paths relative to THIS file, not the current working directory, so
// Tailwind finds our templates no matter where the dev server is launched from.
const dir = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('tailwindcss').Config} */
export default {
  content: [path.join(dir, 'index.html'), path.join(dir, 'src/**/*.{ts,tsx}')],
  theme: {
    extend: {
      colors: {
        // Deep Navy — buttons, headers, active nav, logo
        primary: {
          DEFAULT: '#0F2A47',
          light: '#1B3E63',
          dark: '#0A1E33',
        },
        // Forest Green — reserved ONLY for trust / verification signals
        verify: {
          DEFAULT: '#1D6E4F',
          light: '#E4F1EB',
        },
        // Coral — the single most important CTA per screen (used sparingly)
        cta: {
          DEFAULT: '#D85A30',
          hover: '#C24A24',
        },
        // Neutrals
        surface: '#FFFFFF', // cards, modals
        canvas: '#FAFAF8', // page background (off-white)
        ink: {
          DEFAULT: '#1A1A1A', // primary text (charcoal)
          muted: '#6B6B66', // secondary text
        },
        hairline: '#E5E4DE', // borders, dividers
      },
      fontFamily: {
        // Serif for headings — trust, tradition, stability
        heading: ['Fraunces', 'Playfair Display', 'Georgia', 'serif'],
        // Sans for body / UI
        sans: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Heading scale from Section 3.3
        h1: ['32px', { lineHeight: '1.2', fontWeight: '600' }],
        h2: ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        h3: ['18px', { lineHeight: '1.4', fontWeight: '500' }],
        body: ['16px', { lineHeight: '1.6' }],
      },
      borderRadius: {
        card: '12px',
      },
      boxShadow: {
        // Subtle — only meant for hover states on cards (Section 3.6)
        card: '0 1px 2px rgba(15, 42, 71, 0.04)',
        'card-hover': '0 6px 20px rgba(15, 42, 71, 0.10)',
      },
      transitionDuration: {
        // Micro-interactions: 150-250ms max (Section 3.6)
        DEFAULT: '200ms',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 250ms ease-out both',
      },
    },
  },
  plugins: [],
};
