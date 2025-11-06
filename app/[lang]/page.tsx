import { Hero } from '@/components/Hero';
import { HowItWorks } from '@/components/HowItWorks';
import { PopularTours } from '@/components/PopularTours';
import { TripAdvisor } from '@/components/TripAdvisor';
import { supabase } from '@/lib/supabase';
import { Locale, getDictionary } from '@/i18n/dictionaries';
import { Metadata } from 'next';

// Função de busca de dados no servidor (CORRIGIDA)
async function getPopularTours(lang: Locale) {
  try {
    const { data: toursData, error: toursError } = await supabase
      .from('tours')
      .select(`
        id,
        base_price,
        duration_hours,
        location,
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
      // REMOVIDA: .eq('tour_translations.language_code', lang)
      .order('display_order', { referencedTable: 'tour_images', ascending: true })
      .limit(6);

    if (toursError) throw toursError;

    // --- LÓGICA DE FALLBACK ADICIONADA ---
    const formattedTours = (toursData || [])
      .map((tour: any) => {
        // 1. Tenta encontrar a tradução do idioma atual
        const currentTranslation = tour.tour_translations.find((t: any) => t.language_code === lang);
        // 2. Tenta encontrar a tradução de fallback (Português)
        const fallbackTranslation = tour.tour_translations.find((t: any) => t.language_code === 'pt_BR');
        
        // 3. Usa a tradução atual ou o fallback
        const translation = currentTranslation || fallbackTranslation;

        // 4. Se não houver tradução NENHUMA (nem pt-BR), não exibe o passeio
        if (!translation) {
          return null;
        }

        return {
          id: tour.id,
          title: translation.title || '',
          description: translation.description || '',
          price: tour.base_price,
          duration: tour.duration_hours,
          location: tour.location,
          imageUrl: tour.tour_images[0]?.image_url // Pega a primeira imagem ordenada
        };
      })
      .filter(Boolean); // Remove os passeios que retornaram null
    
    return formattedTours;
  } catch (error) {
    console.error('Error loading popular tours:', error);
    return [];
  }
}

// Metadados de SEO para a Home
export async function generateMetadata({
  params: { lang },
}: {
  params: { lang: Locale };
}): Promise<Metadata> {
  const dict = await getDictionary(lang);
  return {
    title: `${dict.nav.home} | Araucária Turismo Receptivo`,
    description: dict.hero.subtitle,
  };
}

// A Página de Servidor
export default async function Home({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  // Busca dados e dicionário em paralelo
  const [tours, dict] = await Promise.all([
    getPopularTours(lang),
    getDictionary(lang),
  ]);

  return (
    <>
      <Hero dict={dict.hero} lang={lang} />
      <HowItWorks dict={dict.howItWorks} />
      <PopularTours 
        tours={tours} // Passa os passeios pré-buscados
        dict={dict.tours} // Passa apenas a seção "tours" do dicionário
        lang={lang} 
      />
      <TripAdvisor dict={dict.tripadvisor} />
    </>
  );
}