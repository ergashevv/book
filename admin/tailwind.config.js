/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#fefbf5',
          'bg-elevated': '#fffefb',
          surface: '#ffffff',
          'surface-hover': '#fff8ed',
          accent: '#ea580c',
          'accent-hover': '#c2410c',
          'accent-soft': '#ffedd5',
          text: '#1c1917',
          muted: '#78716c',
          border: '#f0e6dc',
        },
      },
      borderRadius: {
        app: '14px',
        'app-sm': '10px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        app: '0 1px 3px rgba(234,88,12,0.06)',
        'app-card': '0 2px 12px rgba(234,88,12,0.08)',
      },
    },
  },
  plugins: [],
};
