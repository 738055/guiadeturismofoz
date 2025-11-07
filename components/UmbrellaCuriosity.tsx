// components/UmbrellaCuriosity.tsx
'use client';

import React from 'react';
import Image from 'next/image'; // 1. Importe o 'Image' do Next.js
import { Locale } from '@/i18n/dictionaries';

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

       
            <Image
              src="/logo.png" 
              alt="Ilustração de um guarda-chuva"
              width={200}
              height={200}
              className="relative z-10 w-full h-full max-w-[180px]"
            />
            {/* --- FIM DA SUBSTITUIÇÃO --- */}

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