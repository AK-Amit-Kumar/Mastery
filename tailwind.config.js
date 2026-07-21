/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: 'var(--color-ink)',
        panel: 'var(--color-panel)',
        panel2: 'var(--color-panel2)',
        line: 'var(--color-line)',
        cyan: 'var(--color-cyan)',
        magenta: 'var(--color-magenta)',
        lime: 'var(--color-lime)',
        amber: 'var(--color-amber)',
        blood: 'var(--color-blood)',
        paper: 'var(--color-paper)',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'cursive'],
        body: ['"VT323"', 'monospace'],
      },
      boxShadow: {
        pixel: '4px 4px 0 0 #000',
        'pixel-sm': '2px 2px 0 0 #000',
        'pixel-cyan': '4px 4px 0 0 var(--color-cyan)',
        'pixel-magenta': '4px 4px 0 0 var(--color-magenta)',
      },
      keyframes: {
        'float-up': {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-60px)', opacity: '0' },
        },
        flicker: {
          '0%, 100%': { opacity: '0.98' },
          '50%': { opacity: '0.95' },
        },
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
      },
      animation: {
        'float-up': 'float-up 1.2s ease-out forwards',
        flicker: 'flicker 3s infinite',
        blink: 'blink 1s step-start infinite',
      },
    },
  },
  plugins: [],
}
