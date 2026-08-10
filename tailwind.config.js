/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1rem', sm: '1.5rem', lg: '2rem' },
      screens: { '2xl': '1280px' },
    },
    extend: {
      colors: {
        brand: {
          50: '#f2f0ff',
          100: '#e8e4ff',
          200: '#d4ccff',
          300: '#b5a5ff',
          400: '#9273ff',
          500: '#7440ff',
          600: '#661cf7',
          700: '#570ce0',
          800: '#480dbb',
          900: '#3d0f99',
          950: '#240568',
        },
        accent: {
          50: '#fff8ed',
          100: '#ffefd4',
          200: '#ffdaa8',
          300: '#ffc071',
          400: '#ff9b38',
          500: '#ff7d11',
          600: '#f05f07',
          700: '#c74508',
          800: '#9e370f',
          900: '#7f2f10',
        },
        ink: {
          50: '#f6f6f8',
          100: '#ebebf0',
          200: '#d3d3de',
          300: '#adadc2',
          400: '#8181a1',
          500: '#636386',
          600: '#4f4e6e',
          700: '#413f59',
          800: '#38374b',
          900: '#201f2c',
          950: '#131320',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(19,19,32,.04), 0 8px 24px -12px rgba(19,19,32,.12)',
        card: '0 1px 3px rgba(19,19,32,.06), 0 12px 32px -16px rgba(19,19,32,.24)',
        lift: '0 24px 60px -24px rgba(102,28,247,.35)',
        glow: '0 0 0 1px rgba(116,64,255,.18), 0 18px 50px -20px rgba(116,64,255,.55)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      backgroundImage: {
        'grid-light':
          'linear-gradient(to right, rgba(19,19,32,.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(19,19,32,.055) 1px, transparent 1px)',
        'grid-dark':
          'linear-gradient(to right, rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.06) 1px, transparent 1px)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up .6s cubic-bezier(.16,1,.3,1) both',
        'fade-in': 'fade-in .5s ease both',
        'scale-in': 'scale-in .35s cubic-bezier(.16,1,.3,1) both',
        marquee: 'marquee 38s linear infinite',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 1.6s infinite',
      },
    },
  },
  plugins: [],
}
