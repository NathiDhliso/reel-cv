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
        'deep-ocean-blue': '#0047AB',
        'growth-green': '#2E8B57',
        'innovation-purple': '#8A2BE2',
        'optimistic-yellow': '#FFD700',
        'hopeful-turquoise': '#40E0D0',
        'modern-gray': '#F5F5F5',
      }
    },
  },
  plugins: [],
}