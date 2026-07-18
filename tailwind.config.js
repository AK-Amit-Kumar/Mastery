/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0a0a1a',
        panel: '#12122a',
        panel2: '#1a1a3a',
        line: '#2e2e5c',
        cyan: '#4deeea',
        magenta: '#f92aad',
        lime: '#7dff6b',
        amber: '#ffd23f',
        blood: '#ff4d4d',
        paper: '#e8e6f0',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'cursive'],
        body: ['"VT323"', 'monospace'],
      },
      boxShadow: {
        pixel: '4px 4px 0 0 #000',
        'pixel-sm': '2px 2px 0 0 #000',
        'pixel-cyan': '4px 4px 0 0 #4deeea',
        'pixel-magenta': '4px 4px 0 0 #f92aad',
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
