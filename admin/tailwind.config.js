/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}", "*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FFDD00", // Bright yellow
          dark: "#F2C94C", // Darker yellow
          light: "#FFF3B0", // Light yellow
        },
        dark: {
          DEFAULT: "#1E1E1E", // Almost black
          light: "#2D2D2D", // Dark gray
          lighter: "#3D3D3D", // Medium gray
        },
        accent: "#FF4D4D", // Red accent
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
        display: ["Montserrat", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        custom: "0 10px 30px rgba(0, 0, 0, 0.1)",
        hover: "0 15px 35px rgba(0, 0, 0, 0.15)",
      },
    },
  },
  plugins: [],
}
