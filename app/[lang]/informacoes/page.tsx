import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Locale, getDictionary } from '@/i18n/dictionaries';
import { Calendar, ChevronRight, Clock, ArrowRight } from 'lucide-react';

export const revalidate = 60; // Revalida a cada 60 segundos

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

  // Separa o post mais recente para destaque (Hero)
  const featuredPost = posts && posts.length > 0 ? posts[0] : null;
  const otherPosts = posts && posts.length > 1 ? posts.slice(1) : [];

  // Função auxiliar para formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(lang, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      
      {/* Header Minimalista Editorial */}
      <div className="pt-32 pb-16 px-4">
         <div className="max-w-7xl mx-auto border-b border-gray-100 pb-8">
            <span className="text-verde-principal font-bold tracking-wider uppercase text-sm mb-2 block">
              Blog & Notícias
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 font-serif tracking-tight">
              {dict.blog.title}
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
              {dict.blog.subtitle}
            </p>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {posts.length === 0 ? (
           <div className="bg-gray-50 rounded-2xl p-16 text-center border border-dashed border-gray-200">
              <p className="text-gray-500 text-lg">{dict.blog.noPosts}</p>
           </div>
        ) : (
          <>
            {/* --- SEÇÃO DE DESTAQUE (HERO POST) --- */}
            {featuredPost && (
              <div className="mb-20">
                 {(() => {
                    const translation = featuredPost.post_translations[0];
                    return (
                      <Link 
                        href={`/${lang}/informacoes/${translation.slug}`} 
                        className="group grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
                      >
                        {/* Imagem do Destaque */}
                        <div className="lg:col-span-8 relative aspect-[16/9] lg:aspect-[21/9] w-full overflow-hidden rounded-3xl">
                           {featuredPost.image_url ? (
                              <Image 
                                src={featuredPost.image_url} 
                                alt={translation.title} 
                                fill 
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                priority
                              />
                           ) : (
                              <div className="bg-gray-100 w-full h-full flex items-center justify-center text-gray-400">Sem imagem</div>
                           )}
                           <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:from-black/10 transition-all" />
                        </div>

                        {/* Texto do Destaque */}
                        <div className="lg:col-span-4 flex flex-col justify-center space-y-4">
                           <div className="flex items-center space-x-2 text-sm text-gray-500 font-medium">
                              <span className="bg-verde-claro/20 text-verde-principal px-3 py-1 rounded-full text-xs uppercase tracking-wide">
                                Destaque
                              </span>
                              <span>•</span>
                              <span className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {formatDate(featuredPost.created_at)}
                              </span>
                           </div>
                           
                           <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight group-hover:text-verde-principal transition-colors font-serif">
                             {translation.title}
                           </h2>
                           
                           <p className="text-gray-600 line-clamp-3 text-lg leading-relaxed">
                             {translation.excerpt}
                           </p>

                           <div className="pt-4">
                             <span className="inline-flex items-center text-gray-900 font-bold border-b-2 border-verde-principal pb-1 group-hover:text-verde-principal transition-all">
                               Ler artigo completo <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                             </span>
                           </div>
                        </div>
                      </Link>
                    );
                 })()}
              </div>
            )}

            {/* --- LISTAGEM SECUNDÁRIA (GRID EDITORIAL) --- */}
            {otherPosts.length > 0 && (
              <>
                <div className="flex items-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900">Últimas Publicações</h3>
                  <div className="h-px bg-gray-200 flex-grow ml-6"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                  {otherPosts.map((post: any) => {
                    const translation = post.post_translations[0];
                    return (
                      <Link 
                        href={`/${lang}/informacoes/${translation.slug}`} 
                        key={post.id}
                        className="group flex flex-col h-full"
                      >
                        {/* Imagem Card */}
                        <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl mb-5 bg-gray-100">
                          {post.image_url ? (
                            <Image 
                              src={post.image_url} 
                              alt={translation.title} 
                              fill 
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">Icon</div>
                          )}
                          {/* Overlay sutil ao passar o mouse */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                        </div>

                        {/* Conteúdo Card */}
                        <div className="flex flex-col flex-grow">
                          <div className="flex items-center text-xs text-gray-500 mb-3 space-x-3">
                            <span className="flex items-center">
                               <Calendar className="w-3 h-3 mr-1 text-verde-principal" />
                               {formatDate(post.created_at)}
                            </span>
                            {/* Opcional: Adicionar tempo de leitura se tiver essa lógica no futuro */}
                            {/* <span>• 5 min leitura</span> */}
                          </div>

                          <h2 className="text-xl font-bold text-gray-900 mb-3 leading-snug group-hover:text-verde-principal transition-colors line-clamp-2">
                            {translation.title}
                          </h2>
                          
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed flex-grow">
                            {translation.excerpt}
                          </p>
                          
                          <span className="inline-flex items-center text-verde-principal font-semibold text-sm group-hover:underline decoration-2 underline-offset-4">
                            {dict.common.readMore} <ChevronRight className="w-4 h-4 ml-1" />
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}