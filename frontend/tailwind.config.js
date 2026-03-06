/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}",],
  theme: {
    extend: {
      colors: {
        'gabay-blue': '#2E5EB5', 
        'gabay-teal': '#33AFAE',
        'gabay-teal2': '#227e7e',
        'gabay-navy': '#1B335F',
        'gray-outline': '#929292'
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

