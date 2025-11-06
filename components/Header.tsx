// components/Header.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Menu, X, MapPin, Phone } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Locale } from '@/i18n/dictionaries';
import { SiteLogo } from './SiteLogo';

interface HeaderProps {
  onCartClick: () => void;
  lang: Locale;
  navText: any;
}

export const Header: React.FC<HeaderProps> = ({ onCartClick, lang, navText: t }) => {
  const { items } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const languages = [
    { code: 'pt_BR' as const, label: 'BR' },
    { code: 'en_US' as const, label: 'EN' },
    { code: 'es_ES' as const, label: 'ES' }
  ];

  const getLocalizedPath = (locale: Locale) => {
    if (!pathname) return `/${locale}`;
    const segments = pathname.split('/');
    if (segments.length > 1 && ['pt-BR', 'en-US', 'es-ES'].includes(segments[1])) {
      segments[1] = locale;
      return segments.join('/');
    }
    return `/${locale}${pathname}`;
  };

  const navLinks = [
    { href: `/${lang}`, label: t?.home || 'Início' },
    { href: `/${lang}/tours`, label: t?.products || 'Passeios' },
    { href: `/${lang}/combos`, label: t?.combos || 'Combos' },
    { href: `/${lang}/blog`, label: t?.blog || 'Dicas' },
    { href: `/${lang}/about`, label: t?.about || 'Sobre' },
    { href: `/${lang}/contact`, label: t?.contact || 'Contato' },
  ];

  const isActive = (path: string) => {
      if (path === `/${lang}` && pathname === `/${lang}`) return true;
      if (path !== `/${lang}` && pathname?.startsWith(path)) return true;
      return false;
  }

  return (
    <>
      {/* Barra Superior Vibrante */}
      <div className="bg-gradient-to-r from-azul-profundo to-azul-vibrante text-white py-2.5 px-4 text-xs font-medium hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
             <span className="flex items-center gap-2">
               <MapPin className="w-4 h-4 text-amarelo-sol" /> {/* Ícone amarelo para destaque */}
               Foz do Iguaçu, Brasil
             </span>
             <span className="flex items-center gap-2">
               <Phone className="w-4 h-4 text-amarelo-sol" />
               +55 45 9999-9999
             </span>
          </div>
          <div className="flex items-center space-x-1 bg-azul-profundo/30 rounded-lg p-1">
            {languages.map(l => (
               <Link 
                 key={l.code} 
                 href={getLocalizedPath(l.code)} 
                 className={`px-3 py-1 rounded-md transition-all ${lang === l.code ? 'bg-white text-azul-profundo font-bold shadow-sm' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
               >
                 {l.label}
               </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Header Principal */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-3' : 'bg-white py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          
          <SiteLogo lang={lang} className={`transition-all duration-300 ${scrolled ? 'w-36' : 'w-44 md:w-52'}`} />

          {/* Nav Desktop */}
          <nav className="hidden lg:flex items-center gap-1 bg-gray-50 p-1.5 rounded-full border border-gray-100">
            {navLinks.map(link => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
                  isActive(link.href)
                    ? 'bg-azul-vibrante text-white shadow-md' // Link ativo agora é azul vibrante e cheio
                    : 'text-cinza-texto hover:text-azul-vibrante hover:bg-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Ações */}
          <div className="flex items-center gap-3">
            <button
              onClick={onCartClick}
              className={`flex items-center gap-2 px-5 py-3 rounded-full font-bold transition-all duration-300 group shadow-sm hover:shadow-md ${items.length > 0 ? 'bg-verde-destaque text-white' : 'bg-white border-2 border-gray-100 text-cinza-texto hover:border-verde-destaque hover:text-verde-destaque'}`}
            >
              <ShoppingCart className={`w-5 h-5 ${items.length > 0 ? 'animate-bounce-slow' : ''}`} />
              <span className="hidden sm:inline text-sm">Meu Roteiro</span>
              {items.length > 0 && (
                <span className="bg-white text-verde-destaque text-xs font-extrabold rounded-full w-6 h-6 flex items-center justify-center -mr-2 shadow-sm">
                  {items.length}
                </span>
              )}
            </button>

            <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="lg:hidden p-3 text-cinza-texto hover:bg-gray-100 rounded-2xl transition-colors"
                aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-xl p-4 flex flex-col gap-2 animate-in slide-in-from-top-5 h-screen">
            {navLinks.map(link => (
              <Link 
                key={link.href} 
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`p-4 rounded-2xl text-lg font-bold flex items-center justify-between ${isActive(link.href) ? 'bg-azul-vibrante/10 text-azul-vibrante' : 'text-cinza-texto hover:bg-gray-50'}`}
              >
                {link.label}
                {isActive(link.href) && <div className="w-2 h-2 rounded-full bg-azul-vibrante"></div>}
              </Link>
            ))}
             {/* Idiomas Mobile */}
             <div className="grid grid-cols-3 gap-3 mt-auto mb-20 pt-6 border-t border-gray-100">
                {languages.map(l => (
                   <Link 
                     key={l.code} 
                     href={getLocalizedPath(l.code)} 
                     className={`py-3 rounded-xl text-center font-bold border-2 transition-all ${lang === l.code ? 'border-azul-vibrante bg-azul-vibrante/5 text-azul-vibrante' : 'border-gray-100 text-gray-400'}`}
                   >
                     {l.label}
                   </Link>
                ))}
             </div>
          </div>
        )}
      </header>
    </>
  );
};