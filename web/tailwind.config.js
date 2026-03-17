/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class', // ← هذا كان ناقصاً — يتحكم في dark: classes
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans Arabic"', 'Tajawal', 'system-ui', 'sans-serif'],
        heading: ['Tajawal', '"IBM Plex Sans Arabic"', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        }
      },
      screens: {
        xs: '480px',  // إضافة breakpoint للهواتف الصغيرة
      }
    },
  },
  plugins: [],
}