/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f2f7f4',
          100: '#dfede5',
          200: '#c1dcd0',
          300: '#9bc2b3',
          400: '#72a492',
          500: '#4E876C', // Primary Sage Green from prompt
          600: '#3e6d56',
          700: '#335746',
          800: '#2b473a',
          900: '#243b31',
        },
        terracotta: {
          50: '#fdf4f3',
          100: '#fbe6e4',
          200: '#f8d2cd',
          300: '#f2b1a8',
          400: '#e88476',
          500: '#EF4444', // Primary Terracotta/Red from prompt
          600: '#cc3535',
          700: '#a72929',
          800: '#8a2626',
          900: '#732525',
        },
        matte: {
          dark: '#0F172A',
          card: '#1E293B',
          elevated: '#334155',
          border: 'rgba(255, 255, 255, 0.08)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-sage': 'glowSage 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glowSage: {
          '0%': { boxShadow: '0 0 5px rgba(78, 135, 108, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(78, 135, 108, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
