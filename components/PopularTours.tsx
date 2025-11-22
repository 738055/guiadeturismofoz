// components/PopularTours.tsx
'use client';

import React from 'react';
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
  if (!tours || tours.length === 0) return null;

  // Limitamos a 5 destaques para o efeito funcionar perfeitamente na tela
  const displayTours = tours.slice(0, 5);

  return (
    <section className="py-24 bg-foz-bege overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabeçalho da Seção */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-foz-azul-escuro font-serif mb-4">
            {dict.popular}
          </h2>
          <div className="w-24 h-1.5 bg-verde-principal mx-auto rounded-full opacity-80"></div>
        </div>

        {/* --- CONTAINER FLEX EXPANSIVO (ACCORDION) --- */}
        {/* Mobile: Flex Column (empilhado) com altura fixa.
            Desktop: Flex Row com altura fixa (600px). 
        */}
        <div className="flex flex-col md:flex-row gap-3 h-auto md:h-[600px] w-full">
          
          {displayTours.map((tour) => (
            <Link
              key={tour.id}
              href={`/${lang}/tour/${tour.id}`}
              className="
                group relative overflow-hidden rounded-3xl cursor-pointer shadow-xl
                
                /* Mobile: Altura fixa, largura total */
                w-full h-[280px] md:w-auto md:h-full
                
                /* Desktop: Flex-1 (tamanho igual) por padrão */
                md:flex-1 
                
                /* TRANSIÇÃO MÁGICA: Ao passar o mouse, o flex cresce */
                transition-[flex] duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]
                
                /* Hover State (Desktop): Cresce para ocupar mais espaço */
                md:hover:flex-[3.5]
              "
            >
              {/* 1. Imagem de Fundo */}
              <div className="absolute inset-0 w-full h-full">
                <Image
                  src={tour.imageUrl || '/54.jpg'}
                  alt={tour.title}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 30vw, 20vw"
                />
                {/* Overlay Gradiente (Escuro embaixo para texto) */}
                <div className="absolute inset-0 bg-gradient-to-t from-foz-azul-escuro/90 via-transparent to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-90" />
              </div>

              {/* 2. Conteúdo do Card */}
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                
                {/* Título e Preço (Sempre visíveis, mas se movem no hover) */}
                <div className="transform transition-transform duration-500 md:translate-y-8 md:group-hover:translate-y-0">
                  <div className="flex justify-between items-end mb-2">
                    <h3 className="text-2xl md:text-3xl font-bold text-white font-serif leading-none drop-shadow-lg max-w-[80%]">
                      {tour.title}
                    </h3>
                    
                    {/* Ícone de Seta (Aparece no Hover) */}
                    <div className="bg-white/20 backdrop-blur-md p-3 rounded-full opacity-0 md:group-hover:opacity-100 transition-all duration-500 -rotate-45 md:group-hover:rotate-0">
                      <ArrowUpRight className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <p className="text-foz-amarelo font-bold text-xl">
                    <span className="text-xs text-white/80 font-normal mr-2 uppercase tracking-wide">{dict.from}</span>
                    R$ {tour.price.toFixed(2)}
                  </p>
                </div>

                {/* Detalhes Ocultos (Aparecem ao expandir) */}
                <div className="
                  opacity-100 md:opacity-0 
                  md:max-h-0 
                  md:group-hover:opacity-100 md:group-hover:max-h-[200px]
                  transition-all duration-700 delay-100 ease-in-out overflow-hidden
                ">
                  <p className="text-white/80 text-sm line-clamp-2 mt-4 mb-4 leading-relaxed hidden md:block">
                    {tour.description}
                  </p>

                  <div className="flex flex-wrap gap-3 mb-6 mt-4 md:mt-0">
                    <div className="flex items-center gap-1.5 bg-white/10 border border-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                      <Clock className="w-3.5 h-3.5 text-foz-amarelo" />
                      <span className="text-xs font-bold text-white uppercase tracking-wide">{tour.duration}h</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/10 border border-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                      <MapPin className="w-3.5 h-3.5 text-verde-principal" />
                      <span className="text-xs font-bold text-white uppercase tracking-wide truncate max-w-[100px]">{tour.location}</span>
                    </div>
                  </div>

                  <button className="w-full bg-verde-principal hover:bg-verde-secundario text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-verde-principal/20 transform hover:translate-y-px">
                    {dict.viewDetails}
                  </button>
                </div>

              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};