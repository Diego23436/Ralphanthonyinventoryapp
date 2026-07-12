/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Design tokens derived from the Ralph Anthony logo
        clay: {
          50: '#FAF3EA',
          100: '#F1E1CB',
          200: '#E2C39C',
          300: '#D1A56E',
          400: '#B98A4C',
          500: '#A0723A',
          600: '#835A2C',
          700: '#664522',
          800: '#4A311A',
          900: '#2F1F11',
        },
        ink: {
          50: '#F4F5F6',
          100: '#E4E6E8',
          200: '#C3C8CC',
          300: '#9AA1A8',
          400: '#6B7278',
          500: '#494F54',
          600: '#363B3F',
          700: '#282C2F',
          800: '#1C1F21',
          900: '#121415',
        },
        surface: {
          light: '#FBF9F6',
          card: '#FFFFFF',
          dark: '#15171A',
          darkcard: '#1D2023',
        },
        status: {
          healthy: '#3F7D5C',
          watch: '#C98A3B',
          low: '#B3462C',
        },
      },
      fontFamily: {
        display: ['"Sora"', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        'roof-rise': {
          '0%': { transform: 'translateY(18px) scale(0.92)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        'fade-up': {
          '0%': { transform: 'translateY(14px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'grid-drift': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '64px 64px' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(160,114,58,0.35)' },
          '100%': { boxShadow: '0 0 0 14px rgba(160,114,58,0)' },
        },
      },
      animation: {
        'roof-rise': 'roof-rise 1.1s cubic-bezier(0.16,1,0.3,1) both',
        'fade-up': 'fade-up 0.8s cubic-bezier(0.16,1,0.3,1) both',
        'grid-drift': 'grid-drift 26s linear infinite',
        'pulse-ring': 'pulse-ring 2.2s cubic-bezier(0.4,0,0.6,1) infinite',
      },
    },
  },
  plugins: [],
}
