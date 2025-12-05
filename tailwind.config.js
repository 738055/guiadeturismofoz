// tailwind.config.js
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'foz-azul-escuro': '#002F6C',
        'foz-azul-claro': '#00A3E0',
        'foz-verde': '#009739',
        'foz-amarelo': '#FFD100',
        'foz-bege': '#0b7ef2ff',
        'foz-cinza': '#4A5568',
        // NOVO: Cor de destaque para o serviço feminino
        'acento-mulher': '#FF69B4', // Hot Pink
        'acento-mulher-dark': '#E91E63', // Um tom mais escuro
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        serif: ['var(--font-merriweather)', 'serif'],
      },
      boxShadow: {
        'card': '0 10px 30px -10px rgba(0, 47, 108, 0.1)',
        'card-hover': '0 20px 40px -10px rgba(0, 47, 108, 0.2)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      transitionTimingFunction: {
        'elastic': 'cubic-bezier(0.25, 1, 0.5, 1)', // Curva suave usada no AquaFoz
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('tailwind-scrollbar-hide'),
  ],
};
export default config;