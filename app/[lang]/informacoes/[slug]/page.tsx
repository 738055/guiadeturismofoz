import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Locale, getDictionary } from '@/i18n/dictionaries';
import { ArrowLeft, Calendar, User } from 'lucide-react';

export const revalidate = 60;

async function getPostBySlug(slug: string, lang: Locale) {
  const { data, error } = await supabase
    .from('post_translations')
    .select(`
      title, content, excerpt,
      posts!inner (
        id, image_url, created_at, is_active
      )
    `)
    .eq('slug', slug)
    .eq('language_code', lang)
    .eq('posts.is_active', true)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export default async function InformacaoDetalhePage({ params: { lang, slug } }: { params: { lang: Locale, slug: string } }) {
  const dict = await getDictionary(lang);
  const post = await getPostBySlug(slug, lang);

  if (!post) {
    notFound();
  }

  // Correção do erro de build: Tratar post.posts como array ou objeto de forma segura
  // O Supabase pode retornar um array em joins, mesmo sendo relacionamento 1:1 dependendo da inferência
  const postData = Array.isArray(post.posts) ? post.posts[0] : post.posts;

  return (
    <div className="min-h-screen bg-white">
      {/* Banner / Header */}
      <div className="relative h-[40vh] md:h-[50vh] w-full bg-gray-900">
         {postData?.image_url && (
            <Image 
              src={postData.image_url} 
              alt={post.title} 
              fill 
              className="object-cover opacity-60"
              priority
            />
         )}
         <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
               <Link 
                 href={`/${lang}/informacoes`} 
                 className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
               >
                 <ArrowLeft className="w-4 h-4 mr-2" /> {dict.blog.title}
               </Link>
               <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">{post.title}</h1>
               <div className="flex items-center text-white/70 space-x-6 text-sm md:text-base">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {postData?.created_at ? new Date(postData.created_at).toLocaleDateString(lang) : ''}
                  </span>
                  <span className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Guia de Turismo Foz
                  </span>
               </div>
            </div>
         </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="prose prose-lg prose-green max-w-none text-gray-700 leading-relaxed">
          {/* Renderização do conteúdo */}
          <div className="whitespace-pre-wrap font-sans text-lg">
             {post.content}
          </div>
        </article>

        <div className="mt-12 pt-8 border-t flex justify-center">
           <Link 
             href={`/${lang}/contact`} 
             className="bg-verde-principal text-white px-8 py-3 rounded-full font-bold hover:bg-verde-secundario transition-all shadow-lg hover:-translate-y-1"
           >
             {dict.contact.title}
           </Link>
        </div>
      </div>
    </div>
  );
}