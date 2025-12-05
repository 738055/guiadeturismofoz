// guiadeturismofoz/app/[lang]/tour/[id]/page.tsx

import { supabase } from '@/lib/supabase';
import { Locale, getDictionary } from '@/i18n/dictionaries';
import { Metadata, ResolvingMetadata } from 'next';
import { Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';
import Image from 'next/image';
import { TourClient } from './TourClient';
import { parseISO } from 'date-fns';

// --- Tipo de Retorno da Busca ---
type TourDetailData = Awaited<ReturnType<typeof getTourDetail>>;

// --- FUNÇÃO AUXILIAR DE PARSING SEGURO (CORRIGIDA PARA ROBUSTEZ) ---
const safeParse = (content: any) => {
    if (!content) return [];
    try {
        if (typeof content === 'string') {
            // Tenta fazer o parse. Se for uma string vazia, retorna array vazio.
            if (content.trim() === '') return []; 
            
            const parsed = JSON.parse(content);
            
            // Se o resultado do parse é um array, filtra itens vazios
            if (Array.isArray(parsed)) {
                 return parsed.filter(item => typeof item === 'string' && item.trim() !== '');
            }
            // Tenta tratar um único item parseado como string e retorna em um array.
            return [String(parsed)].filter(item => typeof item === 'string' && item.trim() !== '');
        }
        if (Array.isArray(content)) {
            // Se já é um array, apenas garante que os itens são strings e não estão vazios
            return content.filter(item => typeof item === 'string' && item.trim() !== '');
        }
    } catch (e) {
        // Em caso de falha no JSON.parse (ex: campo tem texto simples, não JSON),
        // retorna o conteúdo como um array de string se não for vazio.
        if (typeof content === 'string' && content.trim() !== '') {
             return [content.trim()];
        }
        return []; 
    }
    return [];
};


// --- Busca de Dados no Servidor (AJUSTADA PARA ROBUSTEZ) ---
async function getTourDetail(id: string, lang: Locale) {
  try {
    // A query completa é grande, mas necessária
    const selectQuery = `
        id,
        base_price,
        duration_hours,
        location,
        disabled_week_days,
        disabled_specific_dates,
        is_women_exclusive,
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
      `;
      
    // 1. Executa a consulta
    const { data: tourData, error: tourError } = await supabase
      .from('tours')
      .select(selectQuery)
      .eq('id', id)
      .eq('is_active', true) // Mantém o filtro de ativo
      .order('display_order', { referencedTable: 'tour_images', ascending: true })
      .maybeSingle();

    if (tourError) {
        // Loga o erro exato do Supabase
        console.error('SUPABASE FETCH ERROR in getTourDetail:', tourError);
        throw tourError; // Lança para o catch, que retorna null
    }
    if (!tourData) return null; // Passeio não encontrado ou não ativo

    const translations = tourData.tour_translations || [];
    
    // --- LÓGICA DE FALLBACK APRIMORADA ---
    let translation = translations.find((t: any) => t.language_code === lang);
    
    if (!translation) {
        translation = translations.find((t: any) => t.language_code === 'pt-BR');
    }
    // Adiciona o fallback para pt_BR (com underline) para cobrir dados legados
    if (!translation) {
        translation = translations.find((t: any) => t.language_code === 'pt_BR');
    }

    if (!translation) {
      console.error(`Tour ${id} found, but no usable translation available.`);
      return null;
    }

    const images = tourData.tour_images || [];
    const availability = tourData.tour_availability || [];

    return {
      ...tourData,
      title: translation.title || '',
      description: translation.description || '',
      // Usa safeParse para garantir que os campos são arrays
      whatsIncluded: safeParse(translation.whats_included), 
      whatsExcluded: safeParse(translation.whats_excluded), 
      disabled_week_days: tourData.disabled_week_days || [],
      disabled_specific_dates: tourData.disabled_specific_dates || [],
      isWomenExclusive: tourData.is_women_exclusive || false,
      images,
      availability
    };
  } catch (error) {
    // Loga o erro geral antes de retornar null
    console.error('GENERIC ERROR IN getTourDetail:', error);
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
          // Note: Availability check logic might need adjustment if using this in production
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Parte de Imagens (Servidor) */}
        <div>
          <div className="relative h-96 rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-verde-principal to-verde-secundario">
            {tour.images[0] ? (
              <Image
                src={tour.images[0].image_url}
                alt={tour.images[0].alt_text || tour.title}
                fill
                className="object-cover"
                priority
                sizes="50vw"
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
                    className="object-cover"
                    sizes="20vw"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Parte de Conteúdo (Servidor) */}
        <div>
          <div className="flex items-center gap-4 mb-2">
             <h1
                className="text-3xl md:text-4xl font-bold text-verde-principal"
                style={{ fontFamily: 'var(--font-merriweather)' }}
              >
                {tour.title}
              </h1>
              {/* NOVO: Badge Exclusivo */}
              {tour.isWomenExclusive && (
                  <span className="bg-acento-mulher text-white px-3 py-1 rounded-full text-sm font-bold shadow-md uppercase tracking-wider whitespace-nowrap">
                      {dict.tours.womenExclusiveBadge}
                  </span>
              )}
          </div>

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

          {/* --- ÁREA DE INCLUÍDO / NÃO INCLUÍDO --- */}
          <div className="space-y-6 mt-8">
            {tour.whatsIncluded && tour.whatsIncluded.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>{dict.tours.whatsIncluded}</span>
                </h3>
                <ul className="space-y-2 pl-2">
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