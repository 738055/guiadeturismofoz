// components/SiteLogo.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Locale } from '@/i18n/dictionaries';

interface SiteLogoProps {
  lang: Locale;
  className?: string;
}

export const SiteLogo: React.FC<SiteLogoProps> = ({ lang, className = "w-40 md:w-52" }) => {
  return (
    <Link href={`/${lang}`} className={`relative block shrink-0 transition-transform hover:scale-105 ${className}`}>
      <Image
        src="/logo-guiafoz.png" // Certifique-se que a imagem está em /public/logo-guiafoz.png
        alt="Guia de Turismo Foz"
        width={250}
        height={100}
        className="object-contain w-full h-auto"
        priority
      />
    </Link>
  );
};