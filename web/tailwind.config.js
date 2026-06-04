/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: '#00A99D',
          50: '#E6F7F6',
          100: '#B3E8E5',
          500: '#00A99D',
          600: '#008C82',
          700: '#006F67',
        },
        brand: {
          yellow: '#F5A623',
          dark: '#003B6E',
          teal: '#00A99D',
        },
      },
      fontFamily: {
        sans: ['var(--font-outfit)', 'sans-serif'],
        display: ['var(--font-fraunces)', 'serif'],
      },
    },
  },
  plugins: [],
}
