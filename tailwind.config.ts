import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "hsl(var(--bg))",
        fg: "hsl(var(--fg))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-fg))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-fg))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        sidebar: "hsl(var(--sidebar))",
        "sidebar-border": "hsl(var(--sidebar-border))",
        "sidebar-accent": "hsl(var(--sidebar-accent))",
        ring: "hsl(var(--ring))",
        danger: "hsl(var(--danger))",
        success: "hsl(var(--success))",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        serif: ["Newsreader", "Georgia", "serif"],
      },
      boxShadow: {
        sm2: "0 1px 2px hsl(30 10% 20% / .06)",
        lg2: "0 10px 30px hsl(30 10% 20% / .12)",
      },
      borderRadius: {
        xl2: "12px",
      },
      keyframes: {
        fade: {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "none" },
        },
        dialogin: {
          from: { opacity: "0", transform: "scale(.96) translateY(8px)" },
          to: { opacity: "1", transform: "none" },
        },
        toastin: {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "none" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        fade: "fade .4s cubic-bezier(.22,1,.36,1)",
        dialogin: "dialogin .24s cubic-bezier(.22,1,.36,1)",
        toastin: "toastin .3s cubic-bezier(.22,1,.36,1)",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
