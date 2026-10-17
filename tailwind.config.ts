import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#101114",
        panel: "#191b20",
        line: "#2a2d34",
        lime: "#c6f36b",
        muted: "#a0a3ac"
      },
      boxShadow: { glow: "0 0 40px rgba(198,243,107,.15)" }
    }
  },
  plugins: []
};

export default config;
