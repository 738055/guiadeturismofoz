// app/[lang]/page.tsx
import { Hero } from '@/components/Hero';
import { Categories } from '@/components/Categories';
import { PopularTours } from '@/components/PopularTours';
import { UmbrellaCuriosity } from '@/components/UmbrellaCuriosity'; 
import { TripAdvisor } from '@/components/TripAdvisor';
import { SocialFeed } from '@/components/SocialFeed'; 
import { supabase } from '@/lib/supabase';
import { Locale, getDictionary } from '@/i18n/dictionaries';

// --- CORREÇÃO AQUI ---
// O tipo 'Tour' local deve corresponder ao que a função .map() retorna.
// A propriedade 'imageUrl' sempre existe, mas seu valor pode ser 'undefined'.
type Tour = {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  location: string;
  imageUrl: string | undefined; // Alterado de 'imageUrl?: string'
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
      .order('display_order', { referencedTable: 'tour_images', ascending: true })
      .limit(6);

    if (toursError) throw toursError;

    const tours = (toursData || []).map((tour: any) => {
        const translation = tour.tour_translations.find((t: any) => t.language_code === lang) ||
                            tour.tour_translations.find((t: any) => t.language_code === 'pt_BR');
        if (!translation) return null;
        return {
          id: tour.id,
          title: translation.title || '',
          description: translation.description || '',
          price: tour.base_price,
          duration: tour.duration_hours,
          location: tour.location,
          imageUrl: tour.tour_images?.[0]?.image_url // Esta linha gera 'string | undefined'
        };
      });
      
    // Este filtro "type guard" agora funciona, pois o tipo 'Tour' (com 'string | undefined')
    // corresponde ao tipo do array 'tours'.
    return tours.filter((tour): tour is Tour => tour !== null);

  } catch (error) {
    console.error('Error loading popular tours:', error);
    return [];
  }
}

export default async function Home({ params: { lang } }: { params: { lang: Locale } }) {
  const [tours, dict] = await Promise.all([
    getPopularTours(lang),
    getDictionary(lang),
  ]);

  return (
    <>
      <Hero dict={dict.hero} lang={lang} />
      
      <Categories dict={dict.categoriesSection} lang={lang} />
      
      <PopularTours 
        tours={tours} // 'tours' é 'Tour[]', que é compatível com o prop do componente
        dict={dict.tours} 
        lang={lang} 
      />
      
      <UmbrellaCuriosity dict={dict.umbrellaSection} lang={lang} />
      
      <TripAdvisor dict={dict.tripadvisor} />

      <SocialFeed dict={dict.socialFeed} lang={lang} />
    </>
  );
}