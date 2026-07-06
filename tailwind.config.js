/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Accessible color palette for transplant patients with vision changes
      colors: {
        // High contrast text colors
        'accessible': {
          'dark': '#1e293b',      // slate-800 - for primary text
          'muted': '#374151',     // gray-700 - for secondary text (7:1 ratio)
          'secondary': '#475569', // slate-600 - for tertiary text (5.5:1 ratio)
          'light': '#f1f5f9',     // slate-100 - for text on dark backgrounds
        },
        // WCAG AA remap: default emerald-600 (#059669) is only 3.77:1 against
        // white, failing AA for normal text and for white text on emerald
        // buttons. Shift 600 to the old 700 value (5.48:1) and 700 to the old
        // 800 (7.09:1) so every existing bg-emerald-600 button, hover state,
        // and text-emerald-600 link passes without touching class names.
        'emerald': {
          600: '#047857',
          700: '#065f46',
        }
      },
      // Minimum font sizes
      fontSize: {
        'xs': ['0.875rem', { lineHeight: '1.5' }],    // 14px minimum
        'sm': ['0.9375rem', { lineHeight: '1.5' }],   // 15px minimum
        'base': ['1rem', { lineHeight: '1.6' }],      // 16px
      },
      // Touch target sizes
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      },
      // Improved spacing for tap targets
      spacing: {
        'touch': '44px',
      }
    },
  },
  plugins: [],
}
