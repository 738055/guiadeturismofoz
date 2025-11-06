// components/Header.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Menu, X, MapPin, Phone } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Locale } from '@/i18n/dictionaries';

interface HeaderProps {
  onCartClick: () => void;
  lang: Locale;
  navText: {
    home: string;
    products: string;
    combos: string;
    blog: string;
    about: string;
    contact: string;
  };
}

export const Header: React.FC<HeaderProps> = ({ onCartClick, lang, navText: t }) => {
  const { items } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
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

  // Lista completa de links
  const navLinks = [
    { href: `/${lang}`, label: t?.home || 'Home' },
    { href: `/${lang}/tours`, label: t?.products || 'Tours' },
    { href: `/${lang}/combos`, label: t?.combos || 'Combos' },
    { href: `/${lang}/blog`, label: t?.blog || 'Blog' },
    { href: `/${lang}/about`, label: t?.about || 'About' },
    { href: `/${lang}/contact`, label: t?.contact || 'Contact' },
  ];

  const isActive = (path: string) => {
      if (path === `/${lang}` && pathname === `/${lang}`) return true;
      if (path !== `/${lang}` && pathname?.startsWith(path)) return true;
      return false;
  }

  return (
    <>
      {/* Barra Superior */}
      <div className="bg-verde-principal text-white py-2 px-4 text-xs hidden md:block transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
             <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Foz do Iguaçu, Brasil</span>
             <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> +55 45 9999-9999</span>
          </div>
          <div className="flex items-center space-x-3">
            {languages.map(l => (
               <Link key={l.code} href={getLocalizedPath(l.code)} className={`font-semibold hover:text-azul-foz transition-colors ${lang === l.code ? 'text-azul-foz' : 'opacity-80'}`}>
                 {l.label}
               </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Header Principal */}
      <header className={`sticky top-0 z-50 transition-all duration-300 border-b ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-3 border-gray-200' : 'bg-white py-5 border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          
          {/* Logo */}
          <Link href={`/${lang}`} className="flex items-center gap-2 group">
            <div className="bg-gradient-to-tr from-verde-principal to-azul-foz p-2.5 rounded-xl shadow-sm transform group-hover:rotate-3 transition-all duration-300">
               <MapPin className="w-7 h-7 text-white" />
            </div>
            <div className="leading-none">
              <h1 className="text-xl font-extrabold text-verde-principal font-serif tracking-tight">GUIA DE TURISMO</h1>
              <p className="text-[10px] font-bold text-azul-foz tracking-[0.35em] uppercase mt-0.5">Foz do Iguaçu</p>
            </div>
          </Link>

          {/* Nav Desktop (CORRIGIDO) */}
          <nav className="hidden lg:flex items-center gap-1 bg-gray-50/80 p-1.5 rounded-full border border-gray-100 backdrop-blur-sm">
            {navLinks.map(link => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                  isActive(link.href)
                    ? 'bg-white text-verde-principal shadow-sm scale-[1.02]' 
                    : 'text-gray-600 hover:text-verde-principal hover:bg-white/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Ações */}
          <div className="flex items-center gap-2 sm:gap-3">
             {/* Botão Carrinho */}
            <button
              onClick={onCartClick}
              className={`flex items-center gap-2 px-3 sm:px-5 py-2.5 rounded-full font-bold transition-all duration-300 group ${items.length > 0 ? 'bg-gradient-to-r from-acento-dourado to-yellow-500 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <ShoppingCart className={`w-5 h-5 ${items.length > 0 ? 'animate-bounce-slow' : ''}`} />
              <span className="hidden sm:inline text-sm">Roteiro</span>
              {items.length > 0 && (
                <span className="bg-white text-acento-dourado text-xs font-extrabold rounded-full w-5 h-5 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </button>

            {/* Mobile Toggle */}
            <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="lg:hidden p-2.5 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-xl p-4 flex flex-col gap-2 animate-in slide-in-from-top-5">
            {navLinks.map(link => (
              <Link 
                key={link.href} 
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`p-4 rounded-2xl text-base font-bold flex items-center justify-between ${isActive(link.href) ? 'bg-verde-principal/5 text-verde-principal' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                {link.label}
                {isActive(link.href) && <div className="w-1.5 h-1.5 rounded-full bg-verde-principal"></div>}
              </Link>
            ))}
             <div className="flex gap-3 pt-4 border-t border-gray-100 mt-2 justify-center">
                {languages.map(l => (
                   <Link 
                     key={l.code} 
                     href={getLocalizedPath(l.code)} 
                     className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${lang === l.code ? 'border-verde-principal bg-verde-principal/5 text-verde-principal' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
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