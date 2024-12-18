/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      height:{
        ext: "600px",
      },
      width:{
        ext:"400px"
      },
    },
  },
  plugins: [],
}

