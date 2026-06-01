/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink:   '#0B0F1A',
        ink2:  '#101524',
        ink3:  '#161B2C',
        line:  '#1F2538',
        line2: '#252C42',
        brand: '#0B90E0',
        sky:   '#1CB0F6',
        rose:  '#FF4B4B',
        sun:   '#FFD900',
        warm:  '#FF9600',
        violet:'#CE82FF',
        text:  '#E6E9F2',
        muted: '#7C8499',
      },
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
