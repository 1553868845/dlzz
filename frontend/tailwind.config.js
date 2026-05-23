/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef4ff',
          100: '#dce9ff',
          200: '#b3d0ff',
          300: '#7aafff',
          400: '#3d87fc',
          500: '#1e3a5f',   // 主色
          600: '#1a3254',
          700: '#152848',
          800: '#101e38',
          900: '#0b1628',
        },
        accent: '#c8a96e',  // 金色点缀
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
