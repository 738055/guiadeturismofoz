// components/Hero.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Locale } from '@/i18n/dictionaries';
import Image from 'next/image';

interface HeroProps {
  dict: any;
  lang: Locale;
}

export const Hero: React.FC<HeroProps> = ({ dict: t, lang }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  // Banner temporário vibrante. Depois virá do admin.
  const bannerImage = '/54.jpg'; 

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/${lang}/tours?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <section className="relative h-[550px] lg:h-[700px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src={bannerImage}
          alt="Foz do Iguaçu"
          fill
          className="object-cover scale-105 animate-pulse-slow-fade" // Leve movimento na imagem
          priority
        />
        {/* Gradiente mais rico usando as cores da marca */}
        <div className="absolute inset-0 bg-gradient-to-r from-foz-azul-escuro/80 via-foz-azul-escuro/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-foz-azul-escuro/90 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-5xl px-4 flex flex-col items-start lg:items-center lg:text-center">
        <span className="inline-block py-1.5 px-4 rounded-full bg-foz-amarelo/90 text-foz-azul-escuro text-sm font-extrabold uppercase tracking-widest mb-6 backdrop-blur-md shadow-lg animate-float">
           ✨ Bem-vindo ao Paraíso
        </span>
        <h1 className="text-5xl lg:text-7xl font-extrabold text-white mb-8 font-serif leading-tight drop-shadow-2xl max-w-4xl">
          {t.title}
        </h1>
        <p className="text-xl text-white/90 mb-12 max-w-2xl font-medium leading-relaxed drop-shadow-md hidden md:block">
          {t.subtitle}
        </p>

        {/* Barra de Busca Poderosa */}
        <form onSubmit={handleSearch} className="w-full max-w-3xl bg-white p-2.5 rounded-full shadow-2xl flex items-center transform hover:scale-[1.01] transition-all duration-300 border-4 border-white/10 backdrop-blur-sm">
           <div className="flex-1 flex items-center px-6">
             <Search className="text-foz-azul-claro w-6 h-6 flex-shrink-0 mr-4" />
             <input 
               type="text"
               placeholder={t.searchPlaceholder || "Qual será sua próxima aventura?"}
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full py-4 bg-transparent focus:outline-none text-foz-azul-escuro placeholder-foz-cinza/50 text-lg font-medium"
             />
           </div>
           <button 
             type="submit"
             className="bg-gradient-to-r from-foz-verde to-[#00b344] hover:from-foz-azul-escuro hover:to-foz-azul-claro text-white px-10 py-4 rounded-full font-bold text-lg flex items-center gap-3 transition-all duration-500 shadow-lg hover:shadow-xl"
           >
             <span className="hidden md:inline">{t.searchButton}</span>
             <Search className="w-6 h-6 md:hidden" />
           </button>
        </form>
      </div>
    </section>
  );
};