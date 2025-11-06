'use client'; // Usa hooks (useState, useRouter)

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Hook de navegação do Next.js
import { Calendar, Search, Route } from 'lucide-react'; // Adicionado Route
import { AraucariaBackground } from './AraucariaBackground';
import { format } from 'date-fns';
import { Locale } from '@/i18n/dictionaries';
import Link from 'next/link'; // Importar Link

interface HeroProps {
  dict: { // Recebe as traduções como prop
    title: string;
    subtitle: string;
    startDate: string;
    endDate: string;
    searchRoteiroButton: string; // Atualizado
    searchAllButton: string; // Adicionado
  };
  lang: Locale;
}

export const Hero: React.FC<HeroProps> = ({ dict: t, lang }) => {
  const router = useRouter(); // Novo hook de navegação
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSearch = () => {
    if (startDate && endDate) {
      // ATUALIZADO: Navega para a nova página de roteiro
      router.push(`/${lang}/roteiro?start=${startDate}&end=${endDate}`);
    }
  };

  const today = format(new Date(), 'yyyy-MM-dd'); // Formato ISO para o <input type="date">

  return (
    <section className="relative bg-gradient-to-br from-[#f9f9f9] to-white overflow-hidden">
      <AraucariaBackground />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <h1
            className="text-4xl md:text-6xl font-bold text-verde-principal mb-6 leading-tight font-serif"
          >
            {t.title}
          </h1>

          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            {t.subtitle}
          </p>

          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl mx-auto border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2 text-left">
                  {t.startDate}
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="startDate"
                    type="date"
                    min={today}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2 text-left">
                  {t.endDate}
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="endDate"
                    type="date"
                    min={startDate || today}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent transition-all"
                    disabled={!startDate}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSearch}
              disabled={!startDate || !endDate}
              className="w-full bg-gradient-to-r from-verde-principal to-verde-secundario text-white py-4 rounded-lg font-semibold text-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            >
              {/* ATUALIZADO: Ícone e Texto */}
              <Route className="w-5 h-5" />
              <span>{t.searchRoteiroButton}</span>
            </button>
            
            {/* NOVO LINK: Ver todos os passeios */}
            <div className="text-center mt-6">
              <Link
                href={`/${lang}/tours`}
                className="text-gray-600 hover:text-verde-principal font-medium transition-colors"
              >
                {t.searchAllButton}
              </Link>
            </div>
            
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
    </section>
  );
};