import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        "flash-red": "flashRed 0.5s ease-in-out infinite",
        "flash-green": "flashGreen 0.5s ease-in-out infinite",
        "slide-down": "slideDown 0.4s ease-out",
        "shake": "shake 0.5s ease-in-out infinite",
        "scale-pulse": "scalePulse 1s ease-in-out infinite",
        "border-glow": "borderGlow 1.5s ease-in-out infinite",
      },
      keyframes: {
        flashRed: {
          "0%, 100%": { backgroundColor: "rgb(220 38 38)" },
          "50%": { backgroundColor: "rgb(239 68 68)" },
        },
        flashGreen: {
          "0%, 100%": { backgroundColor: "rgb(22 163 74)" },
          "50%": { backgroundColor: "rgb(74 222 128)" },
        },
        slideDown: {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-5px)" },
          "75%": { transform: "translateX(5px)" },
        },
        scalePulse: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.08)" },
        },
        borderGlow: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(74,222,128,0.3)" },
          "50%": { boxShadow: "0 0 25px rgba(74,222,128,0.8), 0 0 50px rgba(74,222,128,0.4)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
