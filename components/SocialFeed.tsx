// components/SocialFeed.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Locale } from '@/i18n/dictionaries';
import { Instagram } from 'lucide-react';

// Ícone do TikTok SVG
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z"/>
  </svg>
);

// --- CONFIGURAÇÃO MANUAL DOS POSTS AQUI ---
// Para adicionar mais, basta copiar e colar um bloco {...}
// No Instagram, o post_id é o código na URL (ex: instagram.com/p/CylcJ71uX_K -> "CylcJ71uX_K")
// No TikTok, o post_id é o número no final da URL
const STATIC_POSTS = [
  {
    id: '1',
    platform: 'tiktok',
    post_id: '7440631559125781815', // ID do Vídeo TikTok
  },
  {
    id: '2',
    platform: 'instagram',
    post_id: 'DEr-mk1OFSB', // ID do Post Instagram (Exemplo)
  },
  {
    id: '3',
    platform: 'tiktok',
    post_id: '7446933020226997510', // Outro ID TikTok
  },
  {
    id: '4',
    platform: 'instagram',
    post_id: 'DJen_Z-NgeM', // ID do Post Instagram (Exemplo)
  },
  {
    id: '5',
    platform: 'instagram',
    post_id: 'C9KZbzyxyUb', // ID do Post Instagram (Exemplo)
  },{
    id: '6',
    platform: 'tiktok',
    post_id: '7446570587717192965', // ID do Post Instagram (Exemplo)
  }
] as const;

interface SocialFeedProps {
  dict: any;
  lang: Locale;
}

export const SocialFeed: React.FC<SocialFeedProps> = ({ dict: t }) => {
  if (!t) return null;

  return (
    <section className="py-20 bg-gray-50 border-t border-gray-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabeçalho */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-sm text-pink-600">
              <Instagram className="w-6 h-6" />
            </div>
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center border border-gray-800 shadow-sm text-white">
              <TikTokIcon className="w-6 h-6" />
            </div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-verde-principal mb-4 font-serif">
            {t.title}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Grid de Vídeos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 justify-items-center mb-12">
          {STATIC_POSTS.map((post) => (
            <div 
              key={post.id} 
              className="relative w-full max-w-[325px] h-[580px] rounded-2xl overflow-hidden border border-gray-200 shadow-xl bg-black hover:border-verde-principal/50 transition-all duration-300"
            >
              {post.platform === 'tiktok' ? (
                /* Embed do TikTok */
                <iframe
                  className="w-full h-full"
                  src={`https://www.tiktok.com/embed/v2/${post.post_id}?lang=pt-BR`}
                  allowFullScreen
                  scrolling="no"
                  allow="encrypted-media;"
                  title={`TikTok video ${post.post_id}`}
                ></iframe>
              ) : (
                /* Embed do Instagram */
                <iframe
                  className="w-full h-full bg-white"
                  src={`https://www.instagram.com/p/${post.post_id}/embed/captioned/`}
                  allowFullScreen
                  scrolling="no"
                  allow="encrypted-media;"
                  title={`Instagram post ${post.post_id}`}
                ></iframe>
              )}
            </div>
          ))}
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in-up delay-200">
          <Link
             href="https://www.instagram.com/guiadeturismo_foz" 
             target="_blank"
             rel="noopener noreferrer"
             className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-bold hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
           >
             <Instagram className="w-5 h-5" />
             <span>Instagram</span>
           </Link>

           <Link
             href="https://www.tiktok.com/@guiadeturismofoz"
             target="_blank"
             rel="noopener noreferrer"
             className="inline-flex items-center space-x-2 bg-black text-white px-8 py-3 rounded-full font-bold hover:shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-1 transition-all duration-300 border border-gray-800"
           >
             <TikTokIcon className="w-5 h-5" />
             <span>TikTok</span>
           </Link>
        </div>

      </div>
    </section>
  );
};