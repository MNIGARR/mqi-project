/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FCFAFC',
        'paper-dark': '#F3EDF5',
        ink: '#241B2E',
        'ink-soft': '#5B4F66',
        orange: {
          DEFAULT: '#F17A34',
          dark: '#D9611E',
          light: '#FBB27E',
        },
        pink: {
          DEFAULT: '#E01D82',
          dark: '#B8146A',
          light: '#F272B0',
        },
        purple: {
          DEFAULT: '#8A2BD9',
          dark: '#6B1FAE',
          light: '#B87BEE',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        body: ['"Work Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(115deg, #F17A34 0%, #E01D82 52%, #8A2BD9 100%)',
        'brand-gradient-soft': 'linear-gradient(115deg, rgba(241,122,52,0.10) 0%, rgba(224,29,130,0.10) 52%, rgba(138,43,217,0.10) 100%)',
        grain: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        card: '0 1px 0 rgba(36,27,46,0.06), 0 8px 24px -14px rgba(138,43,217,0.35)',
        pin: '0 2px 6px rgba(224,29,130,0.45)',
      },
    },
  },
  plugins: [],
}