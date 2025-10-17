/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#FF5722",
        secondary: "#F59E0B",
        dark: "#0F172A",
      },
    },
  },
  plugins: [],
};
