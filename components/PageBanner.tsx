// components/PageBanner.tsx
import React from 'react';
import Image from 'next/image';

interface PageBannerProps {
  title: string;
  subtitle?: string;
  image: string; // URL da imagem
}

export const PageBanner: React.FC<PageBannerProps> = ({ title, subtitle, image }) => {
  return (
    <section className="relative h-[300px] md:h-[400px] flex items-center justify-center mb-12">
      {/* Imagem de Fundo */}
      <div className="absolute inset-0 z-0">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          priority
        />
        {/* Overlay escuro para melhorar leitura do texto */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30" />
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-white font-serif mb-4 drop-shadow-lg">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto drop-shadow-md">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
};