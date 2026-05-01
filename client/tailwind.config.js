/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'masa-dark':   '#1a1a2e',
        'masa-accent': '#e07b39',
        'masa-light':  '#f8f7f4',
        'masa-gray':   '#6b7280',
        'masa-border': '#e5e7eb',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
