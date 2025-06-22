// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6", // Blue
        secondary: "#8B5CF6", // Purple
        accent: "#F59E0B", // Amber
      },
    },
  },
  plugins: [],
  darkMode: "class",
};