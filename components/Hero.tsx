// components/Hero.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';
import { Locale } from '@/i18n/dictionaries';

interface HeroProps {
  dict: any;
  lang: Locale;
}

export const Hero: React.FC<HeroProps> = ({ dict: t, lang }) => {
  return (
    <section className="relative h-[95vh] w-full overflow-hidden flex items-center justify-center">
      {/* Vídeo Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/30 z-10" /> {/* Overlay mais escuro para contraste */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 z-10" />
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-105 animate-slow-pan" // Animação sutil de movimento
          poster="/54.jpg" 
        >
          <source 
            src="https://videos.pexels.com/video-files/2871902/2871902-uhd_2560_1440_24fps.mp4" 
            type="video/mp4" 
          />
        </video>
      </div>

      {/* Conteúdo Central */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white font-serif mb-6 drop-shadow-2xl tracking-tight animate-fade-in-up">
          {t.title}
        </h1>
        <p className="text-lg md:text-2xl text-white/90 font-light mb-12 max-w-3xl mx-auto drop-shadow-md animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {t.subtitle}
        </p>

        {/* Barra de Ação Flutuante (Estilo AquaFoz) */}
        <div 
          className="inline-flex flex-col md:flex-row items-center bg-white/10 backdrop-blur-xl border border-white/30 p-2 rounded-2xl shadow-glass animate-fade-in-up mx-auto max-w-4xl w-full md:w-auto"
          style={{ animationDelay: '0.4s' }}
        >
          <div className="flex-1 w-full md:w-auto px-6 py-4 border-b md:border-b-0 md:border-r border-white/10 text-left">
             <span className="block text-xs text-foz-amarelo font-bold uppercase tracking-wider mb-1">O que você procura?</span>
             <span className="text-white text-lg font-medium opacity-90">Passeios, Ingressos, Combos...</span>
          </div>

          <div className="p-2 w-full md:w-auto">
            <Link 
              href={`/${lang}/roteiro`}
              className="group flex items-center justify-center gap-3 bg-foz-verde hover:bg-green-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-green-500/30 w-full md:w-auto"
            >
              <span>{t.searchRoteiroButton || "RESERVAR AGORA"}</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
           <div className="w-1 h-2 bg-white rounded-full animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};