import React from 'react';
import { Clock, MapPin, ArrowRight } from 'lucide-react';
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
  images?: { image_url: string; is_cover: boolean }[];
  is_women_exclusive?: boolean;
};

interface TourCardProps {
  tour: Tour;
  dict: { from: string; viewDetails: string; hours: string; womenExclusiveBadge: string; };
  lang: Locale;
  query?: string;
}

export const TourCard: React.FC<TourCardProps> = ({ tour, dict: t, lang, query = '' }) => {
  // Lógica de fallback robusta:
  // 1. Usa imageUrl direta (se a página pai já calculou a capa, como no ToursPage corrigido)
  // 2. Se não tiver, tenta achar a capa no array de imagens
  // 3. Se não achar, pega a primeira imagem do array
  
  let displayImage = tour.imageUrl;

  if (!displayImage && tour.images && tour.images.length > 0) {
      const cover = tour.images.find(img => img.is_cover);
      displayImage = cover ? cover.image_url : tour.images[0].image_url;
  }

  return (
    <Link
      href={`/${lang}/tour/${tour.id}${query}`}
      className="group relative bg-white rounded-3xl shadow-sm hover:shadow-card-hover transition-all duration-500 overflow-hidden h-full flex flex-col"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-3xl">
        {displayImage ? (
          <Image
            src={displayImage}
            alt={tour.title}
            fill
            className="object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <MapPin className="text-gray-400" />
          </div>
        )}
        
        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur shadow-lg px-4 py-2 rounded-xl z-10">
          <span className="text-xs text-gray-500 block font-semibold">{t.from}</span>
          <span className="text-lg font-bold text-foz-verde">R$ {tour.price.toFixed(2)}</span>
        </div>
        
        {tour.is_women_exclusive && (
            <div className="absolute top-4 left-4 bg-acento-mulher text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10 uppercase">
                {t.womenExclusiveBadge}
            </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-3 text-xs font-bold text-foz-azul-claro mb-3 uppercase tracking-wide">
           <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {tour.duration}H</span>
           <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
           <span className="truncate max-w-[150px]">{tour.location}</span>
        </div>

        <h3 className="text-xl font-bold text-foz-azul-escuro mb-3 line-clamp-2 group-hover:text-foz-azul-claro transition-colors font-serif">
          {tour.title}
        </h3>

        <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed mb-6 flex-1">
          {tour.description}
        </p>

        <div className="flex items-center text-foz-azul-escuro font-bold text-sm group/btn">
          <span className="group-hover/btn:underline">{t.viewDetails}</span>
          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
        </div>
      </div>
    </Link>
  );
};