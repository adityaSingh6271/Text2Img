import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(-10px)" }, // ⬅ Changed opacity to string
          to: { opacity: "1", transform: "translateY(0)" }, // ⬅ Changed opacity to string
        },
      },
      animation: {
        "fade-in": "fadeIn 1s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
