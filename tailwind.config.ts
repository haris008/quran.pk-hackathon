import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* ── Core backgrounds ── */
        bg:       'var(--bg)',
        surface:  'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
        hovr:     'var(--bg-hover)',

        /* Legacy bg aliases used by existing components */
        'bg-surface':  'var(--bg-surface)',
        'bg-elevated': 'var(--bg-elevated)',
        'bg-hover':    'var(--bg-hover)',

        /* ── Accent colors ── */
        teal: {
          DEFAULT: 'var(--teal)',
          d:       'var(--teal-dim)',
          b:       'var(--teal-border)',
          dim:     'var(--teal-dim)',
          border:  'var(--teal-border)',
        },
        blue: {
          DEFAULT: 'var(--blue)',
          d:       'var(--blue-dim)',
          b:       'var(--blue-border)',
          dim:     'var(--blue-dim)',
          border:  'var(--blue-border)',
          active:  'var(--blue)',
        },

        /* ── Text colors ── */
        t1: 'var(--text-1)',
        t2: 'var(--text-2)',
        t3: 'var(--text-3)',

        /* Legacy text aliases */
        'text-primary':   'var(--text-1)',
        'text-secondary': 'var(--text-2)',
        'text-muted':     'var(--text-3)',

        /* ── Borders ── */
        brd:   'var(--border)',
        'brd-h': 'var(--border-h)',

        /* Legacy border aliases */
        border:         'var(--border)',
        'border-hover': 'var(--border-h)',
      },
      fontFamily: {
        sans:   ['Figtree', 'Inter', 'sans-serif'],
        arabic: ['UthmanicHafs', 'Scheherazade New', 'serif'],
      },
      animation: {
        blink:   'blink 1.2s ease-in-out infinite',
        fadein:  'fadeIn 0.3s ease',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.35' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
