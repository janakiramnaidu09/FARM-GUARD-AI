/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        farm: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        earth: {
          50: '#faf6f1',
          100: '#f3eade',
          200: '#e5d3bc',
          300: '#d4b794',
          400: '#c2976d',
          500: '#b07f4f',
          600: '#9b6b41',
          700: '#7c5234',
          800: '#64422e',
          900: '#533728',
        }
      },
    },
  },
  plugins: [],
}

