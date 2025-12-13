// app/[lang]/page.tsx
import { Hero } from '@/components/Hero';
import { Categories } from '@/components/Categories';
import { PopularTours } from '@/components/PopularTours';
import { UmbrellaCuriosity } from '@/components/UmbrellaCuriosity'; 
import { TripAdvisor } from '@/components/TripAdvisor';
import { SocialFeed } from '@/components/SocialFeed'; 
import { ServicesTabs } from '@/components/ServicesTabs'; 
import { supabase } from '@/lib/supabase';
import { Locale, getDictionary } from '@/i18n/dictionaries';

// Tipo Tour atualizado
type Tour = {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  location: string;
  imageUrl: string | undefined; 
  is_women_exclusive: boolean;
};

// Tipo Categoria
type DynamicCategory = {
  id: string;
  key: 'falls' | 'nature' | 'adventure' | 'shopping' | 'cultural';
  image_url: string;
};

// --- FUNÇÃO AUXILIAR PARA LIMPAR URLS ---
function getValidImageUrl(url: string | null | undefined): string {
  // Se não existir, ou for um placeholder inválido, retorna imagem padrão
  if (!url || url.includes('placeholder') || !url.startsWith('http')) {
    return '/54.jpg'; // Imagem de fallback local
  }
  return url;
}

async function getPopularTours(lang: Locale) {
  try {
    const { data: toursData, error: toursError } = await supabase
      .from('tours')
      .select(`
        id, base_price, duration_hours, location, category_id, is_women_exclusive, 
        tour_translations!left(title, description, language_code),
        tour_images (image_url, display_order)
      `)
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('display_order', { referencedTable: 'tour_images', ascending: true })
      .limit(6);

    if (toursError) throw toursError;

    const tours = (toursData || []).map((tour: any) => {
        const translation = tour.tour_translations.find((t: any) => t.language_code === lang) ||
                            tour.tour_translations.find((t: any) => t.language_code === 'pt-BR');
        if (!translation) return null;
        
        // CORREÇÃO: Aplica a validação de URL aqui
        const rawImage = tour.tour_images?.[0]?.image_url;
        const validImage = getValidImageUrl(rawImage);

        return {
          id: tour.id,
          title: translation.title || '',
          description: translation.description || '',
          price: tour.base_price,
          duration: tour.duration_hours,
          location: tour.location,
          is_women_exclusive: tour.is_women_exclusive || false,
          imageUrl: validImage // Usa a URL validada
        };
      });
      
    return tours.filter((tour): tour is Tour => tour !== null);

  } catch (error) {
    console.error('Error loading popular tours:', error);
    return [];
  }
}

async function getDynamicCategories(lang: Locale): Promise<DynamicCategory[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select(`
        id,
        image_url,
        category_translations!inner(slug, language_code)
      `)
      .in('category_translations.language_code', [lang, 'pt-BR'])
      .not('image_url', 'is', null)
      .limit(4);

    if (error) throw error;
    
    const dynamicCategories = (data || []).map((cat: any) => {
        const translation = cat.category_translations.find((t: any) => t.language_code === lang) ||
                            cat.category_translations.find((t: any) => t.language_code === 'pt-BR');

        const keyMap: Record<string, DynamicCategory['key']> = {
            'cataratas': 'falls',
            'natureza': 'nature',
            'aventura': 'adventure',
            'cultural': 'cultural',
            'shopping': 'shopping' 
        };
        
        const dictKey = translation?.slug ? keyMap[translation.slug] : null; 

        if (!dictKey) return null;

        // CORREÇÃO: Valida imagem da categoria também
        return {
            id: cat.id,
            key: dictKey,
            image_url: getValidImageUrl(cat.image_url),
        };
    }).filter(Boolean) as DynamicCategory[];
    
    return dynamicCategories; 

  } catch (error) {
    console.error('Error loading dynamic categories:', error);
    return [];
  }
}

export default async function Home({ params: { lang } }: { params: { lang: Locale } }) {
  const [tours, dict, dynamicCategories] = await Promise.all([
    getPopularTours(lang),
    getDictionary(lang),
    getDynamicCategories(lang),
  ]);

  return (
    <>
      <Hero dict={dict.hero} lang={lang} />
      
      <Categories 
        dict={dict.categoriesSection} 
        lang={lang} 
        dynamicCategories={dynamicCategories}
      />
      
      <PopularTours 
        tours={tours}
        dict={{
          popular: dict.tours.title, 
          from: dict.tours.from,
          viewDetails: dict.tours.viewDetails,
          hours: dict.tours.hours
        }}
        lang={lang} 
      />
      
      <UmbrellaCuriosity dict={dict.umbrellaSection} lang={lang} />
      
      <ServicesTabs dict={dict.servicesSection} />
      
      <TripAdvisor dict={dict.tripadvisor} />

      <SocialFeed dict={dict.socialFeed} lang={lang} />
    </>
  );
}