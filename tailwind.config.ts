import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ---------------------------------------------------------------
        // SNEAKER AIR — dark-first, high-energy sneaker-culture palette.
        // Existing key NAMES are preserved (charcoal / pearl / cream /
        // accent / luxury / neutral) so every className already written
        // against them keeps working — only the hex VALUES changed to
        // the new identity. New keys (ink, surface, aura) are additive.
        // ---------------------------------------------------------------

        // "charcoal" = the ink scale. charcoal-900 is the exact signature
        // background (#0a0a0b), charcoal-800 is the signature surface
        // (#141417). Also doubles as the "dark text on light bg" color.
        charcoal: {
          50: '#f4f4f5',
          100: '#e4e4e7',
          200: '#d4d4d8',
          300: '#a1a1aa',
          400: '#71717a',
          500: '#4b4b52',
          600: '#2c2c31',
          700: '#1f1f23',
          800: '#141417', // signature surface
          900: '#0a0a0b', // signature ink background
          950: '#050506',
        },
        // "pearl" = the off-white scale. pearl-50 is the exact signature
        // off-white foreground (#f5f5f4).
        pearl: {
          50: '#f5f5f4', // signature off-white text
          100: '#efefec',
          200: '#e2e2de',
          300: '#cfcfc9',
          400: '#b3b3ac',
          500: '#97978f',
          600: '#7c7c75',
          700: '#5f5f5a',
          800: '#434340',
          900: '#262624',
        },
        // "accent" = the primary electric-blue CTA scale (the leading
        // stop of the signature gradient). accent-500 is the button/glow
        // color used across the site.
        accent: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#2563eb', // primary CTA / glow
          600: '#1d4ed8',
          700: '#1e40af',
          800: '#1e3a8a',
          900: '#172554',
          950: '#0f172a',
        },
        neutral: {
          50: '#fafafa',
          100: '#f2f2f2',
          200: '#e4e4e5',
          300: '#c9c9cb',
          400: '#96969b',
          500: '#68686f',
          600: '#48484d',
          700: '#2f2f33',
          800: '#1b1b1e',
          900: '#111113',
          950: '#0a0a0b',
        },
        // "cream" = light-mode warm-neutral surface scale.
        cream: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#ececea',
          300: '#dcdcd8',
          400: '#c2c2bc',
          500: '#a5a59d',
          600: '#87877d',
          700: '#6a6a61',
          800: '#4d4d46',
          900: '#33332f',
        },
        // "luxury" repointed to the sneaker signature accents — kept as a
        // named group so existing `luxury-gold` / `luxury-*` references
        // (used as the site's hero highlight color) now render the
        // Sneaker Air gradient hues instead of gold.
        luxury: {
          gold: '#ec4899',       // hero highlight (hot magenta, gradient's pop stop)
          champagne: '#f0abfc',  // soft light tint of the highlight
          ivory: '#f5f5f4',      // == pearl-50 off-white
          onyx: '#0a0a0b',       // == charcoal-900 ink
          slate: '#71717a',      // neutral sporty gray
        },
        // New: the three signature gradient stops exposed as flat utility
        // colors (bg-aura-blue, text-aura-violet, border-aura-magenta...)
        aura: {
          blue: '#2563eb',
          violet: '#7c3aed',
          magenta: '#ec4899',
        },

        // ---------------------------------------------------------------
        // SNEAKER AIR cinematic system (ported from blancographics.xyz):
        // void/carbon/steel surfaces, fog/mist/ghost type, volt/plasma/flare
        // neon accents. Used by the redesigned storefront surfaces.
        // ---------------------------------------------------------------
        void: '#030309',
        carbon: '#0b0b14',
        steel: '#14141f',
        fog: '#f2f2f7',
        mist: '#9a9aaf',
        ghost: '#5a5a70',
        volt: '#4d7cff',
        plasma: '#8a5cff',
        flare: '#ff4fd8',
      },
      fontFamily: {
        // References var(--font-sans) / var(--font-display) / var(--font-mono)
        // as the primary source (to be wired in app/layout.tsx), falling
        // back to the currently-loaded next/font variables, then to system
        // fonts, so nothing breaks before that wiring lands.
        sans: [
          'var(--font-sans, var(--font-inter, system-ui))',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
        display: [
          'var(--font-display, var(--font-playfair, "Arial Black"))',
          'Impact',
          'Helvetica Neue',
          'sans-serif',
        ],
        mono: [
          'var(--font-mono, ui-monospace)',
          'SFMono-Regular',
          'Menlo',
          'monospace',
        ],
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-out',
        'fade-in-up': 'fadeInUp 0.8s ease-out',
        'fade-in-down': 'fadeInDown 0.8s ease-out',
        'fade-in-slow': 'fadeIn 1.5s ease-out',
        'slide-in-right': 'slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'kinetic-text': 'kineticText 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'marquee': 'marquee 25s linear infinite',
        'reveal-up': 'revealUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        kineticText: {
          '0%': { opacity: '0', transform: 'translateY(100%) rotateX(-90deg)' },
          '100%': { opacity: '1', transform: 'translateY(0) rotateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        revealUp: {
          '0%': { clipPath: 'inset(100% 0 0 0)', opacity: '0' },
          '100%': { clipPath: 'inset(0 0 0 0)', opacity: '1' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
