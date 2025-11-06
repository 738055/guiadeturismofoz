import React from 'react';
import { Clock, MapPin } from 'lucide-react';
import Link from 'next/link'; // Usa o Link do Next.js
import Image from 'next/image'; // Usa o Image do Next.js
import { Locale } from '@/i18n/dictionaries';

// Tipo para o passeio
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
  dict: { // Recebe traduções
    from: string;
    viewDetails: string;
    hours: string;
  };
  lang: Locale;
  query?: string; // Query string opcional (ex: ?start=...&end=...)
}

// Este é um Server Component por padrão, o que é ótimo!
export const TourCard: React.FC<TourCardProps> = ({ tour, dict: t, lang, query = '' }) => {
  return (
    <Link
      href={`/${lang}/tour/${tour.id}${query}`}
      className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transform hover:scale-105 hover:shadow-xl transition-all duration-300 group flex flex-col"
    >
      {/* Imagem */}
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-verde-principal to-verde-secundario">
        {tour.imageUrl ? (
          <Image
            src={tour.imageUrl}
            alt={tour.title}
            fill // Ocupa o contêiner
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="w-16 h-16 text-white opacity-50" />
          </div>
        )}
        <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-lg">
          <span className="text-sm font-bold text-verde-principal">
            {t.from} R$ {tour.price.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-verde-principal transition-colors">
          {tour.title}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed flex-grow">
          {tour.description}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{tour.duration} {t.hours}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span className="truncate max-w-[120px]">{tour.location}</span>
          </div>
        </div>

        {/* Botão (agora apenas visual, já que o card inteiro é um link) */}
        <div className="w-full bg-verde-principal text-white py-2.5 rounded-lg font-semibold hover:bg-verde-secundario transition-colors text-center mt-auto">
          {t.viewDetails}
        </div>
      </div>
    </Link>
  );
};