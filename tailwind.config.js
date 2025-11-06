import type { Config } from "tailwindcss";

const config: Config = {
  content: [

    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'verde-principal': '#3a5a40',
        'verde-secundario': '#6a7c49',
        'acento-dourado': '#c9a66b',
        'acento-azul': '#3b5998',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        serif: ['var(--font-merriweather)', 'serif'],
      },
    },
  },
  plugins: [],
};
export default config;