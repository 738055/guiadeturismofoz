// app/[lang]/tours/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { TourCard } from '@/components/TourCard';
import { PageBanner } from '@/components/PageBanner';
import { supabase } from '@/lib/supabase';
import { Locale } from '@/i18n/dictionaries';
import { Search, Loader2 } from 'lucide-react';
import { Category, Tour } from '@/lib/supabase';

// Tipos auxiliares
type TourWithDetails = Tour & {
  title: string;
  description: string;
  imageUrl?: string;
};
type CategoryWithDetails = Category & {
  name: string;
  slug: string;
};
type Dictionary = any;

interface ToursPageProps {
  params: { lang: Locale };
}

export default function ToursPage({ params: { lang } }: ToursPageProps) {
  const [tours, setTours] = useState<TourWithDetails[]>([]);
  const [categories, setCategories] = useState<CategoryWithDetails[]>([]);
  const [dict, setDict] = useState<Dictionary | null>(null);
  const [loading, setLoading] = useState(true);
  const [bannerUrl, setBannerUrl] = useState('');

  // Estados de Filtro
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Carrega Dicionário
        const dictionaryModule = await import(`@/i18n/locales/${lang}.json`);
        setDict(dictionaryModule.default);

        // 2. Carrega Banner Personalizado
        const { data: bannerData } = await supabase
          .from('site_settings')
          .select('setting_value')
          .eq('setting_key', 'banner_tours')
          .single();
        if (bannerData) {
            setBannerUrl(bannerData.setting_value);
        }

        // 3. Carrega Categorias
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('id, category_translations!left(name, slug, language_code)');

        const formattedCategories = (categoriesData || [])
          .map((cat: any) => {
            const translation = cat.category_translations.find((t: any) => t.language_code === lang) ||
                                cat.category_translations.find((t: any) => t.language_code === 'pt_BR');
            if (!translation) return null;
            return {
              id: cat.id,
              name: translation.name,
              slug: translation.slug
            };
          })
          .filter(Boolean) as CategoryWithDetails[];
        setCategories(formattedCategories);

        // 4. Carrega Passeios Ativos
        const { data: toursData } = await supabase
          .from('tours')
          .select(`
            id,
            base_price,
            duration_hours,
            location,
            category_id,
            is_active,
            tour_translations!left(title, description, language_code),
            tour_images(image_url, display_order)
          `)
          .eq('is_active', true)
          .order('display_order', { referencedTable: 'tour_images', ascending: true });

        const formattedTours = (toursData || [])
          .map((tour: any) => {
             // Lógica de Fallback de Idioma
             const translation = tour.tour_translations.find((t: any) => t.language_code === lang) ||
                                 tour.tour_translations.find((t: any) => t.language_code === 'pt_BR');
             
             if (!translation) return null;

             return {
               id: tour.id,
               base_price: tour.base_price,
               duration_hours: tour.duration_hours,
               location: tour.location,
               category_id: tour.category_id,
               title: translation.title,
               description: translation.description,
               imageUrl: tour.tour_images?.[0]?.image_url
             };
          })
          .filter(Boolean) as TourWithDetails[];
        setTours(formattedTours);

      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [lang]);

  // Lógica de Filtragem (Memoizada para performance)
  const filteredTours = useMemo(() => {
    return tours.filter(tour => {
      // Filtro por Categoria
      const categoryMatch = selectedCategory === 'all' || tour.category_id === selectedCategory;
      
      // Filtro por Busca (Título ou Descrição)
      const query = searchQuery.toLowerCase();
      const searchMatch = query === '' || 
                          tour.title.toLowerCase().includes(query) || 
                          tour.description.toLowerCase().includes(query);

      return categoryMatch && searchMatch;
    });
  }, [tours, searchQuery, selectedCategory]);

  if (loading || !dict) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-verde-principal" />
      </div>
    );
  }

  // Atalhos para traduções
  const tCat = dict.categories;
  const tCommon = dict.common;
  const tTours = dict.tours;

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Banner da Página */}
      <PageBanner 
        title={tTours.title} 
        subtitle={tTours.subtitle}
        // Usa o banner do banco ou um fallback padrão do Unsplash
        image={bannerUrl || "https://images.unsplash.com/photo-1580644236847-230616ba3d9e?q=80&w=1920&auto=format=fit=crop"}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        
        {/* Barra de Filtros (Sobreposta ao Banner) */}
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg mb-12 -mt-20 relative z-20">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            
            {/* Campo de Busca */}
            <div className="relative w-full md:flex-1">
              <input
                type="text"
                placeholder={tCommon.search + '...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-100 rounded-xl focus:ring-0 focus:border-verde-principal transition-all text-gray-700 font-medium"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>

            {/* Botões de Categoria (Scroll horizontal no mobile) */}
             <div className="w-full md:w-auto flex overflow-x-auto pb-2 md:pb-0 gap-3 scrollbar-hide">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
                    selectedCategory === 'all' 
                      ? 'bg-verde-principal text-white shadow-md transform scale-105' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tCat.all}
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
                      selectedCategory === cat.id 
                        ? 'bg-verde-principal text-white shadow-md transform scale-105' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Grid de Resultados */}
        {filteredTours.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500 text-xl font-medium">{tCommon.noResults}</p>
            <button 
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="mt-4 text-verde-principal hover:underline font-semibold"
            >
                Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* --- ESTA É A CORREÇÃO --- */}
            {filteredTours.map(tour => (
              <TourCard
                key={tour.id}
                tour={{
                  id: tour.id,
                  title: tour.title,
                  description: tour.description,
                  price: tour.base_price, // Mapeia 'base_price' para 'price'
                  duration: tour.duration_hours, // Mapeia 'duration_hours' para 'duration'
                  location: tour.location,
                  imageUrl: tour.imageUrl
                }}
                dict={tTours}
                lang={lang}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}