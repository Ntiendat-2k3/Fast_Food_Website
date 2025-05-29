/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}", "*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FFDD00", // Vàng sáng
          dark: "#F2C94C", // Vàng đậm hơn
          light: "#FFF3B0", // Vàng nhạt
        },
        dark: {
          DEFAULT: "#1E1E1E", // Gần như đen
          light: "#2D2D2D", // Xám đậm
          lighter: "#3D3D3D", // Xám vừa
        },
        accent: "#FF4D4D", // Đỏ nhấn
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
          dark: "#111827", // card background
        },
        green: {
          DEFAULT: "#065f46", // dark green (primary text)
          dark: "#064e3b", // darker green
          medium: "#059669", // medium green
          light: "#10b981", // light green
        },
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
        display: ["Montserrat", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
        "4xl": "3rem",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        custom: "0 10px 30px rgba(0, 0, 0, 0.1)",
        hover: "0 15px 35px rgba(0, 0, 0, 0.15)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
}
