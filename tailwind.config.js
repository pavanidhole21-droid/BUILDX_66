/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        blood: {
          50: "#FEF2F2",
          100: "#FEE2E2",
          200: "#FECACA",
          300: "#FCA5A5",
          400: "#F87171",
          500: "#EF4444",
          600: "#DC2626",
          700: "#B91C1C",
          800: "#991B1B",
          900: "#7F1D1D",
          DEFAULT: "#E53935",
        },
        medical: {
          teal: "#0D9488",
          blue: "#2563EB",
          green: "#16A34A",
          greenLight: "#DCFCE7",
          blueLight: "#DBEAFE",
          amber: "#D97706",
          amberLight: "#FEF3C7",
        },
        surface: {
          card: "#FFFFFF",
          muted: "#F8FAFC",
          border: "#E2E8F0",
        },
      },
    },
  },
  plugins: [],
};
