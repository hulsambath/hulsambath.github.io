/** @type {import('tailwindcss').Config} */
export default {
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
        },
        // M3 Surface colors (Material 3 tokens)
        'surface-container': '#211f26',
        'surface-container-low': '#1c1b20',
        'surface-container-high': '#2b2932',
        'surface-container-highest': '#36343d',
        'outline': '#938f99',
        'outline-variant': '#49454f',
      },
      backgroundColor: {
        'dark-bg': '#121212',
        'dark-card': '#1e1e1e',
        'dark-section': '#2d2d2d',
        'm3-surface': '#1e1e1e',
        'm3-surface-variant': '#2d2d2d',
      },
      borderRadius: {
        'm3-sm': '4px',
        'm3-md': '8px',
        'm3-lg': '12px',
        'm3-xl': '16px',
        'm3-2xl': '20px',
        'm3-3xl': '28px',
      },
      boxShadow: {
        'm3-1': '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
        'm3-2': '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
        'm3-3': '0px 1px 3px 0px rgba(0, 0, 0, 0.3), 0px 4px 8px 3px rgba(0, 0, 0, 0.15)',
        'm3-4': '0px 2px 3px 0px rgba(0, 0, 0, 0.3), 0px 6px 10px 4px rgba(0, 0, 0, 0.15)',
        'm3-5': '0px 4px 4px 0px rgba(0, 0, 0, 0.3), 0px 8px 12px 6px rgba(0, 0, 0, 0.15)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 