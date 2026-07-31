/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        fade: {
          dark:   '#002855',
          mid:    '#003F8A',
          blue:   '#0055B8',
          light:  '#E8F0FB',
          gold:   '#D4A017',
          'gold-light': '#FBF5E0',
        },
      },
      fontFamily: {
        sans: ['Barlow', 'DIN', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
