import containerQueries from "@tailwindcss/container-queries";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  // Follows the visitor's system setting. (An app that toggles dark mode with a class can reuse
  // the same components with darkMode: "class".)
  darkMode: "media",
  theme: {
    extend: {
      // Your brand color, set in src/index.css.
      colors: { brand: "rgb(var(--brand) / <alpha-value>)" },
    },
  },
  // Container queries (@container, @2xl:): the page preview lays out by its own width, not the window's.
  plugins: [containerQueries],
};
