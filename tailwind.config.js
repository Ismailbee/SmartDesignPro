/** @type {import('tailwindcss').Config} */
export default {
  // Use 'class' strategy so dark mode follows theme store, not OS preference
  // Support both 'dark' and 'dark-mode' classes for compatibility
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,jsx,tsx}",
    "./src/**/*.ts",
    "!./src/**/node_modules/**",
    "!./node_modules/**",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      }
    },
  },
  plugins: [],
}
