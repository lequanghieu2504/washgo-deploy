// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}", // Make sure this matches your project structure
    ],
    theme: {
      extend: {
        colors: {
          primary: '#cc0000', // Your primary red color
          // You can define shades if needed, e.g., primary-dark: '#a30000'
        },
      },
    },
    plugins: [],
  }