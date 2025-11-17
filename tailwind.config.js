/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#111418', // Black Pearl
        secondary: '#D1D5DB', // Silver grey
        'bg-white': '#FFFFFF',
        'soft-accent': '#F3F4F6', // Mist grey
      }
    }
  },
  plugins: [],
}
