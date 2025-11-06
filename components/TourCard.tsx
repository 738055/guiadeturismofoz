// components/TourCard.tsx
import React from 'react';
import { Clock, MapPin, ArrowUpRight } from 'lucide-react';
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
  dict: {
    from: string;
    viewDetails: string;
    hours: string;
  };
  lang: Locale;
  query?: string;
}

export const TourCard: React.FC<TourCardProps> = ({ tour, dict: t, lang, query = '' }) => {
  return (
    <Link
      href={`/${lang}/tour/${tour.id}${query}`}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col border border-gray-100"
    >
      {/* Container da Imagem com Aspect Ratio Fixo (4/3 ou 16/9) */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {tour.imageUrl ? (
          <Image
            src={tour.imageUrl}
            alt={tour.title}
            fill
            className="object-cover transform group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-verde-principal/10 to-verde-secundario/10">
            <MapPin className="w-12 h-12 text-verde-principal/40" />
          </div>
        )}
        {/* Preço (Badge) */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12 flex items-end justify-between">
             <span className="text-white font-medium text-sm opacity-90">{t.from}</span>
             <span className="text-white font-bold text-xl">R$ {tour.price.toFixed(2)}</span>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
             <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-verde-principal transition-colors flex-1">
              {tour.title}
            </h3>
            <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-verde-principal transition-colors flex-shrink-0 ml-2" />
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow leading-relaxed">
          {tour.description}
        </p>

        {/* Rodapé do Card */}
        <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-1.5 bg-gray-50 px-2 py-1 rounded-md">
            <Clock className="w-4 h-4 text-verde-secundario" />
            <span className="font-medium">{tour.duration}h</span>
          </div>
          <div className="flex items-center space-x-1.5 max-w-[50%]">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="truncate">{tour.location}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};