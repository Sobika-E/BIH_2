/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['system-ui', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        primary: {
          50: 'var(--primary-50)',
          100: 'var(--primary-100)',
          200: 'var(--primary-200)',
          300: 'var(--primary-300)',
          400: 'var(--primary-400)',
          500: 'var(--primary-500)',
          600: 'var(--primary-600)',
          700: 'var(--primary-700)',
          800: 'var(--primary-800)',
          900: 'var(--primary-900)',
        },
        secondary: {
          50: 'var(--secondary-50)',
          100: 'var(--secondary-100)',
          200: 'var(--secondary-200)',
          300: 'var(--secondary-300)',
          400: 'var(--secondary-400)',
          500: 'var(--secondary-500)',
          600: 'var(--secondary-600)',
          700: 'var(--secondary-700)',
          800: 'var(--secondary-800)',
          900: 'var(--secondary-900)',
        },
        accent: { 50: 'var(--accent-50)', 100: 'var(--accent-100)', 200: 'var(--accent-200)', 300: 'var(--accent-300)', 400: 'var(--accent-400)', 500: 'var(--accent-500)', 600: 'var(--accent-600)', 700: 'var(--accent-700)', 800: 'var(--accent-800)', 900: 'var(--accent-900)' },
        success: { 50: 'var(--success-50)', 100: 'var(--success-100)', 200: 'var(--success-200)', 300: 'var(--success-300)', 400: 'var(--success-400)', 500: 'var(--success-500)', 600: 'var(--success-600)', 700: 'var(--success-700)', 800: 'var(--success-800)', 900: 'var(--success-900)' },
        warning: { 50: 'var(--warning-50)', 100: 'var(--warning-100)', 200: 'var(--warning-200)', 300: 'var(--warning-300)', 400: 'var(--warning-400)', 500: 'var(--warning-500)', 600: 'var(--warning-600)', 700: 'var(--warning-700)', 800: 'var(--warning-800)', 900: 'var(--warning-900)' },
        error: { 50: 'var(--error-50)', 100: 'var(--error-100)', 200: 'var(--error-200)', 300: 'var(--error-300)', 400: 'var(--error-400)', 500: 'var(--error-500)', 600: 'var(--error-600)', 700: 'var(--error-700)', 800: 'var(--error-800)', 900: 'var(--error-900)' },
        neutral: { 50: 'var(--neutral-50)', 100: 'var(--neutral-100)', 200: 'var(--neutral-200)', 300: 'var(--neutral-300)', 400: 'var(--neutral-400)', 500: 'var(--neutral-500)', 600: 'var(--neutral-600)', 700: 'var(--neutral-700)', 800: 'var(--neutral-800)', 900: 'var(--neutral-900)' },
      },
      boxShadow: {
        card: '0 18px 45px rgba(15,23,42,0.08)',
      },
      borderRadius: {
        xl: '0.9rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
}

