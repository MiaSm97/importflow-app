/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-nunito)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: '#0B0F1A',
        surface: '#111827',
        'surface-2': '#0F172A',
        border: '#1F2937',
        'text-primary': '#E5E7EB',
        'text-secondary': '#9CA3AF',
        'text-muted': '#6B7280',
        accent: '#34D399',
        'accent-strong': '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        success: '#22C55E',
        bgPage: "#f0f5f8",
        bgAlert: "#ff476233",
        bgWarn: "#f9b20433",
        bgPopup: "rgba(0, 0, 0, 0.7)",
        textGray: "#828da0",
        bgSuccess: "#0bb68733",
        textSuccess: "#0bb687",
        bgPending: "#fde7b3",
        textAlert: "#ff4762",
        separator: "#d8d8d8",
        text: "#000",
        textLightGray: "#96a1b5",
        bgBlue: "#0098ea",
        bgBtnSecondary: "#f0f5f8",
        bgmain: "#f3f4f7",
      },
      fontSize: {
        '12px': '12px',
      },
      height: {
        'h-custom': 'calc(50vh - 4rem)',
      },
      boxShadow: {
        bottomCustomShadow: '0 2px 5px 0 rgba(0, 0, 0, 0.1)',
        topCustomShadow: '0 -2px 5px 0 rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.border-b-custom': {
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        },
        '.border-b-custom-dashed': {
          borderBottom: '1px dashed rgba(0, 0, 0, 0.1)',
        },
        '.border-b2-custom': {
          borderBottom: '1px solid #828DA0',
        },
        '.border-t-custom': {
          borderTop: '1px solid rgba(0, 0, 0, 0.1)',
        },
        '.border-t-custom-dashed': {
          borderTop: '1px dashed rgba(0, 0, 0, 0.1)',
        },
        '.border-r-custom': {
          borderRight: '1px solid rgba(0, 0, 0, 0.1)',
        },
        '.border-l-custom': {
          borderLeft: '1px solid rgba(0, 0, 0, 0.1)',
        },
        '.border-custom': {
          border: '1px solid rgba(0, 0, 0, 0.1)',
        },
        // Use core utilities with the `last:` variant instead of custom selectors.
      }, ['responsive', 'hover', 'last']);
    }
  ],
};
