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

  // Limitamos a 5 itens para o efeito funcionar bem na tela
  const displayTours = tours.slice(0, 5);

  return (
    <section className="py-20 bg-gray-900 text-white overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4">
        
        {/* Título da Seção */}
        <div className="mb-12 text-center md:text-left">
          <h2 className="text-3xl md:text-5xl font-bold font-serif mb-2 text-white">
            {dict.popular}
          </h2>
          <p className="text-gray-400 text-lg">Veja as espécies de experiências de perto</p>
        </div>

        {/* --- CONTAINER ELÁSTICO (ACCORDION) --- */}
        <div className="flex flex-col md:flex-row h-[120vh] md:h-[600px] gap-2 w-full">
          
          {displayTours.map((tour) => (
            <Link
              key={tour.id}
              href={`/${lang}/tour/${tour.id}`}
              className="
                relative overflow-hidden rounded-3xl cursor-pointer
                
                /* Comportamento Mobile: Empilhado, altura fixa */
                w-full h-[200px]
                
                /* Comportamento Desktop: Flexível */
                md:h-full md:w-auto
                flex-1 transition-[flex] duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]
                
                /* O Pulo do Gato: Expande no Hover */
                hover:flex-[4] group
              "
            >
              {/* Imagem de Fundo (Zoom suave no hover) */}
              <Image
                src={tour.imageUrl || '/54.jpg'}
                alt={tour.title}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 20vw"
              />
              
              {/* Overlay Gradiente: Mais escuro no estado normal, clareia no hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />

              {/* --- CONTEÚDO DO CARD --- */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                
                {/* Título e Preço (Sempre visíveis, mas animados) */}
                <div className="transform transition-all duration-500 md:translate-y-4 md:group-hover:translate-y-0">
                  <div className="flex justify-between items-end">
                    <h3 className="text-2xl md:text-3xl font-bold font-serif leading-none text-white drop-shadow-lg mb-2">
                      {tour.title}
                    </h3>
                    {/* Seta que gira no hover */}
                    <div className="bg-white/20 backdrop-blur-md p-3 rounded-full opacity-0 md:group-hover:opacity-100 transition-all duration-500 -rotate-45 group-hover:rotate-0">
                      <ArrowUpRight className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  <p className="text-foz-amarelo font-bold text-xl md:text-2xl">
                    <span className="text-sm text-white/70 font-normal mr-2">{dict.from}</span>
                    R$ {tour.price.toFixed(2)}
                  </p>
                </div>

                {/* Informações Extras (Escondidas, aparecem no hover) */}
                <div className="
                  max-h-0 opacity-0 
                  md:group-hover:max-h-60 md:group-hover:opacity-100 
                  transition-all duration-700 delay-100 ease-in-out overflow-hidden
                ">
                  <p className="text-gray-300 text-sm line-clamp-3 mt-4 mb-4 leading-relaxed">
                    {tour.description}
                  </p>

                  <div className="flex gap-3 mb-6">
                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">
                      <Clock className="w-4 h-4 text-foz-amarelo" />
                      <span className="text-xs font-bold uppercase tracking-wider">{tour.duration}h</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">
                      <MapPin className="w-4 h-4 text-verde-principal" />
                      <span className="text-xs font-bold uppercase tracking-wider truncate max-w-[100px]">{tour.location}</span>
                    </div>
                  </div>

                  <button className="w-full bg-verde-principal hover:bg-verde-secundario text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-verde-principal/20">
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