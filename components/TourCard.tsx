// components/TourCard.tsx
import React from 'react';
import { Clock, MapPin, ArrowUpRight, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
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

interface TourCardProps {
  tour: Tour;
  dict: { from: string; viewDetails: string; hours: string; };
  lang: Locale;
  query?: string;
}

export const TourCard: React.FC<TourCardProps> = ({ tour, dict: t, lang, query = '' }) => {
  return (
    <Link
      href={`/${lang}/tour/${tour.id}${query}`}
      className="group bg-white rounded-3xl shadow-card hover:shadow-card-hover transition-all duration-500 overflow-hidden flex flex-col h-full border border-transparent hover:border-foz-azul-claro/20 relative"
    >
      {/* Imagem com efeito de zoom suave */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {tour.imageUrl ? (
          <Image
            src={tour.imageUrl}
            alt={tour.title}
            fill
            className="object-cover transform group-hover:scale-110 transition-transform duration-700"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-foz-bege">
            <MapPin className="w-16 h-16 text-foz-azul-claro/30" />
          </div>
        )}
        {/* Gradiente para legibilidade */}
        <div className="absolute inset-0 bg-gradient-to-t from-foz-azul-escuro/90 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Destaques sobre a imagem */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 text-xs font-bold text-foz-azul-escuro shadow-sm">
            <Star className="w-3 h-3 text-foz-amarelo fill-foz-amarelo" /> 4.9 {/* Placeholder de nota */}
        </div>

        <div className="absolute bottom-0 left-0 p-6 w-full text-white">
             <p className="text-sm font-medium opacity-90 mb-1">{t.from}</p>
             <div className="flex items-baseline gap-1">
               <span className="text-xs opacity-80">R$</span>
               <span className="text-3xl font-extrabold tracking-tight">{tour.price.toFixed(2)}</span>
             </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start gap-4 mb-3">
             <h3 className="text-xl font-bold text-foz-azul-escuro line-clamp-2 leading-tight group-hover:text-foz-azul-claro transition-colors duration-300">
              {tour.title}
            </h3>
            <div className="bg-foz-azul-claro/10 p-2 rounded-full group-hover:bg-foz-azul-claro group-hover:text-white text-foz-azul-claro transition-all duration-300 shrink-0">
               <ArrowUpRight className="w-5 h-5" />
            </div>
        </div>

        <p className="text-foz-cinza text-sm mb-6 line-clamp-2 leading-relaxed flex-grow">
          {tour.description}
        </p>

        <div className="flex items-center gap-4 text-sm font-medium text-foz-cinza/80 pt-4 border-t border-dashed border-gray-100">
          <div className="flex items-center gap-1.5 bg-foz-bege px-3 py-1.5 rounded-lg">
            <Clock className="w-4 h-4 text-foz-azul-claro" />
            <span>{tour.duration}h</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-4 h-4 text-foz-verde" />
            <span className="truncate">{tour.location}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};