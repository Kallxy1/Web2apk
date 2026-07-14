import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: { ink: "#070b14", panel: "#101725", cyan: "#45d6d0", violet: "#8b7cf6" },
      boxShadow: { glow: "0 0 40px rgba(69,214,208,.14)" },
    },
  },
  plugins: [],
} satisfies Config;
