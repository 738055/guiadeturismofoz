// app/[lang]/combos/[id]/page.tsx

import { supabase } from '@/lib/supabase';
import { Locale, getDictionary } from '@/i18n/dictionaries';
import { Metadata, ResolvingMetadata } from 'next';
import { Check, ArrowRight, Package, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { ImageGallery } from '@/components/ImageGallery';

// --- Função Auxiliar de Parsing ---
const safeParse = (content: any) => {
    if (!content) return [];
    try {
        if (typeof content === 'string') {
            if (content.trim() === '') return []; 
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed)) return parsed.filter(item => typeof item === 'string' && item.trim() !== '');
            return [String(parsed)].filter(item => typeof item === 'string' && item.trim() !== '');
        }
        if (Array.isArray(content)) return content.filter(item => typeof item === 'string' && item.trim() !== '');
    } catch (e) {
        if (typeof content === 'string' && content.trim() !== '') return [content.trim()];
        return []; 
    }
    return [];
};

// --- Busca de Dados ---
async function getComboDetail(id: string, lang: Locale) {
  try {
    const { data: combo, error } = await supabase
      .from('combos')
      .select(`
        *,
        combo_translations!inner(title, description, whats_included, language_code),
        combo_images(image_url, alt_text, display_order, is_cover)
      `)
      .eq('id', id)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    if (!combo) return null;

    // Filtra tradução correta
    const targetLang = lang === 'pt-BR' ? 'pt_BR' : lang; // Ajuste conforme seu banco
    let translation = combo.combo_translations.find((t: any) => t.language_code === targetLang);
    // Fallback para pt_BR se não encontrar
    if (!translation) translation = combo.combo_translations.find((t: any) => t.language_code === 'pt_BR');
    if (!translation) return null;

    // Ordena imagens (Capa primeiro)
    const sortedImages = (combo.combo_images || [])
      .filter((img: any) => img.image_url)
      .sort((a: any, b: any) => {
          if (a.is_cover && !b.is_cover) return -1;
          if (!a.is_cover && b.is_cover) return 1;
          return (a.display_order || 0) - (b.display_order || 0);
      });

    return {
      ...combo,
      title: translation.title,
      description: translation.description,
      whatsIncluded: safeParse(translation.whats_included),
      images: sortedImages
    };
  } catch (error) {
    console.error('Erro ao buscar detalhes do combo:', error);
    return null;
  }
}

// --- Metadados SEO ---
export async function generateMetadata(
  { params: { id, lang } }: { params: { id: string; lang: Locale } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const combo = await getComboDetail(id, lang);
  if (!combo) return { title: 'Combo não encontrado' };
  
  return {
    title: combo.title,
    description: combo.description.substring(0, 160),
    openGraph: {
      images: combo.images[0]?.image_url ? [combo.images[0].image_url] : [],
    }
  };
}

export default async function ComboDetailPage({
  params: { id, lang },
}: {
  params: { id: string; lang: Locale };
}) {
  const dict = await getDictionary(lang);
  const combo = await getComboDetail(id, lang);

  if (!combo) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center min-h-[60vh] pt-32">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4"/>
        <h1 className="text-2xl font-bold text-gray-700">Combo não encontrado</h1>
        <p className="text-gray-500 mt-2">O pacote que você procura não está disponível.</p>
        <Link href={`/${lang}/combos`} className="text-verde-principal font-bold mt-4 inline-block hover:underline">
          Ver outros combos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Coluna Esquerda: Galeria e Descrição */}
        <div className="lg:col-span-2 space-y-8">
          {/* Galeria */}
          <div className="rounded-2xl overflow-hidden shadow-sm">
             <ImageGallery images={combo.images} title={combo.title} />
          </div>

          {/* Título Mobile (aparece aqui em telas pequenas) */}
          <div className="lg:hidden">
             <h1 className="text-3xl font-bold text-foz-azul-escuro font-serif mb-2">{combo.title}</h1>
             {combo.old_price && <span className="text-sm text-gray-400 line-through">De R$ {Number(combo.old_price).toFixed(2)}</span>}
             <div className="text-3xl font-bold text-verde-principal">Por R$ {Number(combo.base_price).toFixed(2)}</div>
          </div>

          {/* Descrição */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-verde-principal"/>
              Sobre este pacote
            </h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line text-lg">
              {combo.description}
            </p>
          </div>

          {/* O que está incluso */}
          {combo.whatsIncluded.length > 0 && (
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">O que está incluso:</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {combo.whatsIncluded.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700">
                    <div className="mt-1 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Coluna Direita: Card de Reserva (Sticky) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
            <h1 className="hidden lg:block text-2xl font-bold text-foz-azul-escuro font-serif mb-4 leading-tight">
              {combo.title}
            </h1>

            <div className="mb-6 pb-6 border-b border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Preço total do pacote</p>
              <div className="flex items-baseline gap-3">
                {combo.old_price && (
                  <span className="text-lg text-gray-400 line-through">R$ {Number(combo.old_price).toFixed(2)}</span>
                )}
                <span className="text-4xl font-bold text-verde-principal">R$ {Number(combo.base_price).toFixed(2)}</span>
              </div>
              {combo.old_price && (
                <span className="inline-block mt-2 bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
                  {Math.round(((Number(combo.old_price) - Number(combo.base_price)) / Number(combo.old_price)) * 100)}% OFF
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <span>Garantia de melhor preço e atendimento personalizado.</span>
              </div>

              <Link 
                href={`https://wa.me/5545000000000?text=Olá, tenho interesse em reservar o combo: *${combo.title}*`}
                target="_blank"
                className="w-full bg-verde-principal text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-verde-secundario hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                Reservar no WhatsApp
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <p className="text-xs text-center text-gray-400">
                Fale diretamente com nossos consultores para verificar disponibilidade.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}