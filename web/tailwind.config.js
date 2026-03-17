/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          dark: '#1D4ED8',
        },
        navy: {
          DEFAULT: '#0F172A',
          mid: '#1E293B',
        },
        ai: {
          purple: '#7C3AED',
          pink: '#EC4899',
        },
        success: '#16A34A',
        warning: '#FBBF24',
        surface: '#F8FAFC',
        muted: '#64748B',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      borderRadius: {
        pill: '999px',
      },
      minHeight: {
        touch: '48px',
        'touch-sm': '44px',
      },
      minWidth: {
        touch: '48px',
      },
    },
  },
  plugins: [],
}
