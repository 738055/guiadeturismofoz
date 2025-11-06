// tailwind.config.js
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta sugerida para Guia de Turismo Foz (Verde mata + Azul cataratas)
        'verde-principal': '#006837', // Um verde mais institucional/bandeira
        'verde-secundario': '#8CC63F', // Um verde mais vivo para detalhes
        'azul-foz': '#00AEEF', // Azul vibrante representando água/céu
        'acento-dourado': '#F7941D', // Um laranja/dourado para chamadas de ação (pôr do sol)
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        serif: ['var(--font-merriweather)', 'serif'],
      },
      boxShadow: {
        'card': '0 2px 8px -2px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
};
export default config;