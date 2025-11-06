'use client'; // Usa o hook <Link> e é interativo, embora os dados venham do servidor

import React from 'react';
import { TourCard } from './TourCard';
import { Loader2 } from 'lucide-react';
import { Locale } from '@/i18n/dictionaries';

// Tipo para os passeios pré-buscados
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
  tours: Tour[]; // Recebe os passeios como prop
  dict: { // Recebe as traduções como prop
    popular: string;
    from: string;
    viewDetails: string;
    hours: string;
  };
  lang: Locale;
}

export const PopularTours: React.FC<PopularToursProps> = ({ tours, dict, lang }) => {
  // Não há mais estado de loading ou useEffect, os dados vêm prontos!

  if (!tours || tours.length === 0) {
    return null; // Não renderiza nada se não houver passeios
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          className="text-3xl md:text-4xl font-bold text-center text-verde-principal mb-12 font-serif"
        >
          {dict.popular}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map(tour => (
            <TourCard
              key={tour.id}
              tour={tour}
              dict={dict} // Passa o dicionário para o TourCard
              lang={lang}
            />
          ))}
        </div>
      </div>
    </section>
  );
};