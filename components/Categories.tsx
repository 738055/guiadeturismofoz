// components/Categories.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Locale } from '@/i18n/dictionaries';
import { ArrowRight, Droplets, TreePalm, Compass, Landmark, LucideIcon, ShoppingBag } from 'lucide-react'; // <-- Importado ShoppingBag

// NOVO TIPO DE CATEGORIA RECEBIDO POR PROP
export type DynamicCategory = {
  id: string;
  key: 'falls' | 'nature' | 'adventure' | 'shopping' | 'cultural'; // Chave para tradução e ícone
  image_url: string; // URL da imagem de destaque
};

interface CategoriesProps {
  dict: any;
  lang: Locale;
  dynamicCategories: DynamicCategory[]; // <-- NOVO: Recebe as categorias
}

// Mapeamento de Chave de Dicionário para Ícone Lucide
const categoryIconMap: Record<DynamicCategory['key'], LucideIcon> = {
    'falls': Droplets,
    'nature': TreePalm,
    'adventure': Compass,
    'cultural': Landmark,
    'shopping': ShoppingBag, // Mapeia para um ícone existente
};

export const Categories: React.FC<CategoriesProps> = ({ dict: t, lang, dynamicCategories: categories }) => {
  // ATUALIZADO: O ID ativo inicial agora usa o primeiro ID do array dinâmico
  const [activeId, setActiveId] = useState<string | null>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Define o primeiro como ativo ao carregar
  useEffect(() => {
    if (categories && categories.length > 0 && activeId === null) {
        setActiveId(categories[0].id);
    }
  }, [categories, activeId]);

  // Se não houver dados, não renderiza
  if (!t || categories.length === 0) return null;

  // Lógica para detectar o scroll no celular ("roll")
  useEffect(() => {
    const observerOptions = {
      root: null, // usa a viewport
      // Margem negativa define uma "linha de foco" no centro da tela.
      rootMargin: '-45% 0px -45% 0px', 
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      // Só aplica a lógica de scroll se for mobile (< 768px)
      if (window.innerWidth >= 768) return;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('data-id');
          if (id) {
            setActiveId(id);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observa todos os cards
    cardsRef.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, [categories]); // Dependência atualizada para 'categories'

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
        {/* Mobile: Altura ajustada para permitir rolagem confortável */}
        <div className="flex flex-col md:flex-row gap-4 h-[600px] w-full">
          {categories.map((cat, index) => {
            const isActive = activeId === cat.id;
            const title = t[cat.key]; // Busca a tradução usando a chave
            const Icon = categoryIconMap[cat.key] || Landmark; // Mapeia o ícone

            return (
              <div
                key={cat.id}
                ref={(el) => { cardsRef.current[index] = el; }} // Atribui a referência
                data-id={cat.id} // Identificador para o observer
                onMouseEnter={() => setActiveId(cat.id)} // Mantém hover para Desktop
                onClick={() => setActiveId(cat.id)} // Permite clique manual também
                className={`
                  relative overflow-hidden rounded-[2rem] cursor-pointer shadow-card transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]
                  /* Lógica de Flex: Expande o ativo, encolhe os inativos */
                  ${isActive ? 'md:flex-[3.5] flex-[3]' : 'md:flex-[1] flex-[1]'}
                `}
              >
                {/* Link para a página */}
                <Link href={`/${lang}/tours?cat=${cat.id}`} className="absolute inset-0 z-20" aria-label={`Ver passeios de ${title}`} />

                {/* Imagem de Fundo */}
                <div className="absolute inset-0 w-full h-full">
                  <Image
                    src={cat.image_url} // <-- AGORA É DINÂMICO
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
                  
                  {/* Ícone Flutuante */}
                  <div className={`
                    absolute top-6 right-6 bg-white/20 backdrop-blur-md p-3 rounded-full text-white border border-white/30 transition-all duration-500
                    ${isActive ? 'scale-100 opacity-100 rotate-0' : 'scale-75 opacity-80'}
                  `}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="relative overflow-hidden">
                    
                    {/* Título Vertical (Apenas Desktop Inativo) */}
                    <h3 className={`
                      hidden md:block absolute bottom-0 left-0 origin-bottom-left -rotate-90 whitespace-nowrap text-2xl font-bold text-white/80 font-serif tracking-wider transition-opacity duration-300
                      ${isActive ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'}
                    `}>
                      {title}
                    </h3>

                    {/* Conteúdo Expandido (Ativo) */}
                    <div className={`
                      transition-all duration-500 transform
                      ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 md:opacity-0 md:translate-y-12'}
                    `}>
                      <h3 className="text-3xl md:text-4xl font-bold text-white font-serif mb-3 leading-tight drop-shadow-lg">
                        {title}
                      </h3>
                      
                      <div className="w-16 h-1 bg-foz-amarelo rounded-full mb-4" />

                      <div className="inline-flex items-center gap-2 text-white font-bold text-sm uppercase tracking-widest group">
                        <span>Explorar</span>
                        <div className="bg-foz-verde p-1.5 rounded-full group-hover:bg-green-500 transition-colors">
                           <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Título Simples (Mobile Inativo) */}
                    {/* Garante que o usuário saiba o que é o card antes de ele expandir completamente no scroll */}
                    <h3 className={`
                      md:hidden text-xl font-bold text-white font-serif transition-opacity duration-300 absolute bottom-0 left-0
                      ${isActive ? 'opacity-0 pointer-events-none' : 'opacity-100 delay-200'}
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