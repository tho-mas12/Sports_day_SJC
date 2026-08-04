/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB', // Royal Blue
          dark: '#1D4ED8',    // Deep Blue
          light: '#EFF6FF',
        },
        secondary: '#1D4ED8',  // Deep Blue
        accent: '#3B82F6',     // Bright Blue
        bg: '#F8FAFC',         // Soft Slate White
        card: '#FFFFFF',       // Pure White
        mainText: '#1E293B',   // Slate Dark
        borderCol: '#E5E7EB',  // Light Gray
      },
      borderRadius: {
        '18': '18px',          // Strict 18px rounded corners requirement
        'saas': '18px',
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'saas-sm': '0 2px 8px -1px rgba(30, 41, 59, 0.04)',
        'saas-md': '0 8px 24px -4px rgba(37, 99, 235, 0.08), 0 2px 6px -1px rgba(30, 41, 59, 0.04)',
        'saas-lg': '0 16px 36px -6px rgba(37, 99, 235, 0.12), 0 4px 12px -2px rgba(30, 41, 59, 0.04)',
        'saas-glow': '0 0 35px rgba(59, 130, 246, 0.25)',
      }
    },
  },
  plugins: [],
}
