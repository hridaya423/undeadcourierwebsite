module.exports = {
    content: [
      './pages/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
      './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        colors: {
          'zombie-green': '#0F3B10',
          'blood-red': '#8B0000',
          'rot-brown': '#3D2817',
          'fog-gray': '#1a1a1a',
          'toxic-green': '#39FF14',
        },
        animation: {
          'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          'flicker': 'flicker 8s infinite',
        },
        keyframes: {
          flicker: {
            '0%, 100%': { opacity: '1' },
            '50%': { opacity: '0.7' },
          }
        },
        backgroundImage: {
          'fog-overlay': "linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(15,59,16,0.3))",
        }
      },
    },
    plugins: [],
  }