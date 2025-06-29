import type { Config } from 'tailwindcss';

// Declare require for TypeScript to recognize it in this context
declare var require: any;

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* ---------- BRAND COLORS ---------- */
        primary: {
          light: '#ff7a33',   // hover / gradient-start
          DEFAULT: '#ff5800', // main brand color
          dark: '#cc4700',    // focus-ring / dark-mode
        },
        secondary: {
          light: '#f0abfc', // fuchsia-300
          DEFAULT: '#e879f9', // fuchsia-400
          dark: '#d946ef', // fuchsia-500
        },

        /* ---------- NEUTRALS ---------- */
        neutral: {
          50: '#f8fafc',  // slate-50
          100: '#f1f5f9', // slate-100
          200: '#e2e8f0', // slate-200
          300: '#cbd5e1', // slate-300
          400: '#94a3b8', // slate-400
          500: '#64748b', // slate-500
          600: '#475569', // slate-600
          700: '#334155', // slate-700
          800: '#1e293b', // slate-800
          900: '#0f172a', // slate-900
          950: '#020617', // slate-950
        },

        /* ---------- STATUS COLORS ---------- */
        success: '#22c55e', // green-500
        error: '#ef4444',   // red-500
        warning: '#f97316', // orange-500
      },

      /* ---------- RADII & SHADOWS ---------- */
      borderRadius: {
        xl: '0.75rem',  // 12px
        '2xl': '1rem',  // 16px
        '3xl': '1.5rem', // 24px
      },
      boxShadow: {
        'top-lg':
          '0 -10px 15px -3px rgb(0 0 0 / 0.1), 0 -4px 6px -4px rgb(0 0 0 / 0.1)',
        'top-md':
          '0 -4px 6px -1px rgb(0 0 0 / 0.1), 0 -2px 4px -2px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

export default config;