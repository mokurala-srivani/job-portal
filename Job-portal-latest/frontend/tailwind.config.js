/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
      colors: {
        brand: {
          50: '#f3f1ff',
          100: '#e9e5ff',
          200: '#d6cfff',
          300: '#b8acff',
          400: '#9582ff',
          500: '#7c5cff',
          600: '#6a3dff',
          700: '#5a2be0',
          800: '#4a23b8',
          900: '#2e1572',
        },
        ink: {
          50:  '#f8fafc',
          100: '#eef2f7',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0b1220',
          950: '#070a14',
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -12px rgba(15,23,42,0.12)',
        glow: '0 10px 40px -10px rgba(106, 61, 255, 0.45)',
        'glow-lg': '0 20px 60px -15px rgba(106, 61, 255, 0.55)',
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255,255,255,0.6)',
      },
      keyframes: {
        'fade-in': { '0%': { opacity: 0, transform: 'translateY(4px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        'slide-up': { '0%': { opacity: 0, transform: 'translateY(12px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        'pulse-slow': { '0%,100%': { opacity: 0.5 }, '50%': { opacity: 1 } },
        'float': { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        'shimmer': { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        'gradient-x': { '0%,100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
        'blob': {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '33%': { transform: 'translate(30px,-20px) scale(1.1)' },
          '66%': { transform: 'translate(-20px,20px) scale(0.95)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 250ms ease-out',
        'slide-up': 'slide-up 350ms ease-out',
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'gradient-x': 'gradient-x 8s ease infinite',
        'blob': 'blob 14s ease-in-out infinite',
      },
      backgroundImage: {
        'grid-slate': "linear-gradient(to right, rgba(15,23,42,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.05) 1px, transparent 1px)",
        'mesh-light': "radial-gradient(at 12% 18%, rgba(124,92,255,0.18) 0px, transparent 50%), radial-gradient(at 88% 12%, rgba(99,102,241,0.18) 0px, transparent 50%), radial-gradient(at 76% 88%, rgba(236,72,153,0.14) 0px, transparent 50%), radial-gradient(at 18% 84%, rgba(56,189,248,0.16) 0px, transparent 50%)",
      },
    },
  },
  plugins: [],
};
