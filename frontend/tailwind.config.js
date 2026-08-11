/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1E2A28",
        surface: "#EEF1EF",
        primary: "#24504C",
        accent: "#B8703F",
      },
    },
  },
  plugins: [],
};
