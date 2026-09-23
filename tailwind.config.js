/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* ── Brand ─────────────────────── */
        primary:            '#2C6E59',
        'primary-light':    '#3d8f74',
        'primary-dark':     '#1e4d3e',
        'primary-container':'#2c6e59',
        'on-primary':       '#ffffff',
        secondary:          '#A2E037',
        lime:               '#A2E037',
        'lime-dark':        '#7bc42a',
        'accent-lime':      '#A2E037',
        'mint-green':       '#00C288',
        positive:           '#00C288',
        'deep-forest':      '#2c6e59',
        charcoal:           '#1A1D1F',
        'cool-grey':        '#808A93',
        error:              '#ba1a1a',

        /* ── Light surfaces ─────────────── */
        background:                 '#f7f9f5',
        surface:                    '#f7f9f5',
        'surface-container-lowest': '#ffffff',
        'surface-container-low':    '#f2f4f1',
        'surface-container':        '#eceeeb',
        'surface-container-high':   '#e6e9e5',
        'surface-container-highest':'#e1e3e0',
        'surface-variant':          '#e1e3e0',
        'on-surface':               '#191c1b',
        'on-surface-variant':       '#3f4944',
        'outline':                  '#707974',
        'outline-variant':          '#d0d5d0',

        /* ── Dark surfaces ──────────────── */
        'dark-bg':           '#0a0c0b',
        'dark-surface':      '#111413',
        'dark-surface-low':  '#171a19',
        'dark-surface-high': '#1e2221',
        'dark-border':       '#272b2a',
        'dark-text':         '#eaece9',
        'dark-muted':        '#8a9490',

        /* ── Misc ───────────────────────── */
        tertiary:              '#00563a',
        'tertiary-fixed-dim':  '#42dfa3',
        'negative-bg':         '#FBEBEB',
      },

      borderRadius: {
        DEFAULT: '0.5rem',
        lg:  '0.5rem',
        xl:  '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px',
      },

      fontFamily: {
        sans:  ["'Plus Jakarta Sans'", 'sans-serif'],
        mono:  ["'JetBrains Mono'", 'monospace'],
      },

      fontSize: {
        'display-lg': ['clamp(48px,8vw,96px)',  { lineHeight:'1.0', letterSpacing:'-0.04em', fontWeight:'800' }],
        'headline-lg': ['clamp(32px,5vw,48px)', { lineHeight:'1.1', letterSpacing:'-0.03em', fontWeight:'800' }],
        'headline-md': ['clamp(24px,3vw,32px)', { lineHeight:'1.2', letterSpacing:'-0.02em', fontWeight:'700' }],
        'title-lg':    ['20px', { lineHeight:'28px', fontWeight:'700' }],
        'title-md':    ['16px', { lineHeight:'24px', fontWeight:'600' }],
        'body-lg':     ['18px', { lineHeight:'28px', fontWeight:'400' }],
        'body-md':     ['15px', { lineHeight:'24px', fontWeight:'400' }],
        'label-md':    ['12px', { lineHeight:'16px', letterSpacing:'0.04em', fontWeight:'600' }],
        'label-sm':    ['10px', { lineHeight:'12px', letterSpacing:'0.08em', fontWeight:'700' }],
      },

      boxShadow: {
        'card':        '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)',
        'card-hover':  '0 8px 24px rgba(0,0,0,0.08), 0 24px 48px rgba(44,110,89,0.10)',
        'card-dark':   '0 1px 3px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2)',
        'glow':        '0 0 32px rgba(44,110,89,0.25), 0 0 64px rgba(44,110,89,0.10)',
        'glow-lime':   '0 0 24px rgba(162,224,55,0.35)',
        'chat':        '0 24px 80px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.12)',
      },

      animation: {
        'fade-in':       'fade-in 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in-up':    'fade-in-up 0.65s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in-down':  'fade-in-down 0.4s cubic-bezier(0.16,1,0.3,1) both',
        'scale-in':      'scale-in 0.4s cubic-bezier(0.16,1,0.3,1) both',
        'slide-up':      'slide-up 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'marquee':       'marquee 28s linear infinite',
        'pulse-soft':    'pulse-soft 2.5s ease-in-out infinite',
        'bounce-dot':    'bounce-dot 1.4s ease-in-out infinite',
        'spin-slow':     'spin-slow 8s linear infinite',
        'blink':         'blink 1.2s ease-in-out infinite',
        'bar-grow':      'bar-grow 0.8s cubic-bezier(0.16,1,0.3,1) both',
        'chat-in':       'chat-in 0.35s cubic-bezier(0.16,1,0.3,1) both',
        'shimmer':       'shimmer 2s linear infinite',
        'float':         'float 6s ease-in-out infinite',
        'ping-once':     'ping-once 1s cubic-bezier(0,0,0.2,1) both',
      },

      keyframes: {
        'fade-in':      { from:{ opacity:'0' }, to:{ opacity:'1' } },
        'fade-in-up':   { from:{ opacity:'0', transform:'translateY(24px)' }, to:{ opacity:'1', transform:'translateY(0)' } },
        'fade-in-down': { from:{ opacity:'0', transform:'translateY(-14px)' }, to:{ opacity:'1', transform:'translateY(0)' } },
        'scale-in':     { from:{ opacity:'0', transform:'scale(0.93)' }, to:{ opacity:'1', transform:'scale(1)' } },
        'slide-up':     { from:{ opacity:'0', transform:'translateY(40px)' }, to:{ opacity:'1', transform:'translateY(0)' } },
        'marquee':      { from:{ transform:'translateX(0)' }, to:{ transform:'translateX(-50%)' } },
        'pulse-soft':   { '0%,100%':{ opacity:'1' }, '50%':{ opacity:'0.45' } },
        'bounce-dot':   { '0%,80%,100%':{ transform:'translateY(0)' }, '40%':{ transform:'translateY(-8px)' } },
        'spin-slow':    { from:{ transform:'rotate(0deg)' }, to:{ transform:'rotate(360deg)' } },
        'blink':        { '0%,100%':{ opacity:'1' }, '50%':{ opacity:'0' } },
        'bar-grow':     { from:{ transform:'scaleY(0)' }, to:{ transform:'scaleY(1)' } },
        'chat-in':      { from:{ opacity:'0', transform:'translateY(8px) scale(0.97)' }, to:{ opacity:'1', transform:'translateY(0) scale(1)' } },
        'shimmer':      { from:{ backgroundPosition:'200% 0' }, to:{ backgroundPosition:'-200% 0' } },
        'float':        { '0%,100%':{ transform:'translateY(0px)' }, '50%':{ transform:'translateY(-10px)' } },
        'ping-once':    { '0%':{ transform:'scale(1)', opacity:'1' }, '75%,100%':{ transform:'scale(1.8)', opacity:'0' } },
      },

      transitionTimingFunction: {
        spring: 'cubic-bezier(0.16,1,0.3,1)',
      },

      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg,#2C6E59 0%,#1a4a3a 100%)',
        'gradient-lime':    'linear-gradient(135deg,#A2E037 0%,#7bc42a 100%)',
        'dot-grid':
          'radial-gradient(circle, rgba(44,110,89,0.18) 1px, transparent 1px)',
        'dot-grid-dark':
          'radial-gradient(circle, rgba(44,110,89,0.30) 1px, transparent 1px)',
      },

      backgroundSize: {
        'grid-sm': '24px 24px',
        'grid-md': '40px 40px',
        'grid-lg': '64px 64px',
      },
    },
  },
  plugins: [],
};
