'use client'; // Esta página agora é interativa (filtros)

import React, { useState, useEffect, useMemo } from 'react';
import { TourCard } from '@/components/TourCard';
import { supabase } from '@/lib/supabase';
import { Locale } from '@/i18n/dictionaries';
import { Search, Loader2 } from 'lucide-react';
import { Category, CategoryTranslation, Tour } from '@/lib/supabase'; // Importa tipos

// Tipos combinados para o estado
type TourWithDetails = Tour & {
  title: string;
  description: string;
  imageUrl?: string;
};
type CategoryWithDetails = Category & {
  name: string;
  slug: string;
};
type Dictionary = any; // Tipo para o dicionário (simplificado)

// Props da Página
interface ToursPageProps {
  params: { lang: Locale };
}

export default function ToursPage({ params: { lang } }: ToursPageProps) {
  const [tours, setTours] = useState<TourWithDetails[]>([]);
  const [categories, setCategories] = useState<CategoryWithDetails[]>([]);
  const [dict, setDict] = useState<Dictionary | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados dos Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Carrega dados (passeios, categorias e traduções)
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Carrega o dicionário de traduções (pode ser otimizado)
        const dictionaryModule = await import(`@/i18n/locales/${lang}.json`);
        const dictionary = dictionaryModule.default;
        setDict(dictionary);

        // 1. Carrega Categorias (CORRIGIDO com fallback)
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select(`
            id,
            category_translations!left(
              name,
              slug,
              language_code
            )
          `);
          // REMOVIDO: .eq('category_translations.language_code', lang);

        if (categoriesError) throw categoriesError;
        
        const formattedCategories = (categoriesData || [])
          .map((cat: any) => {
            const currentTranslation = cat.category_translations.find((t: any) => t.language_code === lang);
            const fallbackTranslation = cat.category_translations.find((t: any) => t.language_code === 'pt_BR');
            const translation = currentTranslation || fallbackTranslation;
            
            if (!translation) return null;

            return {
              id: cat.id,
              name: translation.name,
              slug: translation.slug
            };
          })
          .filter(Boolean) as CategoryWithDetails[];
        setCategories(formattedCategories);

        // 2. Carrega Passeios (CORRIGIDO com fallback)
        const { data: toursData, error: toursError } = await supabase
          .from('tours')
          .select(`
            id,
            base_price,
            duration_hours,
            location,
            category_id,
            tour_translations!left(
              title,
              description,
              language_code
            ),
            tour_images (
              image_url,
              display_order
            )
          `)
          .eq('is_active', true)
          // REMOVIDO: .eq('tour_translations.language_code', lang)
          .order('display_order', { referencedTable: 'tour_images', ascending: true });

        if (toursError) throw toursError;

        // --- LÓGICA DE FALLBACK ADICIONADA ---
        const formattedTours = (toursData || [])
          .map((tour: any) => {
            const currentTranslation = tour.tour_translations.find((t: any) => t.language_code === lang);
            const fallbackTranslation = tour.tour_translations.find((t: any) => t.language_code === 'pt_BR');
            const translation = currentTranslation || fallbackTranslation;

            if (!translation) return null;

            return {
              id: tour.id,
              base_price: tour.base_price,
              duration_hours: tour.duration_hours,
              location: tour.location,
              category_id: tour.category_id,
              title: translation.title || '',
              description: translation.description || '',
              imageUrl: tour.tour_images.find((img: any) => img.display_order === 1 || img.display_order === 0)?.image_url || tour.tour_images[0]?.image_url
            };
          })
          .filter(Boolean) as TourWithDetails[];
        setTours(formattedTours);

      } catch (error) {
        console.error('Error loading tours or categories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [lang]);

  // Lógica de Filtro
  const filteredTours = useMemo(() => {
    return tours.filter(tour => {
      // 1. Filtro de Categoria
      const categoryMatch = selectedCategory === 'all' || tour.category_id === selectedCategory;

      // 2. Filtro de Busca (Título ou Descrição)
      const query = searchQuery.toLowerCase();
      const searchMatch = query === '' ||
        tour.title.toLowerCase().includes(query) ||
        tour.description.toLowerCase().includes(query);

      return categoryMatch && searchMatch;
    });
  }, [tours, searchQuery, selectedCategory]);


  if (loading || !dict) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-verde-principal" />
      </div>
    );
  }

  // Textos do dicionário
  const tNav = dict.nav;
  const tCat = dict.categories;
  const tCommon = dict.common;
  const tTours = dict.tours;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[60vh]">
      {/* Header da Página */}
      <div className="mb-8">
        <h1
          className="text-3xl md:text-4xl font-bold text-verde-principal mb-2"
          style={{ fontFamily: 'var(--font-merriweather)' }}
        >
          {tNav.tours}
        </h1>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Barra de Busca */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={tCommon.search + '...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
      </div>
        
      {/* Filtros de Categoria */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-verde-principal text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {tCat.all}
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${
              selectedCategory === cat.id
                ? 'bg-verde-principal text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>


      {/* Grid de Passeios */}
      {filteredTours.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">{tCommon.noResults}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTours.map(tour => (
            <TourCard
              key={tour.id}
              tour={{
                id: tour.id,
                title: tour.title,
                description: tour.description,
                price: tour.base_price,
                duration: tour.duration_hours,
                location: tour.location,
                imageUrl: tour.imageUrl
              }}
              dict={tTours}
              lang={lang}
              query="" // Sem query de data, pois esta é a página de "todos"
            />
          ))}
        </div>
      )}
    </div>
  );
}