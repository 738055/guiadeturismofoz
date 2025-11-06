import { TourCard } from '@/components/TourCard';
import { supabase } from '@/lib/supabase';
import { Locale, getDictionary } from '@/i18n/dictionaries';
import { Metadata } from 'next';
import { format, parseISO, differenceInDays } from 'date-fns';
import { MapPin } from 'lucide-react';

// Busca de dados no Servidor (CORRIGIDA)
async function loadToursByDate(lang: Locale, startDate: string | null, endDate: string | null) {
  try {
    let query = supabase
      .from('tours')
      .select(`
        id,
        base_price,
        duration_hours,
        location,
        category_id,
        disabled_week_days,
        disabled_specific_dates,
        tour_translations!left(
          title,
          description,
          language_code
        ),
        tour_images (
          image_url,
          display_order
        ),
        tour_availability (
          available_date,
          total_spots,
          spots_booked
        )
      `)
      .eq('is_active', true)
      // REMOVIDO: .eq('tour_translations.language_code', lang)
      .order('display_order', { referencedTable: 'tour_images', ascending: true });

    const { data: toursData, error: toursError } = await query;
    if (toursError) throw toursError;

    let filteredTours = toursData || [];

    // Filtra por data se os parâmetros existirem
    if (startDate && endDate) {
      const start = parseISO(startDate);
      const end = parseISO(endDate);

      filteredTours = filteredTours.filter((tour: any) => {
        // 1. Verifica se há disponibilidade geral nesse período
        const hasAvailability = tour.tour_availability?.some((avail: any) => {
          const availDate = parseISO(avail.available_date);
          return availDate >= start && availDate <= end && avail.total_spots > avail.spots_booked;
        });

        if (!hasAvailability) return false;

        // 2. Verifica se o passeio não está bloqueado (lógica de dias)
        // (Esta lógica pode ser refinada, mas por enquanto filtramos pela disponibilidade)
        return true; 
      });
    } else {
      // Se não houver datas, não retorna nada (roteiro precisa de datas)
      return [];
    }

    // --- LÓGICA DE FALLBACK ADICIONADA ---
    // Formata os dados para o TourCard
    return filteredTours.map((tour: any) => {
      const currentTranslation = tour.tour_translations.find((t: any) => t.language_code === lang);
      const fallbackTranslation = tour.tour_translations.find((t: any) => t.language_code === 'pt_BR');
      const translation = currentTranslation || fallbackTranslation;

      // Se não houver tradução (ou disponibilidade), será nulo
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
        imageUrl: tour.tour_images[0]?.image_url
      };
    }).filter(Boolean); // Remove os nulos

  } catch (error) {
    console.error('Error loading tours for itinerary:', error);
    return [];
  }
}

// Metadados de SEO
export async function generateMetadata({
  params: { lang },
}: {
  params: { lang: Locale };
}): Promise<Metadata> {
  const dict = await getDictionary(lang);
  return {
    title: dict.cart.title, // "Meu Roteiro"
    description: `Sugestões de passeios em Foz do Iguaçu.`,
  };
}

// A Página de Servidor
export default async function RoteiroPage({
  params: { lang },
  searchParams,
}: {
  params: { lang: Locale };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const startDate = searchParams.start as string | null;
  const endDate = searchParams.end as string | null;

  const [tours, dict] = await Promise.all([
    loadToursByDate(lang, startDate, endDate),
    getDictionary(lang),
  ]);

  const query = `?start=${startDate || ''}&end=${endDate || ''}`;
  
  let dateLabel = dict.common.noResults;
  let numDays = 0;
  
  if(startDate && endDate) {
    try {
      dateLabel = `${format(parseISO(startDate), 'dd/MM/yy')} - ${format(parseISO(endDate), 'dd/MM/yy')}`;
      numDays = differenceInDays(parseISO(endDate), parseISO(startDate)) + 1;
    } catch (e) {
      console.error("Invalid date format");
      dateLabel = "Datas inválidas";
    }
  }


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[60vh]">
      <div className="mb-8">
        <h1
          className="text-3xl md:text-4xl font-bold text-verde-principal mb-2"
          style={{ fontFamily: 'var(--font-merriweather)' }}
        >
          {dict.cart.title}
        </h1>
        <p className="text-gray-600 text-lg">
          {dict.common.search}: <strong>{dateLabel} ({numDays} {numDays === 1 ? 'dia' : 'dias'})</strong>
        </p>
      </div>
      
      {tours.length === 0 ? (
        <div className="text-center py-20">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">{dict.common.noResults}</p>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Passeios disponíveis no período:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tours.map(tour => (
              <TourCard
                key={tour.id}
                tour={tour}
                dict={dict.tours}
                lang={lang}
                query={query} // Passa a query para manter o contexto de data
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}