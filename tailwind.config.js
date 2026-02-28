/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        abyss: '#020202',
        vibranium: '#7e22ce',
        solar: '#fbbf24',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(126, 34, 206, 0.35)',
      },
      backgroundImage: {
        vibranium:
          'linear-gradient(120deg, rgba(126,34,206,0.95) 0%, rgba(251,191,36,0.85) 100%)',
      },
    },
  },
  plugins: [],
};
