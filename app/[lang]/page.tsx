// app/[lang]/page.tsx
import { Hero } from '@/components/Hero';
import { Categories } from '@/components/Categories';
import { PopularTours } from '@/components/PopularTours';
import { UmbrellaCuriosity } from '@/components/UmbrellaCuriosity'; // NOVO
import { TripAdvisor } from '@/components/TripAdvisor';
import { SocialFeed } from '@/components/SocialFeed'; // NOVO
import { supabase } from '@/lib/supabase';
import { Locale, getDictionary } from '@/i18n/dictionaries';

// --- CORREÇÃO 1: Definir o tipo Tour localmente ---
// (Este tipo é esperado pelo componente PopularTours)
type Tour = {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  location: string;
  imageUrl?: string;
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
          imageUrl: tour.tour_images?.[0]?.image_url
        };
      });
      
    // --- CORREÇÃO 2: Usar um filtro "type guard" explícito ---
    // Isso garante ao TypeScript que o array de retorno é 'Tour[]', não '(Tour | null)[]'
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
        tours={tours} // Agora 'tours' é do tipo Tour[], o que satisfaz o componente
        dict={dict.tours} 
        lang={lang} 
      />
      
      {/* NOVA SEÇÃO: Curiosidade do Guarda-Chuva */}
      <UmbrellaCuriosity dict={dict.umbrellaSection} lang={lang} />
      
      <TripAdvisor dict={dict.tripadvisor} />

      {/* NOVA SEÇÃO: Feed de Mídias Sociais */}
      <SocialFeed dict={dict.socialFeed} lang={lang} />
    </>
  );
}