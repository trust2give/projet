/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  content: ["./*.php", "./**/*.php"],
  theme: {
    extend: {
      colors: {
        'green': '#108c6c',
        'clear-green': '#d1ece5',
        // ...
      },
      space: {
        '20px': '20px',
      }
    },
  },
  plugins: [],
}