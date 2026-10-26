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
        charcoal: "#1A1A1A",
        bone: "#F2EFEA",
        brass: {
          DEFAULT: "#B08D57",
          dark: "#7A6035",
        },
        burgundy: "#6E1F2B",
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        label: "0.2em",
      },
      keyframes: {
        "robot-bob": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-2px)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "hero-ken": {
          "0%": { transform: "scale(1.06)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "robot-bob": "robot-bob 3s ease-in-out infinite",
        "fade-up": "fade-up 0.9s ease-out both",
        "hero-ken": "hero-ken 12s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
