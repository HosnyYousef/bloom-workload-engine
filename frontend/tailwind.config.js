/** @type {import('tailwindcss').Config} */
export default {
content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}',
],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif'], // Roboto as primary sans-serif
      },
      gridTemplateColumns: {
        '70-30': '70% 30%', // Custom grid column template
      },
    },
  },
  plugins: [],
}
