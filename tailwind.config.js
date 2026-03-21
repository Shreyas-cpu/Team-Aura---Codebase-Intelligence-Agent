/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'aura-black': '#050505',
        'aura-dark': '#0B0B0B',
        'aura-emerald': '#00FF9D',
        'aura-white': '#FFFFFF',
        'aura-gray': '#94A3B8',
        'aura-border': '#1E293B',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'emerald-glow': '0 0 15px rgba(0, 255, 157, 0.3)',
        'emerald-glow-lg': '0 0 30px rgba(0, 255, 157, 0.4)',
        'emerald-glow-xl': '0 0 40px rgba(0, 255, 157, 0.5)',
      },
      backgroundImage: {
        'gradient-emerald': 'linear-gradient(135deg, rgba(0, 255, 157, 0.1) 0%, rgba(0, 255, 157, 0) 100%)',
      },
      animation: {
        'pulse-emerald': 'pulse-emerald 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-emerald': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'glow': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(0, 255, 157, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(0, 255, 157, 0.5)' },
        },
      },
    },
  },
  plugins: [],
}
