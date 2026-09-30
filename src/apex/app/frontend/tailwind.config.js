/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      colors: {
        primary: {
          300: '#344BAF',
          500: '#263682',
          700:'#202D6B',
        },
        secondary: {
            300:'#C60000',
            500: '#990000',
            700: '#7F0000',
          },
        accent2: {
          300: "hsl(192 89.3% 37.8%)",
          500: "hsl(192 89.3% 59.8%)",
          700: "hsl(192 89.3% 29.8%)",
        },
        accent: {
          300: "hsl(183 22.7% 70%)",
          400: "hsl(183 32.7% 60%)",
          500: 'hsl(183 22.7% 50%)',
          700: 'hsl(183 22.7% 30%)',
        },
      },
    },
  },
  plugins: [],
}

