// components/Categories.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Locale } from '@/i18n/dictionaries';
import { ArrowRight, Droplets, TreePalm, Compass, Landmark, LucideIcon } from 'lucide-react';

interface CategoriesProps {
  dict: any;
  lang: Locale;
}

// Definição dos dados das categorias com ícones e imagens
type CategoryItem = {
  id: string;
  key: string; // Chave para buscar a tradução no dicionário
  image: string;
  icon: LucideIcon;
};

export const Categories: React.FC<CategoriesProps> = ({ dict: t, lang }) => {
  // Estado para controlar qual card está expandido. 
  // 'cataratas' começa expandido por padrão para não ficar tudo fechado.
  const [activeId, setActiveId] = useState<string>('cataratas');

  if (!t) return null;

  const categories: CategoryItem[] = [
    {
      id: 'cataratas',
      key: 'falls', // t.falls
      image: 'https://images.unsplash.com/photo-1461958508236-9a742665a0d5?q=80&w=1000&auto=format&fit=crop',
      icon: Droplets,
    },
    {
      id: 'natureza',
      key: 'nature', // t.nature
      image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=1000&auto=format&fit=crop', // Imagem de Arara/Natureza
      icon: TreePalm,
    },
    {
      id: 'aventura',
      key: 'adventure', // t.adventure
      image: 'https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?q=80&w=1000&auto=format&fit=crop', // Rafting/Aventura
      icon: Compass,
    },
    {
      id: 'itaipu',
      key: 'cultural', // t.cultural
      image: 'https://images.unsplash.com/photo-1574102225629-6e588f03660c?q=80&w=1000&auto=format&fit=crop',
      icon: Landmark,
    }
  ];

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabeçalho */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-foz-azul-escuro mb-4 font-serif">
            {t.title}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto font-light">
            {t.subtitle}
          </p>
        </div>

        {/* --- ACCORDION CONTAINER --- */}
        <div className="flex flex-col md:flex-row gap-4 h-[600px] w-full">
          {categories.map((cat) => {
            const isActive = activeId === cat.id;
            const title = t[cat.key]; // Pega o título traduzido (ex: t.falls)

            return (
              <div
                key={cat.id}
                onMouseEnter={() => setActiveId(cat.id)}
                onClick={() => setActiveId(cat.id)} // Para funcionar bem no mobile
                className={`
                  relative overflow-hidden rounded-[2rem] cursor-pointer shadow-card transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]
                  ${isActive ? 'md:flex-[3.5] flex-[3]' : 'md:flex-[1] flex-[1]'}
                  /* Altura no mobile é distribuída pelo flex vertical */
                `}
              >
                {/* Link para a página de busca filtrada */}
                <Link href={`/${lang}/tours?cat=${cat.id}`} className="absolute inset-0 z-20" aria-label={`Ver passeios de ${title}`} />

                {/* Imagem de Fundo */}
                <div className="absolute inset-0 w-full h-full">
                  <Image
                    src={cat.image}
                    alt={title}
                    fill
                    className={`
                      object-cover transition-transform duration-1000 ease-out
                      ${isActive ? 'scale-110 grayscale-0' : 'scale-100 grayscale-[30%]'}
                    `}
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  {/* Overlay Gradiente */}
                  <div className={`
                    absolute inset-0 bg-gradient-to-t from-foz-azul-escuro/90 via-black/20 to-transparent transition-opacity duration-500
                    ${isActive ? 'opacity-80' : 'opacity-70'}
                  `} />
                </div>

                {/* Conteúdo do Card */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end z-10 pointer-events-none">
                  
                  {/* Ícone Flutuante (Sempre visível) */}
                  <div className={`
                    absolute top-6 right-6 bg-white/20 backdrop-blur-md p-3 rounded-full text-white border border-white/30 transition-all duration-500
                    ${isActive ? 'scale-100 opacity-100 rotate-0' : 'scale-75 opacity-80'}
                  `}>
                    <cat.icon className="w-6 h-6" />
                  </div>

                  {/* Texto e Título */}
                  <div className="relative overflow-hidden">
                    
                    {/* Título Vertical (Visível apenas quando INATIVO e no DESKTOP) */}
                    <h3 className={`
                      hidden md:block absolute bottom-0 left-0 origin-bottom-left -rotate-90 whitespace-nowrap text-2xl font-bold text-white/80 font-serif tracking-wider transition-opacity duration-300
                      ${isActive ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'}
                    `}>
                      {title}
                    </h3>

                    {/* Conteúdo Expandido (Visível quando ATIVO) */}
                    <div className={`
                      transition-all duration-500 transform
                      ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 md:opacity-0 md:translate-y-12'}
                    `}>
                      {/* Título Principal */}
                      <h3 className="text-3xl md:text-4xl font-bold text-white font-serif mb-3 leading-tight drop-shadow-lg">
                        {title}
                      </h3>
                      
                      {/* Linha decorativa */}
                      <div className="w-16 h-1 bg-foz-amarelo rounded-full mb-4" />

                      {/* Botão "Explorar" Simulado */}
                      <div className="inline-flex items-center gap-2 text-white font-bold text-sm uppercase tracking-widest group">
                        <span>Explorar</span>
                        <div className="bg-foz-verde p-1.5 rounded-full group-hover:bg-green-500 transition-colors">
                           <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Título Simples (Mobile Inativo - para garantir que sempre tenha texto no mobile) */}
                    <h3 className={`
                      md:hidden text-xl font-bold text-white font-serif transition-opacity duration-300
                      ${isActive ? 'hidden' : 'block'}
                    `}>
                      {title}
                    </h3>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};