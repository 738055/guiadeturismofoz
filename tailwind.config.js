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
        // PALETA VIBRANTE "GUIA FOZ"
        'foz-azul-escuro': '#002F6C', // Azul institucional forte (texto principal, headers)
        'foz-azul-claro': '#00A3E0',  // Azul ciano vibrante (ícones, detalhes, links)
        'foz-verde': '#009739',       // Verde bandeira (natureza, confirmações, preços)
        'foz-amarelo': '#FFD100',     // Amarelo sol (CTAs, destaques, estrelas)
        
        // Neutros mais quentes para fundo
        'foz-bege': '#F8F9FA',        // Fundo quase branco, mais acolhedor que cinza
        'foz-cinza': '#4A5568',       // Texto secundário legível
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        serif: ['var(--font-merriweather)', 'serif'],
      },
      boxShadow: {
        'card': '0 8px 24px -4px rgba(0, 47, 108, 0.08)', // Sombra levemente azulada
        'card-hover': '0 15px 40px -8px rgba(0, 163, 224, 0.25)', // Sombra vibrante ao passar o mouse
      },
      animation: {
        'pulse-vibrant': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
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