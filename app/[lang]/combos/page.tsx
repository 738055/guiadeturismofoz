// app/[lang]/combos/page.tsx
import React from 'react';
import { Locale, getDictionary } from '@/i18n/dictionaries';
import { PageBanner } from '@/components/PageBanner';
import { Package, Check, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';

export default async function CombosPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dict = await getDictionary(lang);
  const t = dict.combos;

  // 1. Busca URL do Banner
  const { data: bannerData } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'banner_combos')
      .single();

  const bannerUrl = bannerData?.setting_value || "/54.jpg";

  // 2. Busca Combos Ativos do Banco de Dados
  // Nota: lang === 'pt-BR' é ajustado para corresponder ao formato no banco se necessário
  const { data: combos } = await supabase
    .from('combos')
    .select(`
      *,
      combo_translations!inner(title, description, whats_included),
      combo_images(image_url)
    `)
    .eq('is_active', true)
    .eq('combo_translations.language_code', lang === 'pt-BR' ? 'pt-BR' : lang) 
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <PageBanner 
        title={t.title} 
        subtitle={t.subtitle}
        image={bannerUrl}
      />

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
               const image = combo.combo_images?.[0]?.image_url;
               
               // Parse whats_included com segurança
               let features = [];
               try { 
                   features = typeof translation.whats_included === 'string' 
                      ? JSON.parse(translation.whats_included) 
                      : translation.whats_included; 
               } catch {}
               if(!Array.isArray(features)) features = [];

               return (
                 <div key={combo.id} className="bg-white rounded-3xl shadow-lg overflow-hidden flex flex-col border border-gray-100 hover:shadow-xl transition-shadow group">
                    <div className="relative h-56 bg-gray-200 overflow-hidden">
                      {image ? (
                        <Image src={image} alt={translation.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400"><Package className="w-12 h-12"/></div>
                      )}
                      {combo.old_price && (
                        <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                          OFERTA
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-2xl font-bold text-foz-azul-escuro mb-2 font-serif">{translation.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{translation.description}</p>
                      
                      <div className="space-y-2 mb-6 flex-1">
                        {features.slice(0, 3).map((feat: string, i: number) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                        {features.length > 3 && <p className="text-xs text-gray-400 italic">+ {features.length - 3} itens</p>}
                      </div>
                      
                      <div className="mt-auto pt-4 border-t border-gray-100">
                        <div className="flex items-end justify-between mb-4">
                           <div>
                             {combo.old_price && <span className="text-sm text-gray-400 line-through block">De R$ {combo.old_price}</span>}
                             <span className="text-2xl font-bold text-verde-principal">Por R$ {combo.base_price}</span>
                           </div>
                        </div>
                        {/* Botão de WhatsApp direto */}
                        <Link 
                           href={`https://wa.me/5545000000000?text=Olá, quero saber mais sobre o combo: ${translation.title}`}
                           target="_blank"
                           className="w-full bg-verde-principal text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-verde-secundario transition-colors shadow-lg shadow-verde-principal/20"
                        >
                           Reservar Combo <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                 </div>
               )
            })}
          </div>
        )}
      </div>
    </div>
  );
}