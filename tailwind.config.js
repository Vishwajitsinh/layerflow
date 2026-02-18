/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#0D0D0F',
          secondary: '#16161A',
          tertiary: '#1E1E24',
        },
        surface: '#26262E',
        border: '#3A3A44',
        primary: '#6366F1',
        secondary: '#22D3EE',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        'text-primary': '#F4F4F5',
        'text-secondary': '#A1A1AA',
        'text-muted': '#71717A',
      },
      fontFamily: {
        sans: ['Geist Sans', 'SF Pro Display', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'SF Mono', 'monospace'],
      },
      fontSize: {
        'heading-1': ['24px', { lineHeight: '1.2', fontWeight: '700' }],
        'heading-2': ['18px', { lineHeight: '1.3', fontWeight: '600' }],
        'heading-3': ['14px', { lineHeight: '1.4', fontWeight: '600' }],
        body: ['13px', { lineHeight: '1.5', fontWeight: '400' }],
        caption: ['11px', { lineHeight: '1.4', fontWeight: '400' }],
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
      },
      boxShadow: {
        panel: '0 4px 24px rgba(0,0,0,0.4)',
        canvas: '0 8px 32px rgba(0,0,0,0.5)',
      },
      transitionDuration: {
        DEFAULT: '150ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'ease-out',
      },
    },
  },
  plugins: [],
};
