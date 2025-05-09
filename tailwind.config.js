/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary)',
          light: 'var(--primary-light)',
          dark: 'var(--primary-dark)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          light: 'var(--secondary-light)',
          dark: 'var(--secondary-dark)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          light: 'var(--accent-light)',
          dark: 'var(--accent-dark)',
        },
        text: {
          dark: 'var(--text-dark)',
          light: 'var(--text-light)',
        },
        bg: {
          light: 'var(--bg-light)',
          dark: 'var(--bg-dark)',
        },
        border: {
          light: 'var(--border-light)',
          dark: 'var(--border-dark)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
        // إضافة الخطوط العربية
        tajawal: ['Tajawal', 'sans-serif'],
        cairo: ['Cairo', 'sans-serif'],
      },
      // تكوين للغة العربية - RTL
      textAlign: {
        start: 'start',
        end: 'end',
      },
    },
  },
  // إضافة ملحقات للدعم الأفضل لـ RTL
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.rtl': {
          direction: 'rtl',
          textAlign: 'right',
        },
        '.ltr': {
          direction: 'ltr',
          textAlign: 'left',
        },
        '.flip-x': {
          transform: 'scaleX(-1)',
        },
        '.space-start': {
          justifyContent: 'flex-start',
        },
        '.space-end': {
          justifyContent: 'flex-end',
        },
        '.mr-auto-rtl': {
          marginRight: 'auto',
        },
        '.ml-auto-rtl': {
          marginLeft: 'auto',
        },
      }
      addUtilities(newUtilities)
    }
  ],
};