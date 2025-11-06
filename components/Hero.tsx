// components/Hero.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Calendar } from 'lucide-react';
import { Locale } from '@/i18n/dictionaries';
import Image from 'next/image';

interface HeroProps {
  dict: any;
  lang: Locale;
}

export const Hero: React.FC<HeroProps> = ({ dict: t, lang }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  // Futuramente, este URL virá do Supabase (Admin)
  const bannerImage = 'https://images.unsplash.com/photo-1580644236847-230616ba3d9e?q=80&w=1920&auto=format&fit=crop'; 

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/${lang}/tours?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <section className="relative h-[500px] md:h-[600px] flex items-center justify-center">
      {/* Imagem de Fundo (Banner) */}
      <div className="absolute inset-0 z-0">
        <Image
          src={bannerImage}
          alt="Cataratas do Iguaçu"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay gradiente para melhorar leitura do texto */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30" />
      </div>

      {/* Conteúdo Central */}
      <div className="relative z-10 w-full max-w-4xl px-4 text-center">
        <span className="inline-block py-1 px-3 rounded-full bg-azul-foz/80 text-white text-sm font-bold mb-4 uppercase tracking-wider backdrop-blur-md">
           Descubra Foz do Iguaçu
        </span>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-serif leading-tight drop-shadow-lg">
          {t.title}
        </h1>
        <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto drop-shadow-md">
          {t.subtitle}
        </p>

        {/* Barra de Busca Estilo "Routes" */}
        <form onSubmit={handleSearch} className="bg-white p-2 rounded-full shadow-2xl flex items-center max-w-2xl mx-auto transform hover:scale-[1.02] transition-all">
           <div className="flex-1 flex items-center px-4 border-r border-gray-200">
             <Search className="text-gray-400 w-5 h-5 flex-shrink-0 mr-3" />
             <input 
               type="text"
               placeholder={t.searchPlaceholder || "Pesquise por passeios, ingressos..."}
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full py-3 bg-transparent focus:outline-none text-gray-700 placeholder-gray-400 font-medium"
             />
           </div>
           {/* Opcional: Adicionar DatePicker aqui no futuro se quiser igual à referência completa */}
           <button 
             type="submit"
             className="bg-verde-principal hover:bg-verde-secundario text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-colors"
           >
             <span className="hidden md:inline">{t.searchButton}</span>
             <Search className="w-5 h-5 md:hidden" />
           </button>
        </form>

        {/* Tags Rápidas abaixo da busca */}
        <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm text-white/80">
           <span>Populares:</span>
           <button type="button" onClick={() => router.push(`/${lang}/tours?cat=cataratas`)} className="hover:text-white hover:underline">Cataratas</button> •
           <button type="button" onClick={() => router.push(`/${lang}/tours?cat=itaipu`)} className="hover:text-white hover:underline">Itaipu</button> •
           <button type="button" onClick={() => router.push(`/${lang}/tours?cat=parque-das-aves`)} className="hover:text-white hover:underline">Parque das Aves</button>
        </div>
      </div>
    </section>
  );
};