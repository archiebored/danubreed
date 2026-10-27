/** @type {import('tailwindcss').Config} */

// Mirrors mobile/src/theme/colors.ts so the PWA and the native app read as
// one product. Change both together.
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#FF7A1F',
          dark: '#C2590A',
          // Text/icons sitting on top of an accent fill.
          on: '#1a0a00',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#241E19',
        },
        base: {
          light: '#FAF6F1',
          dark: '#19140F',
        },
        ink: {
          light: '#241A10',
          dark: '#F8F2EA',
        },
        muted: {
          light: '#7A6E62',
          dark: '#B3A395',
        },
        danger: '#F87171',
        success: '#4ADE80',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Bebas Neue"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
