// components/PopularTours.tsx
'use client';

import React, { useState } from 'react';
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
  // Estado para controlar qual card está expandido (padrão: o primeiro)
  const [activeId, setActiveId] = useState<string | null>(tours[0]?.id || null);

  if (!tours || tours.length === 0) return null;
  const displayTours = tours.slice(0, 5);

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-foz-azul-escuro font-serif mb-4">
            {dict.popular}
          </h2>
          <div className="w-24 h-1.5 bg-foz-amarelo mx-auto rounded-full"></div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[600px] w-full">
          {displayTours.map((tour) => {
            const isActive = activeId === tour.id;

            return (
              <div
                key={tour.id}
                onMouseEnter={() => setActiveId(tour.id)}
                className={`
                  relative overflow-hidden rounded-3xl cursor-pointer shadow-xl transition-all duration-700 ease-elastic
                  ${isActive ? 'lg:flex-[3.5]' : 'lg:flex-1'}
                  h-[300px] lg:h-full w-full
                `}
              >
                {/* Link que cobre tudo */}
                <Link href={`/${lang}/tour/${tour.id}`} className="absolute inset-0 z-20" />

                {/* Imagem de Fundo */}
                <div className="absolute inset-0 w-full h-full">
                  <Image
                    src={tour.imageUrl || '/54.jpg'}
                    alt={tour.title}
                    fill
                    className={`
                      object-cover transition-transform duration-1000 
                      ${isActive ? 'scale-110' : 'scale-100 grayscale-[30%]'}
                    `}
                  />
                  {/* Gradiente Overlay */}
                  <div className={`
                    absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-500
                    ${isActive ? 'opacity-80' : 'opacity-60 hover:opacity-70'}
                  `} />
                </div>

                {/* Conteúdo */}
                <div className="absolute inset-0 p-6 lg:p-8 flex flex-col justify-end z-10 pointer-events-none">
                  
                  {/* Título sempre visível, rotacionado se inativo no desktop */}
                  <div className={`transition-all duration-500 ${isActive ? 'mb-0' : 'lg:mb-8'}`}>
                    <h3 className={`
                      font-serif font-bold text-white leading-tight drop-shadow-lg transition-all duration-500
                      ${isActive ? 'text-3xl lg:text-4xl mb-2' : 'text-2xl lg:text-xl lg:rotate-[-90deg] lg:origin-bottom-left lg:whitespace-nowrap'}
                    `}>
                      {tour.title}
                    </h3>
                    
                    {/* Preço só aparece se ativo ou no mobile */}
                    <div className={`transition-all duration-500 overflow-hidden ${isActive ? 'max-h-20 opacity-100 delay-100' : 'max-h-0 opacity-0 lg:max-h-0'}`}>
                       <p className="text-foz-amarelo font-bold text-xl">
                        <span className="text-xs text-white/80 font-normal mr-2 uppercase">{dict.from}</span>
                        R$ {tour.price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Detalhes (Só visíveis quando ativo) */}
                  <div className={`
                    grid transition-[grid-template-rows] duration-500 ease-elastic
                    ${isActive ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}
                  `}>
                    <div className="overflow-hidden">
                      <p className="text-white/90 text-sm lg:text-base line-clamp-2 mt-4 mb-6 leading-relaxed max-w-xl">
                        {tour.description}
                      </p>

                      <div className="flex items-center gap-4 mb-2">
                         <div className="flex items-center gap-2 text-white/90 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm">
                            <Clock className="w-4 h-4 text-foz-amarelo" />
                            <span className="text-sm font-bold">{tour.duration}h</span>
                         </div>
                         <button className="bg-foz-verde hover:bg-green-600 text-white px-6 py-2 rounded-full font-bold text-sm transition-colors shadow-lg">
                            {dict.viewDetails}
                         </button>
                      </div>
                    </div>
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