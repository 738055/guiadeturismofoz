// app/[lang]/about/page.tsx
import React from 'react';
import { Locale, getDictionary } from '@/i18n/dictionaries';
import { MapPin, Heart, Shield } from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase'; // Importe o Supabase
import { Metadata, ResolvingMetadata } from 'next';

// URL padrão para fallback caso o setting falhe
const DEFAULT_ABOUT_BANNER = "https://images.unsplash.com/photo-1580644236847-230616ba3d9e?q=80&w=1920";

// Geração de Metadados de SEO (Servidor)
export async function generateMetadata({
  params: { lang },
}: {
  params: { lang: Locale };
}): Promise<Metadata> {
  const dict = await getDictionary(lang);
  return {
    title: dict.about.title,
    description: dict.about.subtitle,
  };
}

export default async function AboutPage({ params: { lang } }: { params: { lang: Locale } }) {
  const [dict, bannerData] = await Promise.all([
    getDictionary(lang),
    // --- CORREÇÃO APLICADA AQUI ---
    (async () => {
        const { data, error } = await supabase
          .from('site_settings')
          .select('setting_value')
          .eq('setting_key', 'banner_about') 
          .single();
        
        if (error) {
          console.error('Error fetching banner_about:', error);
          return null;
        }
        return data;
    })(),
    // --- FIM DA CORREÇÃO ---
  ]);
  
  const bannerUrl = bannerData?.setting_value || DEFAULT_ABOUT_BANNER;
  const t = dict.about;

  return (
    <div className="bg-white pt-20">
      {/* Banner Institucional - AGORA DINÂMICO */}
      <div className="relative h-[400px]">
        <Image
          src={bannerUrl} // Usa a URL dinâmica ou fallback
          alt="Foz do Iguaçu"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/40 flex items-center justify-center">
           <div className="text-center text-white px-4">
             <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4">{t.title}</h1>
             <p className="text-xl max-w-2xl mx-auto">{t.subtitle}</p>
           </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Missão */}
        <div className="text-center mb-20">
          <h2 className="text-3xl font-bold text-verde-principal mb-6">{t.mission}</h2>
          <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
            "{t.missionText}"
          </p>
        </div>

        {/* Diferenciais em Grid */}
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">{t.whyUs}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="text-center p-8 bg-gray-50 rounded-2xl hover:shadow-md transition-shadow">
            <div className="inline-flex p-4 bg-verde-principal/10 rounded-full text-verde-principal mb-6">
              <MapPin className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">{t.reason1Title}</h3>
            <p className="text-gray-600 leading-relaxed">{t.reason1Text}</p>
          </div>
          <div className="text-center p-8 bg-gray-50 rounded-2xl hover:shadow-md transition-shadow">
             <div className="inline-flex p-4 bg-azul-foz/10 rounded-full text-azul-foz mb-6">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">{t.reason2Title}</h3>
            <p className="text-gray-600 leading-relaxed">{t.reason2Text}</p>
          </div>
          <div className="text-center p-8 bg-gray-50 rounded-2xl hover:shadow-md transition-shadow">
             <div className="inline-flex p-4 bg-acento-dourado/10 rounded-full text-acento-dourado mb-6">
              <Shield className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">{t.reason3Title}</h3>
            <p className="text-gray-600 leading-relaxed">{t.reason3Text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}