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
        console: {
          bg: "#0f1117",
          sidebar: "#161b22",
          card: "#1c2128",
          border: "#30363d",
          accent: "#238636",
          danger: "#da3633",
          warning: "#d29922",
          text: "#e6edf3",
          muted: "#8b949e",
        },
      },
    },
  },
  plugins: [],
};
export default config;
