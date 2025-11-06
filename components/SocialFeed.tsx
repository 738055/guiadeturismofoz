// components/SocialFeed.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Locale } from '@/i18n/dictionaries';
import { Instagram, PlayCircle } from 'lucide-react';

interface SocialFeedProps {
  dict: any;
  lang: Locale;
}

export const SocialFeed: React.FC<SocialFeedProps> = ({ dict: t }) => {
  if (!t) return null;

  // Dados mockados de posts (idealmente viriam de uma API real do Instagram/TikTok)
  const posts = [
    {
      id: '1',
      type: 'video', // ou 'image'
      thumbnail: 'https://images.unsplash.com/photo-1599863266589-7f3295837ff2?q=80&w=1000&auto=format&fit=crop', // Aventura
      link: 'https://www.instagram.com/p/CxaD_1KOfs_/', // Link para o reel real
    },
    {
      id: '2',
      type: 'image',
      thumbnail: 'https://images.unsplash.com/photo-1579248443306-0373467c6999?q=80&w=1000&auto=format&fit=crop', // Vista das Cataratas
      link: 'https://www.instagram.com/p/CyU4gR4OxN_/',
    },
    {
      id: '3',
      type: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1563853613095-25e2d63f01c3?q=80&w=1000&auto=format&fit=crop', // Comida local
      link: 'https://www.tiktok.com/@guiadeturismofoz/video/123456789',
    },
    {
      id: '4',
      type: 'image',
      thumbnail: 'https://images.unsplash.com/photo-1628045934446-24a919018e6e?q=80&w=1000&auto=format&fit=crop', // Itaipu à noite
      link: 'https://www.instagram.com/p/C0Z2d0LdEa_/',
    },
    {
      id: '5',
      type: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1594957962638-e6b3b27b4096?q=80&w=1000&auto=format&fit=crop', // Pôr do sol
      link: 'https://www.tiktok.com/@guiadeturismofoz/video/987654321',
    },
    {
      id: '6',
      type: 'image',
      thumbnail: 'https://images.unsplash.com/photo-1588636402447-0205886e963b?q=80&w=1000&auto=format&fit=crop', // Marco das 3 fronteiras
      link: 'https://www.instagram.com/p/C1X-b0Fds_q/',
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-verde-principal mb-4 font-serif">
            {t.title}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {posts.map((post) => (
            <a
              key={post.id}
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square rounded-xl overflow-hidden group shadow-sm hover:shadow-md transform hover:-translate-y-1 transition-all duration-300"
            >
              <Image
                src={post.thumbnail}
                alt={`Post ${post.id}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                {post.type === 'video' ? (
                  <PlayCircle className="w-12 h-12 text-white/90 group-hover:text-white transition-all opacity-80 group-hover:opacity-100 scale-90 group-hover:scale-100" />
                ) : (
                  <Instagram className="w-10 h-10 text-white/70 group-hover:text-white transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100" />
                )}
              </div>
            </a>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="https://www.instagram.com/guiadeturismofoz" // Substitua pelo seu Instagram real
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-acento-dourado to-yellow-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-lg hover:from-yellow-500 hover:to-acento-dourado transition-all transform active:scale-95"
          >
            <Instagram className="w-6 h-6" />
            <span>{t.followUs}</span>
          </Link>
        </div>
      </div>
    </section>
  );
};