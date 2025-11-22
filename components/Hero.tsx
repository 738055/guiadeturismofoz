// components/Hero.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, MapPin } from 'lucide-react';
import { Locale } from '@/i18n/dictionaries';

interface HeroProps {
  dict: any;
  lang: Locale;
}

export const Hero: React.FC<HeroProps> = ({ dict: t, lang }) => {
  return (
    <section className="relative h-[85vh] w-full overflow-hidden flex flex-col justify-end">
      {/* --- BACKGROUND VIDEO --- */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover pointer-events-none"
          poster="/54.jpg" // Imagem de fallback enquanto carrega
        >
          {/* Substitua este link pelo seu vídeo local em /public */}
          <source 
            src="https://videos.pexels.com/video-files/2330213/2330213-uhd_2560_1440_24fps.mp4" 
            type="video/mp4" 
          />
        </video>
        
        {/* Overlay Gradiente para garantir leitura do texto */}
        <div className="absolute inset-0 bg-gradient-to-b from-foz-azul-escuro/30 via-transparent to-foz-azul-escuro/90" />
      </div>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 md:pb-20">
        
        {/* Texto Hero */}
        <div className="mb-8 md:mb-12 max-w-4xl animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs md:text-sm font-bold uppercase tracking-widest mb-4">
            Bem-vindo a Foz do Iguaçu
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white font-serif leading-tight drop-shadow-lg">
            {t.title}
          </h1>
          <p className="text-lg md:text-xl text-white/90 mt-4 max-w-2xl font-medium drop-shadow-md">
            {t.subtitle}
          </p>
        </div>

        {/* --- CARD SOBREPOSTO NA BASE (HORIZONTAL) --- */}
        <div className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 md:p-6 shadow-2xl animate-in zoom-in-95 duration-1000 delay-200">
          <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
            
            {/* Informação 1 */}
            <div className="flex items-center gap-4 w-full md:w-auto border-b md:border-b-0 md:border-r border-white/10 pb-4 md:pb-0 md:pr-6">
              <div className="p-3 bg-verde-principal rounded-full text-white">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-white/70 text-xs uppercase font-bold tracking-wider">Planejamento</p>
                <p className="text-white font-semibold text-lg">Monte seu Roteiro</p>
              </div>
            </div>

            {/* Informação 2 */}
            <div className="hidden md:flex items-center gap-4 w-full md:w-auto md:pr-6">
              <div className="p-3 bg-azul-foz rounded-full text-white">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="text-white/70 text-xs uppercase font-bold tracking-wider">Destino</p>
                <p className="text-white font-semibold text-lg">Foz do Iguaçu, PR</p>
              </div>
            </div>

            {/* Botão de Ação (CTA) */}
            <div className="w-full md:w-auto flex-shrink-0">
              <Link 
                href={`/${lang}/roteiro`}
                className="group flex items-center justify-center gap-3 w-full md:w-auto bg-foz-amarelo hover:bg-yellow-400 text-foz-azul-escuro font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-foz-amarelo/30"
              >
                <span>{t.searchRoteiroButton || "Começar Aventura"}</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};