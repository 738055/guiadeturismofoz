// components/Hero.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, MapPin, Star } from 'lucide-react';
import { Locale } from '@/i18n/dictionaries';

interface HeroProps {
  dict: any;
  lang: Locale;
}

export const Hero: React.FC<HeroProps> = ({ dict: t, lang }) => {
  return (
    <section className="relative h-[90vh] w-full overflow-hidden flex flex-col justify-end group">
      {/* --- VÍDEO DE FUNDO --- */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover pointer-events-none"
          // Use uma imagem leve como poster para carregar rápido antes do vídeo
          poster="/54.jpg" 
        >
          {/* ATENÇÃO: Substitua este SRC pelo caminho do seu vídeo na pasta public (ex: /videos/cataratas.mp4) */}
          <source 
            src="https://videos.pexels.com/video-files/2871902/2871902-uhd_2560_1440_24fps.mp4" 
            type="video/mp4" 
          />
        </video>
        
        {/* Overlay escuro para o texto brilhar */}
        <div className="absolute inset-0 bg-gradient-to-t from-foz-azul-escuro/90 via-foz-azul-escuro/20 to-black/30" />
      </div>

      {/* --- CONTEÚDO --- */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 md:pb-16">
        
        {/* Texto Principal (Canto superior ou meio) */}
        <div className="mb-8 md:mb-16 max-w-3xl animate-in fade-in slide-in-from-left-10 duration-1000">
          <h1 className="text-5xl md:text-7xl font-bold text-white font-serif leading-tight drop-shadow-2xl mb-4">
            {t.title}
          </h1>
          <p className="text-lg md:text-2xl text-white/90 font-medium drop-shadow-md max-w-xl">
            {t.subtitle}
          </p>
        </div>

        {/* --- CARD HORIZONTAL FLUTUANTE (Igual ao vídeo) --- */}
        {/* Glassmorphism: fundo translúcido e blur */}
        <div className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-1 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-1000 delay-200">
          <div className="flex flex-col md:flex-row items-stretch">
            
            {/* Lado Esquerdo: Ícone/Destaque */}
            <div className="flex-1 p-6 flex items-center gap-5 border-b md:border-b-0 md:border-r border-white/10">
              <div className="bg-verde-principal p-4 rounded-full shadow-lg shadow-verde-principal/40">
                 <Star className="w-8 h-8 text-white animate-pulse" />
              </div>
              <div>
                <h3 className="text-white font-bold text-xl uppercase tracking-wide">Destaque do Mês</h3>
                <p className="text-white/80 text-sm">As melhores experiências selecionadas para você.</p>
              </div>
            </div>

            {/* Centro: Preço/Oferta */}
            <div className="flex-1 p-6 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/10 bg-white/5">
               <p className="text-white/70 text-xs font-bold uppercase mb-1">A partir de</p>
               <div className="flex items-baseline gap-1">
                 <span className="text-white/60 text-sm line-through">R$ 199,00</span>
                 <span className="text-3xl font-extrabold text-foz-amarelo">R$ 149,90</span>
               </div>
            </div>

            {/* Lado Direito: Botão CTA */}
            <div className="p-4 md:p-6 flex items-center justify-center">
              <Link 
                href={`/${lang}/roteiro`}
                className="w-full md:w-auto bg-foz-amarelo hover:bg-yellow-400 text-foz-azul-escuro font-extrabold text-lg py-4 px-10 rounded-xl transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-foz-amarelo/50 flex items-center justify-center gap-2"
              >
                <span>{t.searchRoteiroButton || "RESERVAR AGORA"}</span>
                <ArrowRight className="w-6 h-6" />
              </Link>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};