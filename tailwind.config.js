/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        peru: {
          rojo: '#D91023',
          dorado: '#C9A02E',
          azul: '#0B2545',
          azulMedio: '#1B3A6B',
          gris: '#3A3F4B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
