'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { TourCard } from '@/components/TourCard';
import { supabase } from '@/lib/supabase';
import { Locale } from '@/i18n/dictionaries';
import { Search, Loader2, Filter, X } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';

// Tipos
type Tour = {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  location: string;
  imageUrl?: string;
  category_id: string;
  is_women_exclusive?: boolean; 
};

type Category = {
  id: string;
  name: string;
};

export default function ToursPage({ params: { lang } }: { params: { lang: Locale } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const isWomenExclusiveMode = searchParams?.get('exclusive') === 'women';
  
  const [tours, setTours] = useState<Tour[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dict, setDict] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toursBanner, setToursBanner] = useState('');
  const [womenExclusiveBanner, setWomenExclusiveBanner] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const dictionaryModule = await import(`@/i18n/locales/${lang}.json`);
        setDict(dictionaryModule.default);

        const { data: settingsData } = await supabase
            .from('site_settings')
            .select('setting_key, setting_value')
            .in('setting_key', ['banner_tours', 'banner_women_exclusive']);
        
        if (settingsData) {
            settingsData.forEach(item => {
                if (item.setting_key === 'banner_tours') setToursBanner(item.setting_value);
                if (item.setting_key === 'banner_women_exclusive') setWomenExclusiveBanner(item.setting_value);
            });
        }

        const { data: catData } = await supabase
          .from('categories')
          .select('id, category_translations!left(name, language_code)');
        
        const formattedCats = (catData || []).map((c: any) => {
           const trans = c.category_translations.find((t: any) => t.language_code === lang) || 
                         c.category_translations.find((t: any) => t.language_code === 'pt_BR');
           return { id: c.id, name: trans?.name || 'Categoria' };
        });
        setCategories(formattedCats);

        // --- CORREÇÃO: Selecionando 'is_cover' na query ---
        let query = supabase
          .from('tours')
          .select(`
            id, base_price, duration_hours, location, category_id, is_women_exclusive, 
            tour_translations!left(title, description, language_code),
            tour_images(image_url, display_order, is_cover) 
          `)
          .eq('is_active', true)
          .order('display_order', { referencedTable: 'tour_images', ascending: true });
          
        if (isWomenExclusiveMode) {
            query = query.eq('is_women_exclusive', true);
        }

        const { data: toursData } = await query;
          
        const formattedTours = (toursData || []).map((t: any) => {
           const trans = t.tour_translations.find((tr: any) => tr.language_code === lang) || 
                         t.tour_translations.find((tr: any) => tr.language_code === 'pt_BR');
           if (!trans) return null;

           // --- CORREÇÃO: Lógica para pegar a imagem de capa ---
           const images = t.tour_images || [];
           // Tenta achar is_cover=true, senão pega a primeira da lista (que já vem ordenada por display_order)
           const coverImage = images.find((img: any) => img.is_cover) || images[0];
           const finalImageUrl = coverImage?.image_url;

           return {
             id: t.id,
             title: trans.title,
             description: trans.description,
             price: t.base_price,
             duration: t.duration_hours,
             location: t.location,
             category_id: t.category_id,
             is_women_exclusive: t.is_women_exclusive, 
             imageUrl: finalImageUrl // Usa a URL da capa
           };
        }).filter(Boolean) as Tour[];

        setTours(formattedTours);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [lang, isWomenExclusiveMode, searchParams]);

  const filteredTours = useMemo(() => {
    return tours.filter(tour => {
      const matchSearch = tour.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'all' || tour.category_id === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [tours, searchQuery, selectedCategory]);
  
  const handleClearFilters = () => {
      setSearchQuery('');
      setSelectedCategory('all');
      
      if (isWomenExclusiveMode || searchParams.has('cat') || searchParams.has('search')) {
          router.push(`/${lang}/tours`);
      } 
  };

  if (loading || !dict) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-foz-azul-claro" /></div>;
  }

  const tCommon = dict.common;
  const tTours = dict.tours;
  const tHero = dict.hero; 
  
  const selectedBannerUrl = isWomenExclusiveMode 
      ? womenExclusiveBanner || "/54.jpg" 
      : toursBanner || "/54.jpg";

  return (
    <div className="min-h-screen bg-foz-bege">
      
      {/* Banner */}
      <div className="relative h-[50vh] min-h-[400px] flex items-center justify-center pt-20">
        <div className="absolute inset-0">
          <Image
            src={selectedBannerUrl}
            alt="Banner Passeios"
            fill
            className="object-cover"
            priority
          />
          <div className={`absolute inset-0 bg-gradient-to-b ${isWomenExclusiveMode ? 'from-acento-mulher/60 via-acento-mulher/40 to-foz-bege' : 'from-foz-azul-escuro/60 via-foz-azul-escuro/40 to-foz-bege'}`} />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mt-10">
          <h1 className={`text-4xl md:text-6xl font-bold text-white font-serif mb-4 drop-shadow-lg animate-fade-in-up ${isWomenExclusiveMode ? 'text-acento-mulher' : ''}`}>
            {isWomenExclusiveMode ? tHero.womenExclusiveTitle : tTours.title}
          </h1>
          <p className="text-lg md:text-xl text-white/90 font-light animate-fade-in-up delay-100">
            {isWomenExclusiveMode ? 'Experiências inesquecíveis pensadas e executadas por e para mulheres.' : tTours.subtitle}
          </p>
        </div>
      </div>

      {/* Filtros */}
      {!isWomenExclusiveMode && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-0 mb-12">
            <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl shadow-glass p-4 md:p-6 animate-fade-in-up delay-200">
              <div className="flex flex-col lg:flex-row gap-6 items-center">
                <div className="relative w-full lg:w-1/3 group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-gray-400 group-focus-within:text-foz-azul-claro transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder={tCommon.search + "..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/50 border-2 border-transparent hover:border-white/60 focus:border-foz-azul-claro rounded-2xl outline-none transition-all placeholder-gray-500 text-gray-800 font-medium shadow-inner"
                  />
                </div>

                <div className="w-full lg:flex-1 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${
                        selectedCategory === 'all'
                          ? 'bg-foz-azul-escuro text-white shadow-lg scale-105'
                          : 'bg-white/50 text-gray-600 hover:bg-white hover:text-foz-azul-escuro'
                      }`}
                    >
                      <Filter className="w-4 h-4" />
                      {dict.categories.all}
                    </button>
                    
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all duration-300 ${
                          selectedCategory === cat.id
                            ? 'bg-foz-azul-claro text-white shadow-lg scale-105'
                            : 'bg-white/50 text-gray-600 hover:bg-white hover:text-foz-azul-claro'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
      )}

      {/* Grid de Resultados */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="mb-8 text-gray-500 font-medium px-2 flex justify-between items-center">
           <span>{filteredTours.length} experiências encontradas</span>
           {(searchQuery || selectedCategory !== 'all' || isWomenExclusiveMode) && (
             <button 
               onClick={handleClearFilters}
               className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
             >
               <X className="w-4 h-4" /> Limpar filtros
             </button>
           )}
        </div>

        {filteredTours.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[2rem] shadow-sm border border-gray-100">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
               <Search className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{tCommon.noResults}</h3>
            <p className="text-gray-500">Tente mudar os filtros ou buscar por outro termo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTours.map((tour, index) => (
              <div 
                key={tour.id} 
                className="animate-fade-in-up h-[450px]"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <TourCard
                  tour={tour}
                  dict={tTours}
                  lang={lang}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}