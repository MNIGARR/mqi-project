/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#EFEAE0',
        'paper-dark': '#E4DDCC',
        ink: '#21261F',
        'ink-soft': '#3A4136',
        marigold: {
          DEFAULT: '#D6A419',
          dark: '#B4870D',
          light: '#F0CE72',
        },
        teal: {
          DEFAULT: '#17505A',
          dark: '#0E3941',
          light: '#2A7A85',
        },
        plum: {
          DEFAULT: '#6E2C55',
          dark: '#521F3F',
          light: '#93436F',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        body: ['"Work Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      backgroundImage: {
        grain: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        card: '0 1px 0 rgba(33,38,31,0.06), 0 8px 20px -12px rgba(33,38,31,0.25)',
        pin: '0 2px 6px rgba(33,38,31,0.35)',
      },
    },
  },
  plugins: [],
}
