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
        // PALETA VIBRANTE BASEADA NA LOGO
        'azul-profundo': '#0B3D91', // Azul escuro para textos principais e contrastes (mantido, mas usado com menos peso)
        'azul-vibrante': '#00AEEF', // COR PRINCIPAL DE AÇÃO: Azul claro do pin. Usar em botões, links ativos, ícones.
        
        'verde-destaque': '#009B3A', // Verde bandeira para chamar atenção (preços, botões secundários, ícones de natureza)
        'amarelo-sol': '#FFD700',    // Amarelo bandeira/sol para CTAs fortes, estrelas, ofertas.
        
        // Neutros mais quentes para evitar o "cinza morto"
        'cinza-texto': '#2D3748',    // Um cinza azulado mais escuro e legível
        'off-white': '#F7FAFC',      // Fundo levemente azulado/frio, melhor que cinza puro
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        serif: ['var(--font-merriweather)', 'serif'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.1)', // Sombra mais suave e moderna
        'card-hover': '0 10px 30px -5px rgba(11, 61, 145, 0.2)', // Sombra colorida ao passar o mouse (azul-profundo)
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'pulse-vibrant': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('tailwind-scrollbar-hide'),
  ],
};
export default config;