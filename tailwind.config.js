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
        // Midnight blue — 800 is midnight blue proper (#191970).
        brand: {
          50: '#f0f3fb',
          100: '#dee5f6',
          200: '#c2cfec',
          300: '#99ade0',
          400: '#6b83cd',
          500: '#4a61b6',
          600: '#384a9a',
          700: '#2c397a',
          800: '#191970',
          900: '#151550',
          950: '#0b0b2e',
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
        lift: '0 24px 60px -24px rgba(25,25,112,.45)',
        glow: '0 0 0 1px rgba(74,97,182,.18), 0 18px 50px -20px rgba(25,25,112,.6)',
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
        // Mobile nav wipes open from the burger button in the top-right corner.
        'circle-in': {
          '0%': { clipPath: 'circle(0% at calc(100% - 2.75rem) 2.5rem)' },
          '100%': { clipPath: 'circle(150% at calc(100% - 2.75rem) 2.5rem)' },
        },
        'circle-out': {
          '0%': { clipPath: 'circle(150% at calc(100% - 2.75rem) 2.5rem)' },
          '100%': { clipPath: 'circle(0% at calc(100% - 2.75rem) 2.5rem)' },
        },
        // Portal mobile nav wipes open from the burger button in the top-left corner.
        'circle-in-tl': {
          '0%': { clipPath: 'circle(0% at 2.25rem 2rem)' },
          '100%': { clipPath: 'circle(160% at 2.25rem 2rem)' },
        },
        'circle-out-tl': {
          '0%': { clipPath: 'circle(160% at 2.25rem 2rem)' },
          '100%': { clipPath: 'circle(0% at 2.25rem 2rem)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        // Masked line reveal — the inner span rises into an overflow-hidden parent.
        'reveal-up': {
          '0%': { transform: 'translateY(115%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up .6s cubic-bezier(.16,1,.3,1) both',
        'fade-in': 'fade-in .5s ease both',
        'scale-in': 'scale-in .35s cubic-bezier(.16,1,.3,1) both',
        marquee: 'marquee 38s linear infinite',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 1.6s infinite',
        'circle-in': 'circle-in .62s cubic-bezier(.22,1,.36,1) forwards',
        'circle-out': 'circle-out .45s cubic-bezier(.65,0,.35,1) forwards',
        'circle-in-tl': 'circle-in-tl .32s cubic-bezier(.16,1,.3,1) forwards',
        'circle-out-tl': 'circle-out-tl .22s cubic-bezier(.16,1,.3,1) forwards',
        'slide-in-right': 'slide-in-right .38s cubic-bezier(.22,1,.36,1) both',
        'reveal-up': 'reveal-up .95s cubic-bezier(.16,1,.3,1) both',
      },
    },
  },
  plugins: [],
}
