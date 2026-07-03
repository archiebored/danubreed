/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#F97316',
          dark: '#C2590A',
        },
        surface: {
          light: '#FDFCFB',
          dark: '#161616',
        },
        base: {
          light: '#F7F5F2',
          dark: '#0A0A0A',
        },
        ink: {
          light: '#0A0A0A',
          dark: '#F5F5F5',
        },
        muted: {
          light: '#666666',
          dark: '#888888',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Bebas Neue"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};