/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        'background-secondary': 'hsl(var(--background-secondary))',
        'background-tertiary': 'hsl(var(--background-tertiary))',
        foreground: 'hsl(var(--foreground))',
        'foreground-muted': 'hsl(var(--foreground-muted))',
        'glimz-primary': 'hsl(var(--glimz-primary))',
        'glimz-primary-dark': 'hsl(var(--glimz-primary-dark))',
        'glimz-secondary': 'hsl(var(--glimz-secondary))',
        'glimz-accent': 'hsl(var(--glimz-accent))',
        card: 'hsl(var(--card))',
        'card-foreground': 'hsl(var(--card-foreground))',
        'card-hover': 'hsl(var(--card-hover))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        'input-border': 'hsl(var(--input-border))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        'card': 'var(--radius-card)',
        'button': 'var(--radius-button)',
      },
      boxShadow: {
        'glow': 'var(--shadow-glow)',
        'card': 'var(--shadow-card)',
        'hero': 'var(--shadow-hero)',
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce': 'bounce 1s infinite',
        'glow': 'glow-pulse 2s ease-in-out infinite',
        'logo-spin': 'logo-spin 20s linear infinite',
      },
      transitionDuration: {
        'smooth': 'var(--transition-smooth)',
        'bounce': 'var(--transition-bounce)',
      },
    },
  },
  plugins: [],
}
