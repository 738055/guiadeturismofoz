// components/UmbrellaCuriosity.tsx
'use client';

import React from 'react';
import { Locale } from '@/i18n/dictionaries';
import { Umbrella } from 'lucide-react'; // Ícone de guarda-chuva do lucide-react

interface UmbrellaCuriosityProps {
  dict: any;
  lang: Locale;
}

export const UmbrellaCuriosity: React.FC<UmbrellaCuriosityProps> = ({ dict: t }) => {
  if (!t) return null;

  return (
    <section className="py-20 bg-gradient-to-br from-azul-claro-foz/10 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-verde-principal mb-4 font-serif">
            {t.title}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20">
          {/* SVG Animado do Guarda-Chuva */}
          <div className="w-full max-w-sm lg:w-1/2 flex justify-center items-center p-6 bg-white rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden">
            {/* Elemento de fundo para o efeito de "sol" */}
            <div className="absolute inset-0 z-0 bg-yellow-500/10 rounded-full blur-3xl scale-150 animate-pulse-slow-fade"></div>

            <svg
              width="200"
              height="200"
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="relative z-10 w-full h-full max-w-[180px]"
            >
              {/* Gotas de chuva (opcional, animadas) */}
              <circle cx="10" cy="10" r="2" fill="#00AEEF" opacity="0">
                <animate attributeName="opacity" values="0;1;0" keyTimes="0;0.5;1" dur="2s" begin="0.5s" repeatCount="indefinite" />
                <animate attributeName="cy" values="10;50;80" keyTimes="0;0.5;1" dur="2s" begin="0.5s" repeatCount="indefinite" />
              </circle>
              <circle cx="170" cy="20" r="2.5" fill="#00AEEF" opacity="0">
                <animate attributeName="opacity" values="0;1;0" keyTimes="0;0.5;1" dur="2s" begin="0s" repeatCount="indefinite" />
                <animate attributeName="cy" values="20;70;100" keyTimes="0;0.5;1" dur="2s" begin="0s" repeatCount="indefinite" />
              </circle>

              {/* Guarda-chuva: topo */}
              <path
                d="M10 100 C 30 50, 70 30, 100 30 C 130 30, 170 50, 190 100 L 10 100 Z"
                fill="#006837" // Verde Principal
                stroke="#006837"
                strokeWidth="2"
              >
                <animateTransform
                  attributeName="transform"
                  attributeType="XML"
                  type="rotate"
                  from="0 100 65"
                  to="10 100 65"
                  dur="1.5s"
                  repeatCount="indefinite"
                  additive="sum"
                  restart="always"
                  direction="alternate"
                />
              </path>

              {/* Guarda-chuva: cabo */}
              <rect x="95" y="100" width="10" height="70" fill="#6B461B" />
              <path d="M95 170 Q 95 190, 105 190 L 105 170 Z" fill="#6B461B" /> {/* Curva da ponta */}
              
              {/* Efeito de "proteção" ou "brilho" */}
              <circle cx="100" cy="70" r="30" fill="white" opacity="0.2">
                <animate attributeName="r" values="30;35;30" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.2;0.3;0.2" dur="2s" repeatCount="indefinite" />
              </circle>
            </svg>
          </div>

          {/* Texto Explicativo */}
          <div className="w-full lg:w-1/2 text-center lg:text-left space-y-6 max-w-xl">
            <p className="text-gray-700 leading-relaxed text-lg">
              <strong className="text-verde-principal">{t.text1}</strong> {t.text2}
            </p>
            <p className="text-gray-700 leading-relaxed text-lg">
              {t.text3}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};