import type { Config } from 'tailwindcss';
export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#071B3E', 600: '#012555', 50: '#F5F7FB', 100: '#E6EBF4' },
        gold: { DEFAULT: '#E8B50A', muted: '#AA8954', soft: '#FBF3D6' },
      },
      fontFamily: { display: ['var(--font-display)', 'sans-serif'], sans: ['var(--font-body)', 'sans-serif'] },
    },
  },
  plugins: [],
} satisfies Config;
