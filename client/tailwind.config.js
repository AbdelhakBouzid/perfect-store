/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef3ff",
          100: "#d9e5ff",
          200: "#b4ccff",
          300: "#86a7ff",
          400: "#5f82ff",
          500: "#3d62f3",
          600: "#2f4cd4",
          700: "#263dab",
          800: "#21368a",
          900: "#1d2f72"
        }
      },
      boxShadow: {
        glass: "0 28px 80px rgba(8, 17, 76, 0.45)"
      }
    }
  },
  plugins: []
};
