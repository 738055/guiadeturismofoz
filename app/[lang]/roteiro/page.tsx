// app/[lang]/roteiro/page.tsx

import { TourCard } from '@/components/TourCard';
import { supabase } from '@/lib/supabase';
import { Locale, getDictionary } from '@/i18n/dictionaries';
import { Metadata } from 'next';
import { format, parseISO, differenceInDays } from 'date-fns';
import { MapPin } from 'lucide-react';

// --- CORREÇÃO 1: Definir o tipo Tour localmente ---
// (Este tipo é esperado pelo componente TourCard)
type Tour = {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  location: string;
  imageUrl: string | undefined; // Deve ser string | undefined para corresponder ao retorno
};

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
      .order('display_order', { referencedTable: 'tour_images', ascending: true });

    const { data: toursData, error: toursError } = await query;
    if (toursError) throw toursError;

    let filteredTours = toursData || [];

    // Filtra por data se os parâmetros existirem
    if (startDate && endDate) {
      const start = parseISO(startDate);
      const end = parseISO(endDate);

      filteredTours = filteredTours.filter((tour: any) => {
        const hasAvailability = tour.tour_availability?.some((avail: any) => {
          const availDate = parseISO(avail.available_date);
          return availDate >= start && availDate <= end && avail.total_spots > avail.spots_booked;
        });

        if (!hasAvailability) return false;
        return true; 
      });
    } else {
      return [];
    }

    // --- LÓGICA DE FALLBACK ADICIONADA ---
    // Formata os dados para o TourCard
    const tours = filteredTours.map((tour: any) => {
      const currentTranslation = tour.tour_translations.find((t: any) => t.language_code === lang);
      const fallbackTranslation = tour.tour_translations.find((t: any) => t.language_code === 'pt_BR');
      const translation = currentTranslation || fallbackTranslation;

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
    });
    
    // --- CORREÇÃO 2: Usar um filtro "type guard" explícito ---
    return tours.filter((tour): tour is Tour => tour !== null);

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
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    // --- CORREÇÃO DE RANGEERROR: Verificar se as datas são válidas antes de formatar ---
    if (start.toString() !== 'Invalid Date' && end.toString() !== 'Invalid Date') {
        try {
            dateLabel = `${format(start, 'dd/MM/yy')} - ${format(end, 'dd/MM/yy')}`;
            numDays = differenceInDays(end, start) + 1;
        } catch (e) {
            console.error("Date formatting error:", e);
            dateLabel = "Datas inválidas";
        }
    } else {
      console.error("Invalid date format in URL parameters.");
      dateLabel = "Datas inválidas";
    }
    // --- FIM DA CORREÇÃO ---
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
            {tours.map(tour => ( // Agora o TS sabe que 'tour' não é 'null'
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