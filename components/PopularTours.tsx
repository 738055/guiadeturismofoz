// components/PopularTours.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Clock, MapPin } from 'lucide-react';
import { Locale } from '@/i18n/dictionaries';

type Tour = {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  location: string;
  imageUrl?: string;
};

interface PopularToursProps {
  tours: Tour[];
  dict: {
    popular: string;
    from: string;
    viewDetails: string;
    hours: string;
  };
  lang: Locale;
}

export const PopularTours: React.FC<PopularToursProps> = ({ tours, dict, lang }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Define o primeiro como ativo ao carregar
  useEffect(() => {
    if (tours && tours.length > 0) {
      setActiveId(tours[0].id);
    }
  }, [tours]);

  if (!tours || tours.length === 0) return null;
  
  // Exibe apenas os 5 primeiros para manter o layout bonito
  const displayTours = tours.slice(0, 5);

  // Lógica de Scroll para Mobile (Intersection Observer)
  useEffect(() => {
    const observerOptions = {
      root: null,
      // Área de ativação mais precisa no centro da tela do celular
      rootMargin: '-40% 0px -40% 0px',
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      // Só ativa no mobile (< 1024px) para não conflitar com o mouse do desktop
      if (window.innerWidth >= 1024) return;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('data-id');
          if (id) setActiveId(id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    cardsRef.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, [displayTours]);

  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabeçalho */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-3xl md:text-5xl font-bold text-foz-azul-escuro font-serif mb-4">
            {dict.popular}
          </h2>
          <div className="w-20 h-1.5 bg-foz-amarelo mx-auto rounded-full opacity-80"></div>
        </div>

        {/* Container Flex (Vertical no Mobile, Horizontal no Desktop) */}
        <div className="flex flex-col lg:flex-row gap-4 w-full lg:h-[600px]">
          
          {displayTours.map((tour, index) => {
            const isActive = activeId === tour.id;

            return (
              <div
                key={tour.id}
                ref={(el) => { cardsRef.current[index] = el; }}
                data-id={tour.id}
                onMouseEnter={() => setActiveId(tour.id)} // Desktop: Hover ativa
                onClick={() => setActiveId(tour.id)} // Mobile: Click também ativa
                className={`
                  group relative overflow-hidden rounded-3xl cursor-pointer shadow-lg transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]
                  
                  /* --- COMPORTAMENTO MOBILE (Vertical) --- */
                  w-full
                  ${isActive ? 'h-[420px] ring-4 ring-verde-principal/20 z-10' : 'h-[100px] opacity-90'} 
                  
                  /* --- COMPORTAMENTO DESKTOP (Horizontal) --- */
                  lg:h-full lg:w-auto lg:opacity-100
                  ${isActive ? 'lg:flex-[3.5]' : 'lg:flex-1'}
                `}
              >
                {/* Link que cobre o card (para navegação) */}
                <Link href={`/${lang}/tour/${tour.id}`} className="absolute inset-0 z-20" aria-label={`Ver detalhes de ${tour.title}`} />

                {/* 1. Imagem de Fundo */}
                <div className="absolute inset-0 w-full h-full pointer-events-none">
                  <Image
                    src={tour.imageUrl || '/54.jpg'}
                    alt={tour.title}
                    fill
                    className={`
                      object-cover transition-transform duration-1000 
                      ${isActive ? 'scale-110 grayscale-0' : 'scale-100 grayscale-[30%] lg:grayscale-[100%]'}
                    `}
                    sizes="(max-width: 768px) 100vw, 30vw"
                  />
                  {/* Overlay Gradiente */}
                  <div className={`
                    absolute inset-0 bg-gradient-to-t from-foz-azul-escuro/95 via-foz-azul-escuro/30 to-transparent transition-opacity duration-500
                    ${isActive ? 'opacity-90' : 'opacity-70'}
                  `} />
                </div>

                {/* 2. Conteúdo do Card */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end overflow-hidden pointer-events-none">
                  
                  {/* Título e Preço */}
                  <div className={`
                    transform transition-all duration-500 origin-bottom-left
                    ${isActive 
                      ? 'translate-y-0 mb-0' 
                      : 'translate-y-2 lg:mb-12 lg:-rotate-90 lg:translate-x-4' 
                    }
                  `}>
                    <div className="flex justify-between items-end mb-1">
                      <h3 className={`
                        font-serif font-bold text-white leading-none drop-shadow-lg transition-all duration-500
                        ${isActive ? 'text-2xl md:text-3xl' : 'text-xl lg:text-2xl whitespace-nowrap'}
                      `}>
                        {tour.title}
                      </h3>
                      
                      {/* Ícone de Seta (Aparece quando ativo) */}
                      <div className={`
                        bg-white/20 backdrop-blur-md p-2 rounded-full transition-all duration-500
                        ${isActive ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-45'}
                      `}>
                        <ArrowUpRight className="w-5 h-5 text-white" />
                      </div>
                    </div>

                    {/* Preço */}
                    <p className={`
                      text-foz-amarelo font-bold transition-all duration-500
                      ${isActive ? 'text-xl opacity-100' : 'text-sm opacity-90 lg:opacity-0'}
                    `}>
                      <span className="text-xs text-white/80 font-normal mr-2 uppercase tracking-wide">{dict.from}</span>
                      R$ {tour.price.toFixed(2)}
                    </p>
                  </div>

                  {/* Detalhes Ocultos (Descrição e Botão) - Aparecem APENAS no ACTIVE */}
                  <div className={`
                    transition-all duration-700 ease-in-out overflow-hidden
                    ${isActive ? 'max-h-[300px] opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}
                  `}>
                    {/* Descrição visível em mobile e desktop quando ativo */}
                    <p className="text-white/90 text-sm line-clamp-3 mb-4 leading-relaxed">
                      {tour.description}
                    </p>

                    <div className="flex flex-wrap gap-3 mb-4">
                      <div className="flex items-center gap-1.5 bg-white/10 border border-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                        <Clock className="w-3.5 h-3.5 text-foz-amarelo" />
                        <span className="text-xs font-bold text-white uppercase">{tour.duration}h</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/10 border border-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                        <MapPin className="w-3.5 h-3.5 text-verde-principal" />
                        <span className="text-xs font-bold text-white uppercase truncate max-w-[120px]">{tour.location}</span>
                      </div>
                    </div>

                    <button className="w-full bg-foz-verde hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg transform hover:translate-y-px text-sm uppercase tracking-wider flex items-center justify-center gap-2">
                      {dict.viewDetails} <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};