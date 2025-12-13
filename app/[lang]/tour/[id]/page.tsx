// app/[lang]/tour/[id]/page.tsx

import { supabase } from '@/lib/supabase';
import { Locale, getDictionary } from '@/i18n/dictionaries';
import { Metadata, ResolvingMetadata } from 'next';
import { Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';
import Image from 'next/image';
import { TourClient } from './TourClient';
import { parseISO, addDays, format } from 'date-fns';
import { ImageGallery } from '@/components/ImageGallery';

// --- FUNÇÃO AUXILIAR DE PARSING SEGURO ---
const safeParse = (content: any) => {
    if (!content) return [];
    try {
        if (typeof content === 'string') {
            if (content.trim() === '') return []; 
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed)) {
                 return parsed.filter(item => typeof item === 'string' && item.trim() !== '');
            }
            return [String(parsed)].filter(item => typeof item === 'string' && item.trim() !== '');
        }
        if (Array.isArray(content)) {
            return content.filter(item => typeof item === 'string' && item.trim() !== '');
        }
    } catch (e) {
        if (typeof content === 'string' && content.trim() !== '') {
             return [content.trim()];
        }
        return []; 
    }
    return [];
};

// --- Busca de Dados no Servidor ---
async function getTourDetail(id: string, lang: Locale) {
  try {
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
          display_order,
          is_cover
        )
      `;
      
    const { data: tourData, error: tourError } = await supabase
      .from('tours')
      .select(selectQuery)
      .eq('id', id)
      .eq('is_active', true) 
      .maybeSingle();

    if (tourError) {
        console.error('SUPABASE FETCH ERROR in getTourDetail:', tourError);
        throw tourError;
    }
    if (!tourData) return null;

    const translations = tourData.tour_translations || [];
    
    let translation = translations.find((t: any) => t.language_code === lang);
    if (!translation) translation = translations.find((t: any) => t.language_code === 'pt-BR');
    if (!translation) translation = translations.find((t: any) => t.language_code === 'pt_BR');

    if (!translation) {
      return null;
    }
    
    // --- FILTRAR E ORDENAR IMAGENS ---
    const rawImages = tourData.tour_images || [];
    const validImages = rawImages.filter((img: any) => 
        img.image_url && !img.image_url.includes('placeholder')
    ).sort((a: any, b: any) => {
        // Prioridade 1: Capa
        if (a.is_cover && !b.is_cover) return -1;
        if (!a.is_cover && b.is_cover) return 1;
        // Prioridade 2: Ordem
        return (a.display_order || 0) - (b.display_order || 0);
    });

    return {
      ...tourData,
      title: translation.title || '',
      description: translation.description || '',
      whatsIncluded: safeParse(translation.whats_included), 
      whatsExcluded: safeParse(translation.whats_excluded), 
      disabled_week_days: tourData.disabled_week_days || [],
      disabled_specific_dates: tourData.disabled_specific_dates || [], 
      isWomenExclusive: tourData.is_women_exclusive || false,
      images: validImages,
    };
  } catch (error) {
    console.error('GENERIC ERROR IN getTourDetail:', error);
    return null;
  }
}

// --- Geração de Metadados de SEO ---
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

  // Simulação de Disponibilidade
  const fixedSpots = 50; 
  const numDaysToGenerate = 90; 
  let simulatedAvailability = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0); 
  
  let startGen = addDays(today, 1);
  let endGen = addDays(today, numDaysToGenerate);

  for (let d = startGen; d <= endGen; d = addDays(d, 1)) {
      simulatedAvailability.push({
          available_date: format(d, 'yyyy-MM-dd'),
          total_spots: fixedSpots,
          spots_booked: 0, 
      });
  }
  
  const availableDates = simulatedAvailability; 

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Lado Esquerdo: Nova Galeria de Imagens */}
        <ImageGallery images={tour.images} title={tour.title} />

        {/* Lado Direito: Conteúdo */}
        <div>
          <div className="flex items-center gap-4 mb-2">
             <h1
                className="text-3xl md:text-4xl font-bold text-verde-principal"
                style={{ fontFamily: 'var(--font-merriweather)' }}
              >
                {tour.title}
              </h1>
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

          {/* Componente de Cliente para Interação */}
          <TourClient 
            tour={{
                id: tour.id,
                title: tour.title,
                base_price: tour.base_price,
                disabled_week_days: tour.disabled_week_days,
                disabled_specific_dates: tour.disabled_specific_dates,
            }} 
            availableDates={availableDates} 
            dict={dict} 
            lang={lang} 
          />

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