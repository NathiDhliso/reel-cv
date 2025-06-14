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
        // ReelCV Ascension Palette
        'deep-ocean-blue': '#0047AB',
        'growth-green': '#2E8B57',
        'innovation-purple': '#8A2BE2',
        'optimistic-yellow': '#FFD700',
        'hopeful-turquoise': '#40E0D0',
        'clean-white': '#FFFFFF',
        'modern-gray': '#F5F5F5',
      },
      backgroundImage: {
        'ascension-gradient': 'linear-gradient(135deg, #0047AB 0%, #8A2BE2 50%, #2E8B57 100%)',
        'hope-gradient': 'linear-gradient(135deg, #40E0D0 0%, #FFD700 50%, #2E8B57 100%)',
        'trust-gradient': 'linear-gradient(135deg, #0047AB 0%, #40E0D0 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
}