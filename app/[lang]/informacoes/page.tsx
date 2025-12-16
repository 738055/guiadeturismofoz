import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Locale, getDictionary } from '@/i18n/dictionaries';
import { Calendar, ChevronRight } from 'lucide-react';

export const revalidate = 60; // Revalida a cada 60 segundos (ISR)

async function getPosts(lang: Locale) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id, image_url, created_at,
      post_translations!inner (
        title, slug, excerpt
      )
    `)
    .eq('is_active', true)
    .eq('post_translations.language_code', lang)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Erro ao buscar posts:", error);
    return [];
  }
  return data;
}

export default async function InformacoesPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dict = await getDictionary(lang);
  const posts = await getPosts(lang);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Section */}
      <div className="bg-verde-principal text-white py-20 px-4">
         <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4">{dict.blog.title}</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">{dict.blog.subtitle}</p>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        {posts.length === 0 ? (
           <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <p className="text-gray-500 text-lg">{dict.blog.noPosts}</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post: any) => {
              const translation = post.post_translations[0];
              return (
                <Link 
                  href={`/${lang}/informacoes/${translation.slug}`} 
                  key={post.id}
                  className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="relative h-48 w-full bg-gray-200">
                    {post.image_url ? (
                      <Image 
                        src={post.image_url} 
                        alt={translation.title} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">Sem imagem</div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center text-xs text-gray-500 mb-3">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(post.created_at).toLocaleDateString(lang)}
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-verde-principal transition-colors line-clamp-2">
                      {translation.title}
                    </h2>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {translation.excerpt}
                    </p>
                    <span className="inline-flex items-center text-verde-principal font-bold text-sm">
                      {dict.common.readMore} <ChevronRight className="w-4 h-4 ml-1" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}