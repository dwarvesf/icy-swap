/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        foreground: {
          DEFAULT: "#23252C",
          100: "#1d2232",
        },
        brand: {
          DEFAULT: "#e03e5e",
          500: "#e03e5e",
          600: "#c51f4a",
          700: "#aa0036",
          800: "#900024",
          900: "#760013",
          1000: "#5c0000",
        },
        icy: {
          DEFAULT: "#AED5E2",
          100: "#95E3E7",
          200: "#88EFD9",
          300: "#99F7BB",
          400: "#C2FB95",
          500: "#F9F871",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
