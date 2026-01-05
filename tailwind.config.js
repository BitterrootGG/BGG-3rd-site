/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  mode: "jit",
  theme: {
    extend: {
      colors: {
        primary: "#0b120e",
        secondary: "#9ca3af",
        tertiary: "#1e3a2a",
        "black-100": "#0f1d14",
        "black-200": "#0b120e",
        "white-100": "#e5e7eb",
        forest: {
          black: "#0b120e",
          dark: "#0f1d14",
          mid: "#1e3a2a",
          moss: "#4f6f52",
          sage: "#7a9b7e",
        },
        stone: {
          light: "#e5e7eb",
          mid: "#9ca3af",
          dark: "#4b5563",
        },
      },
      boxShadow: {
        card: "0px 35px 120px -15px #211e35",
      },
      screens: {
        xs: "450px",
      },
      backgroundImage: {
        "hero-pattern": "url('/src/assets/herobg.png')",
      },
    },
  },
  plugins: [],
};
