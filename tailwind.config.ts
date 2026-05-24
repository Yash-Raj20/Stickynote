import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "var(--surface)",
        border: "var(--border)",
        "theme-primary": "var(--theme-primary)",
        "theme-secondary": "var(--theme-secondary)",
        "theme-tertiary": "var(--theme-tertiary)",
        "theme-accent": "var(--theme-accent)",
        "input-bg": "var(--input-bg)",
      },
      keyframes: {
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
      },
      animation: {
        'gradient': 'gradient 4s linear infinite',
      },
    },
  },
  plugins: [],
};
export default config;
