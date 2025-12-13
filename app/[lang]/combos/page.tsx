// app/[lang]/combos/page.tsx
import React from 'react';
import { Locale, getDictionary } from '@/i18n/dictionaries';
import { PageBanner } from '@/components/PageBanner';
import { Package, Check, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

// --- CORREÇÃO 1: Força a página a buscar dados novos sempre (evita cache antigo) ---
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params: { lang } }: { params: { lang: Locale } }): Promise<Metadata> {
  const dict = await getDictionary(lang);
  return {
    title: dict.combos.title,
    description: dict.combos.subtitle,
  };
}

export default async function CombosPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dict = await getDictionary(lang);
  const t = dict.combos;

  const { data: bannerData } = await supabase.from('site_settings').select('setting_value').eq('setting_key', 'banner_combos').single();
  const bannerUrl = bannerData?.setting_value || "/54.jpg";

  // Busca combos
  const { data: combos, error } = await supabase
    .from('combos')
    .select(`
      *,
      combo_translations!inner(title, description, whats_included, language_code),
      combo_images(image_url, is_cover, display_order)
    `)
    .eq('is_active', true)
    .eq('combo_translations.language_code', lang) // Filtra pelo idioma da URL
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Erro ao buscar combos:", error);
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <PageBanner title={t.title} subtitle={t.subtitle} image={bannerUrl} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 mt-12">
        {!combos || combos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200 shadow-sm">
            <div className="bg-gray-50 p-6 rounded-full mb-6">
               <Package className="w-16 h-16 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Em breve</h3>
            <p className="text-gray-500 text-lg">{t.noCombos}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {combos.map((combo: any) => {
               const translation = combo.combo_translations[0];
               
               // --- CORREÇÃO 2: Lógica Segura de Capa ---
               let displayImage = null;
               if (combo.combo_images && combo.combo_images.length > 0) {
                   // Cria uma CÓPIA do array com [...array] antes de ordenar para evitar erros de mutação
                   const sortedImages = [...combo.combo_images].sort((a: any, b: any) => {
                       // is_cover === true vem primeiro (-1)
                       if (a.is_cover === true && b.is_cover !== true) return -1;
                       if (a.is_cover !== true && b.is_cover === true) return 1;
                       // Desempate por display_order
                       return (a.display_order || 0) - (b.display_order || 0);
                   });
                   displayImage = sortedImages[0].image_url;
               }

               let features = [];
               try { 
                   features = typeof translation.whats_included === 'string' 
                      ? JSON.parse(translation.whats_included) 
                      : translation.whats_included; 
               } catch (e) {
                   if (typeof translation.whats_included === 'string') features = [translation.whats_included];
               }
               if(!Array.isArray(features)) features = [];

               return (
                 <Link 
                    key={combo.id} 
                    href={`/${lang}/combos/${combo.id}`}
                    className="bg-white rounded-3xl shadow-lg overflow-hidden flex flex-col border border-gray-100 hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
                 >
                    <div className="relative h-56 bg-gray-200 overflow-hidden">
                      {displayImage ? (
                        <Image 
                          src={displayImage} 
                          alt={translation.title} 
                          fill 
                          className="object-cover group-hover:scale-105 transition-transform duration-500" 
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400"><ImageIcon className="w-12 h-12 opacity-50"/></div>
                      )}
                      {combo.old_price && (
                        <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                          OFERTA
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-2xl font-bold text-foz-azul-escuro mb-2 font-serif group-hover:text-verde-principal transition-colors">
                        {translation.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {translation.description}
                      </p>
                      
                      <div className="space-y-2 mb-6 flex-1">
                        {features.slice(0, 3).map((feat: string, i: number) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                        {features.length > 3 && (
                          <p className="text-xs text-gray-400 italic">+ {features.length - 3} itens</p>
                        )}
                      </div>
                      
                      <div className="mt-auto pt-4 border-t border-gray-100">
                        <div className="flex items-end justify-between mb-4">
                           <div>
                             {combo.old_price && (
                               <span className="text-sm text-gray-400 line-through block">
                                 De R$ {Number(combo.old_price).toFixed(2)}
                               </span>
                             )}
                             <span className="text-2xl font-bold text-verde-principal">
                               Por R$ {Number(combo.base_price).toFixed(2)}
                             </span>
                           </div>
                        </div>
                        <div className="w-full bg-gray-50 text-verde-principal py-3 rounded-xl font-semibold flex items-center justify-center gap-2 group-hover:bg-verde-principal group-hover:text-white transition-colors">
                           Ver Detalhes <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                 </Link>
               )
            })}
          </div>
        )}
      </div>
    </div>
  );
}