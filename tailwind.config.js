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
        // CORREÇÃO: Altera 'foz-bege' para um tom de cinza claro/off-white mais apropriado.
        'foz-bege': '#F3F4F6', 
        'foz-cinza': '#4A5568',
        // NOVO: Cor de destaque para o serviço feminino
        'acento-mulher': '#FF69B4', 
        'acento-mulher-dark': '#E91E63', 
        
        // CORREÇÃO ESSENCIAL: Adiciona ALIASES para as cores usadas nos componentes
        'verde-principal': '#009739', // Agora 'bg-verde-principal' é verde
        'verde-secundario': '#00A3E0', // Agora 'hover:bg-verde-secundario' é azul/ciano
        'azul-foz': '#00A3E0', 
        'acento-dourado': '#FFD100', 
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
        'elastic': 'cubic-bezier(0.25, 1, 0.5, 1)', 
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