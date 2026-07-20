import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1440px',
    },
    spacing: {
      0: '0px',
      xs: 'var(--space-xs)',
      sm: 'var(--space-sm)',
      md: 'var(--space-md)',
      lg: 'var(--space-lg)',
      xl: 'var(--space-xl)',
      '2xl': 'var(--space-2xl)',
      '3xl': 'var(--space-3xl)',
    },
    borderRadius: {
      none: 'var(--radius-none)',
      sm: 'var(--radius-sm)',
      md: 'var(--radius-md)',
      lg: 'var(--radius-lg)',
      pill: 'var(--radius-pill)',
      full: '9999px',
    },
    fontFamily: {
      sans: ['var(--font-inter)', 'sans-serif'],
      mono: ['var(--font-jetbrains-mono)', 'monospace'],
    },
    fontSize: {
      display: ['28px', { lineHeight: '36px', fontWeight: '600' }],
      'heading-lg': ['20px', { lineHeight: '28px', fontWeight: '600' }],
      'heading-md': ['16px', { lineHeight: '24px', fontWeight: '600' }],
      'body-lg': ['15px', { lineHeight: '22px', fontWeight: '400' }],
      'body-md': ['13px', { lineHeight: '20px', fontWeight: '400' }],
      'body-sm': ['12px', { lineHeight: '16px', fontWeight: '400' }],
      caption: ['11px', { lineHeight: '14px', fontWeight: '500' }],
      'mono-data': ['13px', { lineHeight: '20px', fontWeight: '400' }],
      'mono-lg': ['22px', { lineHeight: '28px', fontWeight: '500' }],
    },
    extend: {
      colors: {
        surface: {
          canvas: 'var(--color-surface-canvas)',
          base: 'var(--color-surface-base)',
          raised: 'var(--color-surface-raised)',
          overlay: 'var(--color-surface-overlay)',
          sunken: 'var(--color-surface-sunken)',
        },
        border: {
          subtle: 'var(--color-border-subtle)',
          default: 'var(--color-border-default)',
          strong: 'var(--color-border-strong)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
          disabled: 'var(--color-text-disabled)',
        },
        brand: {
          50: 'var(--color-brand-50)',
          400: 'var(--color-brand-400)',
          500: 'var(--color-brand-500)',
          600: 'var(--color-brand-600)',
          900: 'var(--color-brand-900)',
        },
        risk: {
          critical: {
            DEFAULT: 'var(--color-risk-critical)',
            bg: 'var(--color-risk-critical-bg)',
            border: 'var(--color-risk-critical-border)',
            text: 'var(--color-risk-critical-text)',
          },
          high: {
            DEFAULT: 'var(--color-risk-high)',
            bg: 'var(--color-risk-high-bg)',
            border: 'var(--color-risk-high-border)',
            text: 'var(--color-risk-high-text)',
          },
          moderate: {
            DEFAULT: 'var(--color-risk-moderate)',
            bg: 'var(--color-risk-moderate-bg)',
            border: 'var(--color-risk-moderate-border)',
            text: 'var(--color-risk-moderate-text)',
          },
          low: {
            DEFAULT: 'var(--color-risk-low)',
            bg: 'var(--color-risk-low-bg)',
            border: 'var(--color-risk-low-border)',
            text: 'var(--color-risk-low-text)',
          },
          neutral: {
            DEFAULT: 'var(--color-risk-neutral)',
            bg: 'var(--color-risk-neutral-bg)',
            border: 'var(--color-risk-neutral-border)',
            text: 'var(--color-risk-neutral-text)',
          },
        },
        viz: {
          1: 'var(--color-viz-1)',
          2: 'var(--color-viz-2)',
          3: 'var(--color-viz-3)',
          4: 'var(--color-viz-4)',
          5: 'var(--color-viz-5)',
          6: 'var(--color-viz-6)',
        },
      },
      boxShadow: {
        'elevation-0': 'none',
        'elevation-1': 'none',
        'elevation-2': '0 2px 8px rgba(0,0,0,0.32)',
        'elevation-3': '0 8px 24px rgba(0,0,0,0.48)',
        'elevation-4': '0 16px 48px rgba(0,0,0,0.56)',
      },
      transitionDuration: {
        instant: '100ms',
        fast: '150ms',
        base: '200ms',
        slow: '300ms',
      },
      transitionTimingFunction: {
        instant: 'ease-out',
        fast: 'ease-out',
        base: 'ease-in-out',
        slow: 'ease-in-out',
      },
    },
  },
  plugins: [],
};
export default config;
