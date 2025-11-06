// components/Categories.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Locale } from '@/i18n/dictionaries';
import { ArrowRight } from 'lucide-react';

interface CategoriesProps {
  dict: any;
  lang: Locale;
}

export const Categories: React.FC<CategoriesProps> = ({ dict: t, lang }) => {
  if (!t) return null;

  const categories = [
    {
      id: 'cataratas',
      title: t.falls,
      image: 'https://images.unsplash.com/photo-1461958508236-9a742665a0d5?q=80&w=1000&auto=format&fit=crop', // Cataratas
      colSpan: 'md:col-span-2', // Destaque maior
    },
    {
      id: 'natureza',
      title: t.nature,
      image: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?q=80&w=1000&auto=format&fit=crop', // Parque das Aves (Arara)
      colSpan: 'md:col-span-1',
    },
    {
      id: 'aventura',
      title: t.adventure,
      image: 'https://images.unsplash.com/photo-1625123627242-97ef009796d1?q=80&w=1000&auto=format&fit=crop', // Macuco Safari (barco)
      colSpan: 'md:col-span-1',
    },
    {
      id: 'itaipu',
      title: t.cultural,
      image: 'https://images.unsplash.com/photo-1574102225629-6e588f03660c?q=80&w=1000&auto=format&fit=crop', // Itaipu
      colSpan: 'md:col-span-2',
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-verde-principal mb-4 font-serif">
            {t.title}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/${lang}/tours?cat=${cat.id}`}
              className={`relative h-64 md:h-80 rounded-3xl overflow-hidden group ${cat.colSpan} shadow-md hover:shadow-xl transition-all duration-500`}
            >
              <Image
                src={cat.image}
                alt={cat.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Gradiente Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              
              {/* Texto */}
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-between group-hover:text-acento-dourado transition-colors">
                  {cat.title}
                  <ArrowRight className="w-6 h-6 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" />
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};