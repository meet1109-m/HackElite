/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#239B62',
          600: '#16845B',
          700: '#0F6B47',
          800: '#0B5D3B',
          900: '#074229',
          950: '#032516',
        },
        civic: {
          bg: '#F7FAF8',
          card: '#FFFFFF',
          cardSubtle: '#F1F6F3',
          border: '#E3EAE6',
          borderHover: '#CBD8D2',
          text: '#17201B',
          textSecondary: '#66736C',
          textMuted: '#94A39D',
          primary: '#16845B',
          primaryDark: '#0B5D3B',
          accent: '#2878C8',
          warning: '#E89A27',
          critical: '#D64545',
          success: '#239B62',
          teal: '#0D9488',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.25s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        'card-hover': '0 10px 25px -5px rgba(22, 132, 91, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
