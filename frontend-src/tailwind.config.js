/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink:    '#0B0F1A',
        ink2:   '#101524',
        ink3:   '#161B2C',
        line:   '#1F2538',
        line2:  '#252C42',
        brand:  '#0B90E0',
        sky:    '#1CB0F6',
        rose:   '#FF4B4B',
        sun:    '#FFD900',
        warm:   '#FF9600',
        violet: '#CE82FF',
        text:   '#E6E9F2',
        muted:  '#7C8499',
      },
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px rgba(11,144,224,.35)',
        soft: '0 6px 24px -8px rgba(0,0,0,.5)',
        pop:  '0 12px 40px -12px rgba(0,0,0,.6)',
      },
      backgroundImage: {
        'grad-brand': 'linear-gradient(135deg, #0B90E0, #1CB0F6)',
        'grad-sun':   'linear-gradient(135deg, #FFD900, #FF9600)',
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':       { transform: 'translateY(-8px)' },
        },
        'confetti-fall': {
          to: { transform: 'translateY(110vh) rotate(720deg)', opacity: '0' },
        },
      },
      animation: {
        floaty: 'floaty 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
