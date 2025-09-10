/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Premium Brand Colors for Partner App
        brand: {
          50: '#f0f7ff',
          100: '#e0efff',
          200: '#bae0ff',
          300: '#7cc8ff',
          400: '#36acff',
          500: '#0c90f0',
          600: '#0070cd',
          700: '#0058a6',
          800: '#024b88',
          900: '#083e70',
          950: '#052749',
        },
        // Partner-specific colors
        partner: {
          primary: '#0c90f0',
          secondary: '#667eea',
          accent: '#4ade80',
          warning: '#f59e0b',
          danger: '#ef4444',
        },
        // Premium Gray Scale
        slate: {
          25: '#fcfcfd',
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        // Premium Card System
        card: {
          DEFAULT: "rgba(255, 255, 255, 0.95)",
          foreground: "#0f172a",
          border: "rgba(148, 163, 184, 0.12)",
        },
        muted: {
          DEFAULT: "#f8fafc",
          foreground: "#64748b",
        },
        // Premium Accent Colors
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        border: "rgba(148, 163, 184, 0.12)",
        input: "rgba(148, 163, 184, 0.12)",
        ring: "#667eea",
        background: "#fefefe",
        foreground: "#0f172a",
      },
      boxShadow: {
        'premium': '0 4px 20px -2px rgba(0, 0, 0, 0.08)',
        'premium-lg': '0 10px 40px -4px rgba(0, 0, 0, 0.12)',
        'premium-xl': '0 20px 60px -8px rgba(0, 0, 0, 0.15)',
        'glow': '0 0 20px rgba(102, 126, 234, 0.4)',
      },
      backgroundImage: {
        'gradient-premium': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-partner': 'linear-gradient(135deg, #0c90f0 0%, #667eea 100%)',
        'gradient-subtle': 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'pulse-soft': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      backdropBlur: {
        'premium': '12px',
      },
      screens: {
        xs: "480px",
      },
    },
  },
  plugins: [],
}
