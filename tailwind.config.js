/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // M3 Color System with #0064C8 as primary
        primary: {
          50: '#e6f3ff',
          100: '#cce7ff',
          200: '#99cfff',
          300: '#66b7ff',
          400: '#339fff',
          500: '#0064C8', // Your specified primary color
          600: '#0052a3',
          700: '#00407e',
          800: '#002e59',
          900: '#001c34',
        },
        // M3 Surface colors
        surface: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#eeeeee',
          300: '#e0e0e0',
          400: '#bdbdbd',
          500: '#9e9e9e',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
          950: '#121212',
        },
        // M3 Background colors
        background: {
          light: '#ffffff',
          dark: '#121212',
          'dark-elevated': '#1e1e1e',
          'dark-surface': '#2d2d2d',
        },
        // M3 Text colors
        text: {
          'primary-light': '#1c1b1f',
          'secondary-light': '#49454f',
          'primary-dark': '#e6e1e5',
          'secondary-dark': '#cac4d0',
        }
      },
      backgroundColor: {
        'dark-bg': '#121212',
        'dark-card': '#1e1e1e',
        'dark-section': '#2d2d2d',
        'm3-surface': '#1e1e1e',
        'm3-surface-variant': '#2d2d2d',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 