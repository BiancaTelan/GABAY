/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'gabay-blue': '#2E5EB5', 
        'gabay-teal': '#33AFAE',
        'gabay-teal2': '#227e7e',
        'gabay-navy': '#1B335F',
        'gabay-violet': '#8145c1',
        'gray-outline': '#929292',
        'gabay-green': '#59CF6E',
        'gabay-green2': '#439352',
        'gabay-orange': '#f18811',
        'gabay-red': '#D13C3C',
        'gabay-red2': '#9b2d2d'
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
      keyframes: {
        'fade-in-down': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-8px)' },
          '50%': { transform: 'translateX(8px)' },
          '75%': { transform: 'translateX(-8px)' },
        }
      },
      animation: {
        'fade-in-down': 'fade-in-down 0.4s ease-out forwards',
        'shake': 'shake 0.2s ease-in-out 0s 2',
      },
    },
  },
  plugins: [],
}