/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f7f7f5",
          100: "#efeee9",
          200: "#e2dfd5",
          300: "#ccc7b8",
          400: "#aba38f",
          500: "#8d856f",
          600: "#736b58",
          700: "#5f584a",
          800: "#4f4a3f",
          900: "#433f37"
        },
        accent: {
          50: "#eef8f6",
          100: "#d7f0ea",
          200: "#b4e3d9",
          300: "#84cdbf",
          400: "#56b2a1",
          500: "#3a9687",
          600: "#2b796d",
          700: "#266158",
          800: "#244d48",
          900: "#203f3b"
        }
      },
      boxShadow: {
        soft: "0 12px 34px rgba(18, 23, 35, 0.12)",
        softDark: "0 18px 44px rgba(0, 0, 0, 0.35)"
      },
      borderRadius: {
        "2.5xl": "1.3rem"
      },
      maxWidth: {
        "screen-3xl": "1440px"
      }
    }
  },
  plugins: []
};
