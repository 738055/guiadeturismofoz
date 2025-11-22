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
  if (!tours || tours.length === 0) {
    return null;
  }

  // Pegamos apenas os primeiros 4 ou 5 tours para o efeito ficar bonito na tela
  const featuredTours = tours.slice(0, 5);

  return (
    <section className="py-20 bg-foz-bege overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-foz-azul-escuro font-serif mb-4">
            {dict.popular}
          </h2>
          <div className="w-24 h-1.5 bg-verde-principal mx-auto rounded-full"></div>
        </div>

        {/* --- CONTAINER DO EFEITO EXPANSIVO --- */}
        {/* Altura fixa definida para desktop para garantir o alinhamento */}
        <div className="flex flex-col md:flex-row gap-4 h-auto md:h-[600px] w-full">
          
          {featuredTours.map((tour) => (
            <Link
              key={tour.id}
              href={`/${lang}/tour/${tour.id}`}
              className="
                group relative 
                /* Mobile: Altura fixa, largura total, empilhado ou scroll (aqui deixei empilhado flex-col no pai) */
                h-[300px] w-full md:w-auto md:h-full
                
                /* Desktop: Flex-1 (tamanho igual), Hover: Flex-grow (expande) */
                md:flex-1 md:hover:flex-[3] 
                
                rounded-3xl overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]
                cursor-pointer shadow-xl hover:shadow-2xl
              "
            >
              {/* Imagem de Fundo */}
              <div className="absolute inset-0 w-full h-full">
                <Image
                  src={tour.imageUrl || '/54.jpg'}
                  alt={tour.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {/* Overlay Escuro Gradiente */}
                <div className="absolute inset-0 bg-gradient-to-t from-foz-azul-escuro/90 via-foz-azul-escuro/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
              </div>

              {/* Conteúdo do Card */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                
                {/* Título e Preço - Sempre visíveis, mudam de posição/tamanho */}
                <div className="transform md:group-hover:-translate-y-4 transition-transform duration-500">
                  <div className="flex justify-between items-end mb-2">
                    <h3 className="text-2xl md:text-3xl font-bold font-serif leading-tight max-w-[80%] drop-shadow-md">
                      {tour.title}
                    </h3>
                    <div className="bg-white/20 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity duration-500">
                      <ArrowUpRight className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  <p className="text-sm font-medium opacity-90 uppercase tracking-wider mb-1">{dict.from}</p>
                  <p className="text-3xl font-bold text-foz-amarelo">
                    R$ {tour.price.toFixed(2)}
                  </p>
                </div>

                {/* Detalhes ocultos que aparecem no Hover (Desktop) ou sempre visiveis (Mobile dependendo do design) */}
                <div className="
                  max-h-0 opacity-0 
                  md:group-hover:max-h-40 md:group-hover:opacity-100 
                  transition-all duration-700 ease-in-out overflow-hidden
                ">
                  <p className="text-white/90 text-sm line-clamp-2 mb-4 mt-2 leading-relaxed">
                    {tour.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm font-medium text-white/80">
                    <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1 rounded-lg backdrop-blur-sm">
                      <Clock className="w-4 h-4 text-foz-amarelo" />
                      <span>{tour.duration}h</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1 rounded-lg backdrop-blur-sm">
                      <MapPin className="w-4 h-4 text-verde-principal" />
                      <span className="truncate max-w-[100px]">{tour.location}</span>
                    </div>
                  </div>
                  
                  <button className="mt-6 w-full bg-verde-principal hover:bg-verde-secundario text-white font-bold py-3 rounded-xl transition-colors shadow-lg">
                    {dict.viewDetails}
                  </button>
                </div>

              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-8 text-center md:hidden">
           <p className="text-sm text-gray-500 italic">Toque nos cards para ver detalhes</p>
        </div>

      </div>
    </section>
  );
};