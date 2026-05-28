/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        paper: '#faf7f2',
        cream: '#f1ebe0',
        ink: '#1a1816',
        graphite: '#3a3733',
        muted: '#6b655d',
        rule: '#e3ddd0',
        vermillion: '#c8472b',
        ochre: '#b8843a',
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
      keyframes: {
        rise: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scrollx: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
      },
      animation: {
        rise: 'rise .6s cubic-bezier(.2,.7,.3,1) both',
        scrollx: 'scrollx 40s linear infinite',
      },
    },
  },
  plugins: [],
}
