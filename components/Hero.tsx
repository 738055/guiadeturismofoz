'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';
import { Locale } from '@/i18n/dictionaries';

interface HeroProps {
  dict: any;
  lang: Locale;
}

export const Hero: React.FC<HeroProps> = ({ dict: t, lang }) => {
  return (
    <section className="relative h-[90vh] w-full overflow-hidden flex flex-col justify-end">
      {/* --- 1. VÍDEO DE FUNDO --- */}
      <div className="absolute inset-0 z-0">
        {/* Overlay escuro para garantir leitura */}
        <div className="absolute inset-0 bg-black/20 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-foz-azul-escuro/90 via-transparent to-transparent z-10" />

        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover pointer-events-none scale-105"
          poster="/54.jpg" 
        >
          {/* ATENÇÃO: Coloque seu vídeo na pasta 'public' e atualize o src abaixo */}
          <source 
            src="https://videos.pexels.com/video-files/2871902/2871902-uhd_2560_1440_24fps.mp4" 
            type="video/mp4" 
          />
        </video>
      </div>

      {/* --- 2. CONTEÚDO CENTRAL --- */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
        
        {/* Texto Principal */}
        <div className="mb-10 max-w-3xl animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-bold text-white font-serif leading-tight drop-shadow-lg mb-4">
            {t.title}
          </h1>
          <p className="text-lg md:text-2xl text-white/90 font-medium drop-shadow-md max-w-2xl">
            {t.subtitle}
          </p>
        </div>

        {/* --- 3. GLASS CARD HORIZONTAL (BASE DO VÍDEO) --- */}
        <div className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 shadow-2xl animate-slide-up-fade">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
            
            {/* Bloco 1: Destaque Visual */}
            <div className="flex items-center gap-4 px-6 py-4 w-full md:w-auto md:border-r border-white/10">
              <div className="bg-verde-principal/90 p-3 rounded-full text-white shadow-lg shadow-verde-principal/20">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <p className="text-white/70 text-xs font-bold uppercase tracking-wider">Experiência</p>
                <p className="text-white font-bold text-lg leading-tight">Melhores Passeios</p>
              </div>
            </div>

            {/* Bloco 2: Preço/Oferta (Simulado) */}
            <div className="flex items-center gap-4 px-6 py-4 w-full md:w-auto flex-1">
               <div className="hidden md:block w-px h-10 bg-white/10 mr-4"></div>
               <div>
                 <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">Ofertas a partir de</p>
                 <div className="flex items-baseline gap-2">
                   <span className="text-2xl font-bold text-foz-amarelo">R$ 149,90</span>
                   <span className="text-sm text-white/50 line-through decoration-white/50">R$ 199,00</span>
                 </div>
               </div>
            </div>

            {/* Bloco 3: Botão de Ação */}
            <div className="p-2 w-full md:w-auto">
              <Link 
                href={`/${lang}/roteiro`}
                className="group flex items-center justify-center gap-3 bg-foz-amarelo hover:bg-yellow-400 text-foz-azul-escuro font-extrabold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <span>{t.searchRoteiroButton || "RESERVAR AGORA"}</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};