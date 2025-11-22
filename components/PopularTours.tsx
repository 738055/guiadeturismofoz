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
  // O primeiro tour começa ativo
  const [activeId, setActiveId] = useState<string | null>(null);
  const cardsRef = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    if (tours && tours.length > 0) {
      setActiveId(tours[0].id);
    }
  }, [tours]);

  if (!tours || tours.length === 0) return null;
  const displayTours = tours.slice(0, 5);

  // Lógica de Scroll para Mobile (Intersection Observer)
  useEffect(() => {
    const observerOptions = {
      root: null,
      // Margem negativa força o ponto de ativação a ser uma faixa estreita no centro da tela
      rootMargin: '-40% 0px -40% 0px',
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      // Só ativa no mobile (< 1024px) para não conflitar com o hover do desktop
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
    <section className="py-24 bg-foz-bege overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabeçalho */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-foz-azul-escuro font-serif mb-4">
            {dict.popular}
          </h2>
          <div className="w-24 h-1.5 bg-verde-principal mx-auto rounded-full opacity-80"></div>
        </div>

        {/* Container Flex (Vertical no Mobile, Horizontal no Desktop) */}
        <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[600px] w-full">
          
          {displayTours.map((tour, index) => {
            const isActive = activeId === tour.id;

            return (
              <Link
                key={tour.id}
                href={`/${lang}/tour/${tour.id}`}
                ref={(el) => { cardsRef.current[index] = el; }}
                data-id={tour.id}
                onMouseEnter={() => setActiveId(tour.id)} // Desktop: Hover ativa
                className={`
                  group relative overflow-hidden rounded-3xl cursor-pointer shadow-xl transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]
                  
                  /* --- COMPORTAMENTO MOBILE (Vertical) --- */
                  w-full
                  ${isActive ? 'h-[400px] ring-4 ring-verde-principal/20' : 'h-[120px]'} 
                  
                  /* --- COMPORTAMENTO DESKTOP (Horizontal) --- */
                  lg:h-full lg:w-auto
                  ${isActive ? 'lg:flex-[3.5]' : 'lg:flex-1'}
                `}
              >
                {/* 1. Imagem de Fundo */}
                <div className="absolute inset-0 w-full h-full">
                  <Image
                    src={tour.imageUrl || '/54.jpg'}
                    alt={tour.title}
                    fill
                    className={`
                      object-cover transition-transform duration-1000 
                      ${isActive ? 'scale-110 grayscale-0' : 'scale-100 grayscale-[50%] lg:scale-100'}
                    `}
                    sizes="(max-width: 768px) 100vw, 30vw"
                  />
                  {/* Overlay Gradiente */}
                  <div className={`
                    absolute inset-0 bg-gradient-to-t from-foz-azul-escuro/95 via-foz-azul-escuro/40 to-transparent transition-opacity duration-500
                    ${isActive ? 'opacity-80' : 'opacity-70'}
                  `} />
                </div>

                {/* 2. Conteúdo do Card */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end overflow-hidden">
                  
                  {/* Título e Preço */}
                  <div className={`
                    transform transition-all duration-500 origin-bottom-left
                    ${isActive 
                      ? 'translate-y-0 mb-0' 
                      : 'lg:mb-12 lg:-rotate-90 lg:translate-x-2 translate-y-2' /* No mobile inativo, o texto desce um pouco */
                    }
                  `}>
                    <div className="flex justify-between items-end mb-1">
                      <h3 className={`
                        font-serif font-bold text-white leading-none drop-shadow-lg transition-all duration-500
                        ${isActive ? 'text-2xl md:text-3xl' : 'text-xl lg:text-2xl whitespace-nowrap'}
                      `}>
                        {tour.title}
                      </h3>
                      
                      {/* Seta (Apenas Desktop ou Mobile Ativo) */}
                      <div className={`
                        bg-white/20 backdrop-blur-md p-2 rounded-full transition-all duration-500
                        ${isActive ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-45 lg:hidden'}
                      `}>
                        <ArrowUpRight className="w-5 h-5 text-white" />
                      </div>
                    </div>

                    {/* Preço (Visível quando ativo ou no mobile inativo de forma reduzida) */}
                    <p className={`
                      text-foz-amarelo font-bold transition-all duration-500
                      ${isActive ? 'text-xl opacity-100' : 'text-sm opacity-80 lg:opacity-0'}
                    `}>
                      <span className="text-xs text-white/80 font-normal mr-2 uppercase tracking-wide hidden sm:inline">{dict.from}</span>
                      R$ {tour.price.toFixed(2)}
                    </p>
                  </div>

                  {/* Detalhes Ocultos (Aparecem apenas no ACTIVE) */}
                  <div className={`
                    transition-all duration-700 ease-in-out overflow-hidden
                    ${isActive ? 'max-h-[200px] opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}
                  `}>
                    <p className="text-white/90 text-sm line-clamp-2 mb-4 leading-relaxed hidden sm:block">
                      {tour.description}
                    </p>

                    <div className="flex flex-wrap gap-3 mb-4 md:mb-0">
                      <div className="flex items-center gap-1.5 bg-white/10 border border-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                        <Clock className="w-3.5 h-3.5 text-foz-amarelo" />
                        <span className="text-xs font-bold text-white uppercase">{tour.duration}h</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/10 border border-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                        <MapPin className="w-3.5 h-3.5 text-verde-principal" />
                        <span className="text-xs font-bold text-white uppercase truncate max-w-[100px]">{tour.location}</span>
                      </div>
                    </div>

                    <button className="w-full mt-4 bg-verde-principal hover:bg-verde-secundario text-white font-bold py-3 rounded-xl transition-all shadow-lg transform hover:translate-y-px text-sm uppercase tracking-wider hidden sm:block">
                      {dict.viewDetails}
                    </button>
                  </div>

                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
};