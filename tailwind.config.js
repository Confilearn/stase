/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#A0CCFF",
        secondary: "#0A385D",
        accent: "#091727",
        content: {
          100: "#0E0F0C",
          200: "#454745",
          300: "#6A6C6A",
          400: "#D9D9D9",
          500: "#FFFFFF",
        },
        bg: {
          light: "#FFFFFF",
          dark: "#0E0F0C",
          neutral: "#16330014",
        },
        error: "#dc2626",
        success: "#05D23F",
        warning: "#EDC843",
      },
      fontFamily: {
        metropolis: ["metropolis", "sans-serif"],
        "metropolis-extrabold": ["metropolis-extra-bold", "sans-serif"],
        "metropolis-bold": ["metropolis-bold", "sans-serif"],
        "metropolis-semibold": ["metropolis-semi-bold", "sans-serif"],
        "metropolis-medium": ["metropolis-medium", "sans-serif"],
      },
    },
  },
  plugins: [],
};
