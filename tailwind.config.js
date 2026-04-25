/** @type {import('tailwindcss').Config} */
export default {
  // When <html> has class "dark", Tailwind applies every "dark:" class you wrote
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        xs: "0px",
        sm: "576px",
        md: "768px",
        lg: "992px",
        xl: "1200px",
        "2xl": "1400px",
      },
      colors: {
        primary: "#2563EB",
        primaryHover: "#1D4ED8",
        lightBlue: "#60A5FA",
        secondary: "#4B5563",
        secondaryHover: "#d1d5db",
      },
    },
  },
  plugins: [],
};
