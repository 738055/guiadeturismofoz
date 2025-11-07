// app/[lang]/tour/[id]/page.tsx

import { supabase } from '@/lib/supabase';
import { Locale, getDictionary } from '@/i18n/dictionaries';
import { Metadata, ResolvingMetadata } from 'next';
import { Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';
import Image from 'next/image';
import { TourClient } from './TourClient'; // Componente de cliente
import { parseISO } from 'date-fns';

// --- Tipo de Retorno da Busca ---
type TourDetailData = Awaited<ReturnType<typeof getTourDetail>>;

// --- Busca de Dados no Servidor (CORRIGIDA) ---
async function getTourDetail(id: string, lang: Locale) {
  try {
    const { data: tourData, error: tourError } = await supabase
      .from('tours')
      .select(`
        id,
        base_price,
        duration_hours,
        location,
        disabled_week_days,
        disabled_specific_dates,
        tour_translations!left (
          title,
          description,
          whats_included,
          whats_excluded,
          language_code
        ),
        tour_images (
          image_url,
          alt_text,
          display_order
        ),
        tour_availability (
          available_date,
          total_spots,
          spots_booked
        )
      `)
      .eq('id', id)
      .eq('is_active', true)
      // REMOVIDO: .eq('tour_translations.language_code', lang)
      .order('display_order', { referencedTable: 'tour_images', ascending: true })
      .maybeSingle();

    if (tourError) throw tourError;
    if (!tourData) return null;

    // --- LÓGICA DE FALLBACK ADICIONADA ---
    const translation = tourData.tour_translations.find((t: any) => t.language_code === lang) || 
                        tourData.tour_translations.find((t: any) => t.language_code === 'pt_BR');

    // Se não houver tradução NENHUMA (nem pt-BR), não encontra o passeio
    if (!translation) {
      console.error(`Tour ${id} found, but no translation available (not even pt-BR).`);
      return null;
    }

    const images = tourData.tour_images || [];
    const availability = tourData.tour_availability || [];

    return {
      ...tourData,
      title: translation?.title || '',
      description: translation?.description || '',
      whatsIncluded: translation?.whats_included || [], // <-- GARANTE ARRAY
      whatsExcluded: translation?.whats_excluded || [], // <-- GARANTE ARRAY
      disabled_week_days: tourData.disabled_week_days || [],
      disabled_specific_dates: tourData.disabled_specific_dates || [],
      images,
      availability
    };
  } catch (error) {
    console.error('Error loading tour detail:', error);
    return null;
  }
}

// --- Geração de Metadados de SEO (Servidor) ---
export async function generateMetadata(
  { params: { id, lang } }: { params: { id: string; lang: Locale } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const tour = await getTourDetail(id, lang);
  if (!tour) {
    return { title: 'Passeio não encontrado' };
  }
  const description = tour.description.substring(0, 160);
  return {
    title: tour.title,
    description: description,
    openGraph: {
      title: tour.title,
      description: description,
      images: [
        {
          url: tour.images[0]?.image_url || '',
          width: 1200,
          height: 630,
          alt: tour.title,
        },
      ],
    },
    other: {
      'application/ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: tour.title,
        description: tour.description,
        image: tour.images[0]?.image_url,
        sku: tour.id,
        offers: {
          '@type': 'Offer',
          price: tour.base_price,
          priceCurrency: 'BRL',
          availabilityStarts: tour.availability.filter(a => a.total_spots > a.spots_booked).map(a => a.available_date),
          url: `https://destino.co/${lang}/tour/${tour.id}`, 
          seller: {
            '@type': 'Organization',
            name: 'Araucária Turismo Receptivo',
          },
        },
      }),
    },
  };
}


// --- A Página (Servidor) ---
export default async function TourDetailPage({
  params: { id, lang },
  searchParams,
}: {
  params: { id: string; lang: Locale };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const startDate = searchParams.start as string | null;
  const endDate = searchParams.end as string | null;

  const [tour, dict] = await Promise.all([
    getTourDetail(id, lang),
    getDictionary(lang),
  ]);

  if (!tour) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center min-h-[60vh]">
        <p className="text-gray-500">{dict.common.error}</p>
      </div>
    );
  }

  // Filtra disponibilidade com base nos searchParams
  let availability = tour.availability;
  if (startDate && endDate) {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    availability = availability.filter((avail: any) => {
      const availDate = parseISO(avail.available_date);
      return availDate >= start && availDate <= end && avail.total_spots > avail.spots_booked;
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Parte de Imagens (Servidor) */}
        <div>
          <div className="relative h-96 rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-verde-principal to-verde-secundario">
            {tour.images[0] ? (
              <Image
                src={tour.images[0].image_url}
                alt={tour.images[0].alt_text || tour.title}
                fill
                className="w-full h-full object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <MapPin className="w-24 h-24 text-white opacity-50" />
              </div>
            )}
          </div>

          {tour.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {tour.images.slice(1, 5).map((image: any, index: number) => (
                <div key={index} className="relative h-24 rounded-lg overflow-hidden">
                  <Image
                    src={image.image_url}
                    alt={image.alt_text || `${tour.title} ${index + 2}`}
                    fill
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Parte de Conteúdo (Servidor) */}
        <div>
          <h1
            className="text-3xl md:text-4xl font-bold text-verde-principal mb-4"
            style={{ fontFamily: 'var(--font-merriweather)' }}
          >
            {tour.title}
          </h1>

          <div className="flex items-center space-x-6 text-gray-600 mb-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>{tour.duration_hours} {dict.tours.hours}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>{tour.location}</span>
            </div>
          </div>

          <div className="text-3xl font-bold text-verde-principal mb-8">
            {dict.tours.from} R$ {tour.base_price.toFixed(2)}
          </div>

          <p className="text-gray-700 leading-relaxed mb-8 whitespace-pre-line">
            {tour.description}
          </p>

          {/* --- Componente de Cliente para Interação --- */}
          <TourClient 
            tour={tour} // Passa o objeto 'tour' inteiro
            availableDates={availability} 
            dict={dict} // Passa o dicionário completo
          />

          {/* --- ÁREA DE INCLUÍDO / NÃO INCLUÍDO (ATUALIZADA) --- */}
          <div className="space-y-6 mt-8">
            {tour.whatsIncluded && tour.whatsIncluded.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>{dict.tours.whatsIncluded}</span>
                </h3>
                <ul className="space-y-2 pl-2">
                  {/* --- CORREÇÃO 1 AQUI --- */}
                  {tour.whatsIncluded.map((item: string, index: number) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {tour.whatsExcluded && tour.whatsExcluded.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center space-x-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span>{dict.tours.whatsExcluded}</span>
                </h3>
                <ul className="space-y-2 pl-2">
                  {/* --- CORREÇÃO 2 AQUI --- */}
                  {tour.whatsExcluded.map((item: string, index: number) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <XCircle className="w-4 h-4 text-red-600 mr-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}