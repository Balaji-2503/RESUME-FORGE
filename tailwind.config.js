/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        ui: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        ink: {
          50: '#f6f7f9', 100: '#eceef2', 200: '#d5d9e2', 300: '#b0b8c8',
          400: '#8491a8', 500: '#65728c', 600: '#505b73', 700: '#414a5d',
          800: '#38404f', 900: '#232936', 950: '#15191f',
        },
        brand: {
          50: '#eef4ff', 100: '#d9e5ff', 200: '#bcd2ff', 300: '#8eb5ff',
          400: '#598dff', 500: '#3366ff', 600: '#1d45f5', 700: '#1734e1',
          800: '#192db6', 900: '#1a2d8f', 950: '#151c57',
        },
      },
      keyframes: {
        'fade-in': { from: { opacity: '0', transform: 'translateY(4px)' }, to: { opacity: '1', transform: 'none' } },
      },
      animation: { 'fade-in': 'fade-in 160ms ease-out' },
    },
  },
  plugins: [],
}
