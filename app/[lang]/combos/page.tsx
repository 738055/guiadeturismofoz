// app/[lang]/combos/page.tsx
'use client'; // Transforme em Client Component para usar hooks

import React, { useEffect, useState } from 'react';
import { Locale } from '@/i18n/dictionaries';
import { PageBanner } from '@/components/PageBanner';
import { Package, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function CombosPage({ params: { lang } }: { params: { lang: Locale } }) {
  const [dict, setDict] = useState<any>(null);
  const [bannerUrl, setBannerUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const loadData = async () => {
          setLoading(true);
          try {
              const dictionaryModule = await import(`@/i18n/locales/${lang}.json`);
              setDict(dictionaryModule.default);

              const { data: bannerData } = await supabase
                  .from('site_settings')
                  .select('setting_value')
                  .eq('setting_key', 'banner_combos')
                  .single();

              if (bannerData) setBannerUrl(bannerData.setting_value);
          } catch (e) {
              console.error(e);
          } finally {
              setLoading(false);
          }
      };
      loadData();
  }, [lang]);

  if (loading || !dict) {
       return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-verde-principal" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageBanner 
        title={dict.combos.title} 
        subtitle={dict.combos.subtitle}
        image={bannerUrl || "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1920&auto=format&fit=crop"}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200 shadow-sm">
          <div className="bg-gray-50 p-6 rounded-full mb-6">
             <Package className="w-16 h-16 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">Ops!</h3>
          <p className="text-gray-500 text-lg">{dict.combos.noCombos}</p>
        </div>
      </div>
    </div>
  );
}