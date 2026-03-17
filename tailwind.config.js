/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        daikin: {
          blue: '#0097e0',
          'blue-dark': '#0077b8',
          'blue-light': '#e8f6fc',
        },
      },
    },
  },
  plugins: [],
}
