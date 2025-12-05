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

// O tipo 'Tour' local
type Tour = {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  location: string;
  imageUrl: string | undefined; 
};

// NOVO TIPO PARA CATEGORIAS DINÂMICAS
type DynamicCategory = {
  id: string;
  key: 'falls' | 'nature' | 'adventure' | 'shopping' | 'cultural'; // Chave para tradução e ícone
  image_url: string; // URL da imagem de destaque
};

async function getPopularTours(lang: Locale) {
  try {
    const { data: toursData, error: toursError } = await supabase
      .from('tours')
      .select(`
        id, base_price, duration_hours, location, category_id,
        tour_translations!left(title, description, language_code),
        tour_images (image_url, display_order)
      `)
      .eq('is_active', true)
      // .eq('is_featured', true) // <-- Adicionar este filtro após implementar a coluna is_featured
      .order('display_order', { referencedTable: 'tour_images', ascending: true })
      .limit(6);

    if (toursError) throw toursError;

    const tours = (toursData || []).map((tour: any) => {
        const translation = tour.tour_translations.find((t: any) => t.language_code === lang) ||
                            tour.tour_translations.find((t: any) => t.language_code === 'pt-BR');
        if (!translation) return null;
        return {
          id: tour.id,
          title: translation.title || '',
          description: translation.description || '',
          price: tour.base_price,
          duration: tour.duration_hours,
          location: tour.location,
          imageUrl: tour.tour_images?.[0]?.image_url
        };
      });
      
    return tours.filter((tour): tour is Tour => tour !== null);

  } catch (error) {
    console.error('Error loading popular tours:', error);
    return [];
  }
}

// NOVA FUNÇÃO PARA BUSCAR CATEGORIAS DINAMICAMENTE
async function getDynamicCategories(lang: Locale): Promise<DynamicCategory[]> {
  try {
    // Buscamos o ID, a URL da imagem e a chave de tradução (que será o slug/key)
    const { data, error } = await supabase
      .from('categories')
      .select(`
        id,
        image_url,
        category_translations!inner(slug, language_code)
      `)
      // Garantimos que a categoria tenha pelo menos a tradução na língua local (ou pt-BR)
      .in('category_translations.language_code', [lang, 'pt-BR'])
      .not('image_url', 'is', null) // Garante que apenas categorias com imagem sejam mostradas
      .limit(4); // Limita a 4 categorias como o design original

    if (error) throw error;
    
    // Mapeamos para o formato esperado
    const dynamicCategories = (data || []).map((cat: any) => {
        const translation = cat.category_translations.find((t: any) => t.language_code === lang) ||
                            cat.category_translations.find((t: any) => t.language_code === 'pt-BR');

        // Usa o slug como a 'key' de tradução (falls, nature, adventure, etc.)
        const keyMap: Record<string, DynamicCategory['key']> = {
            'cataratas': 'falls',
            'natureza': 'nature',
            'aventura': 'adventure',
            'cultural': 'cultural',
            'shopping': 'shopping' 
            // Adicione outros slugs conforme necessário
        };
        
        // Tentamos mapear o slug do banco para a chave de tradução hardcoded no JSON
        const dictKey = translation?.slug ? keyMap[translation.slug] : null; 

        if (!dictKey) {
            console.warn(`Category slug '${translation?.slug}' not mapped to a dictionary key. Skipping.`);
            return null;
        }

        return {
            id: cat.id,
            key: dictKey,
            image_url: cat.image_url || '/54.jpg', // Fallback
        };
    }).filter(Boolean) as DynamicCategory[];
    
    // Se não houver 4 categorias no DB, mantemos o que foi encontrado.
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
    getDynamicCategories(lang), // <-- NOVO: Busca categorias dinâmicas
  ]);

  // --- DEBUG ---
  // Esta linha aparecerá no seu TERMINAL.
  // Verifique se 'servicesSection' está na lista após reiniciar o servidor.
  console.log('CHAVES DO DICIONÁRIO CARREGADO:', Object.keys(dict)); 
  // --- FIM DO DEBUG ---

  return (
    <>
      <Hero dict={dict.hero} lang={lang} />
      
      {/* ATUALIZADO: Passa as categorias dinâmicas */}
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
      
      {/* Passando a seção do dicionário. Se ela foi carregada (após reiniciar),
          o componente irá renderizar. */}
      <ServicesTabs dict={dict.servicesSection} />
      
      <TripAdvisor dict={dict.tripadvisor} />

      <SocialFeed dict={dict.socialFeed} lang={lang} />
    </>
  );
}