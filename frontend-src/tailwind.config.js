/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink:    '#050814',
        ink2:   '#07091A',
        ink3:   '#0A0E22',
        line:   '#141B32',
        line2:  '#192038',
        brand:  '#5B6EF0',
        sky:    '#38BDF8',
        rose:   '#F87171',
        sun:    '#FCD34D',
        warm:   '#FB923C',
        violet: '#A78BFA',
        teal:   '#34D399',
        text:   '#EEF2FF',
        muted:  '#5E7194',
      },
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow:     '0 0 60px rgba(91,110,240,.3)',
        'glow-v': '0 0 60px rgba(167,139,250,.3)',
        'glow-t': '0 0 60px rgba(52,211,153,.3)',
        soft:     '0 8px 32px -8px rgba(0,0,0,.65)',
        pop:      '0 20px 60px -12px rgba(0,0,0,.75)',
      },
      backgroundImage: {
        'grad-brand':  'linear-gradient(135deg, #5B6EF0 0%, #A78BFA 100%)',
        'grad-sky':    'linear-gradient(135deg, #38BDF8 0%, #22D3EE 100%)',
        'grad-sun':    'linear-gradient(135deg, #FCD34D 0%, #FB923C 100%)',
        'grad-teal':   'linear-gradient(135deg, #34D399 0%, #38BDF8 100%)',
        'grad-rose':   'linear-gradient(135deg, #F87171 0%, #FB923C 100%)',
        'grad-violet': 'linear-gradient(135deg, #A78BFA 0%, #F472B6 100%)',
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':       { transform: 'translateY(-10px)' },
        },
        'confetti-fall': {
          to: { transform: 'translateY(110vh) rotate(720deg)', opacity: '0' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.93)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.5' },
          '50%':       { opacity: '1' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        floaty:       'floaty 3.5s ease-in-out infinite',
        'slide-up':   'slide-up 0.45s cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in':   'scale-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in':    'fade-in 0.3s ease both',
        'glow-pulse': 'glow-pulse 2.5s ease-in-out infinite',
        'shimmer':    'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
}
