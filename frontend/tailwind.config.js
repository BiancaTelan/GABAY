/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}",],
  theme: {
    extend: {
      colors: {
        'gabay-blue': '#2E5EB5', 
        'gabay-teal': '#33AFAE',
      },
    },
  },
  plugins: [],
}

