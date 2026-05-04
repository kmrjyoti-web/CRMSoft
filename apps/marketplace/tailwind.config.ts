import type { Config } from "tailwindcss";

const config: Config = {
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
      },
      padding: {
        safe: "env(safe-area-inset-bottom)",
      },
      margin: {
        safe: "env(safe-area-inset-bottom)",
      },
      height: {
        "screen-safe": "calc(100dvh - env(safe-area-inset-bottom))",
      },
    },
  },
  plugins: [],
};
export default config;
