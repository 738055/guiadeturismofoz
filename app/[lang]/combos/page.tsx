// app/[lang]/combos/page.tsx
import React from 'react';
import { Locale, getDictionary } from '@/i18n/dictionaries';
import { PageBanner } from '@/components/PageBanner';
import { Package, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';

// Geração de Metadados de SEO (Servidor)
export async function generateMetadata({
  params: { lang },
}: {
  params: { lang: Locale };
}): Promise<Metadata> {
  const dict = await getDictionary(lang);
  return {
    title: dict.combos.title,
    description: dict.combos.subtitle,
  };
}

// NOVO: A página se torna um componente de servidor assíncrono
export default async function CombosPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dict = await getDictionary(lang);
  const t = dict.combos;

  // 1. Busca a URL do Banner
  const { data: bannerData } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'banner_combos')
      .single();

  const bannerUrl = bannerData?.setting_value || "/54.jpg";

  // TODO: Adicionar lógica para buscar os Combos
  const combos = []; // Mock: Nenhuma lógica de combos foi implementada ainda

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <PageBanner 
        title={t.title} 
        subtitle={t.subtitle}
        image={bannerUrl} // Usa a URL buscada
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200 shadow-sm">
          <div className="bg-gray-50 p-6 rounded-full mb-6">
             <Package className="w-16 h-16 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">Ops!</h3>
          <p className="text-gray-500 text-lg">{t.noCombos}</p>
        </div>
      </div>
    </div>
  );
}