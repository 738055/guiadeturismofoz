// components/Header.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Menu, X, MapPin, Phone, Globe } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Locale } from '@/i18n/dictionaries';
import { SiteLogo } from './SiteLogo';

// Tipagem básica para as props
interface HeaderProps {
  onCartClick: () => void;
  lang: Locale;
  navText?: {
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

  // Lista de rotas que devem ter o header transparente (overlay)
  const transparentRoutes = ['', 'tours', 'combos', 'about'];

  // Verifica se a rota atual deve ser transparente
  const isTransparentPage = () => {
    if (!pathname) return false;
    const segments = pathname.split('/').filter(Boolean);
    // segments[0] é o lang (pt-BR), segments[1] é a página
    const currentPage = segments[1] || ''; 
    return transparentRoutes.includes(currentPage);
  };

  const isTransparent = isTransparentPage();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const languages = [
    { code: 'pt-BR' as const, label: 'BR' },
    { code: 'en-US' as const, label: 'EN' },
    { code: 'es-ES' as const, label: 'ES' }
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
    { href: `/${lang}/informacoes`, label: t?.blog || 'Informações' }, // Link alterado
    { href: `/${lang}/about`, label: t?.about || 'Sobre Nós' },
    { href: `/${lang}/contact`, label: t?.contact || 'Contato' },
  ];

  const isActive = (path: string) => {
      if (path === `/${lang}` && pathname === `/${lang}`) return true;
      if (path !== `/${lang}` && pathname?.startsWith(path)) return true;
      return false;
  }

  // Define o estilo baseado na página e no scroll
  // Se NÃO for página transparente (ex: Contato), força o estilo "scrolled" (fundo branco) sempre.
  const useWhiteStyle = !isTransparent || scrolled;

  return (
    <div 
      className={`
        z-50 transition-all duration-300
        ${isTransparent ? 'fixed top-0 left-0 right-0' : 'sticky top-0 bg-white shadow-sm'}
      `}
    >
      
      {/* Barra Superior */}
      <div 
        className={`
          bg-gradient-to-r from-foz-azul-escuro via-foz-azul-claro to-foz-verde text-white px-4 text-xs font-semibold hidden md:block transition-all duration-500 overflow-hidden
          ${isTransparent && scrolled ? 'max-h-0 opacity-0' : 'max-h-10 py-2 opacity-100'}
        `}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
             <span className="flex items-center gap-2 opacity-90 hover:opacity-100 transition-opacity cursor-default">
               <MapPin className="w-3.5 h-3.5" /> Foz do Iguaçu - Brasil
             </span>
             <a href="https://wa.me/5545999648551" target="_blank" className="flex items-center gap-2 hover:text-foz-amarelo transition-colors">
               <Phone className="w-3.5 h-3.5" /> +55 45 9996-4855
             </a>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 opacity-70" />
              <div className="flex gap-1">
                {languages.map(l => (
                  <Link key={l.code} href={getLocalizedPath(l.code)} className={`px-2 py-0.5 rounded transition-all ${lang === l.code ? 'bg-white text-foz-azul-escuro font-bold' : 'text-white/80 hover:text-white hover:bg-white/20'}`}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header Principal */}
      <header className={`transition-all duration-500 ${
        useWhiteStyle 
          ? 'bg-white/95 backdrop-blur-md shadow-sm py-2' // Estilo Sólido/Scrolled
          : 'bg-transparent py-4 md:py-6' // Estilo Transparente (Topo da Home/Banner)
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          
          {/* Logo */}
          <div className={`transition-all duration-500 drop-shadow-sm ${
            useWhiteStyle 
              ? 'w-24 md:w-36' 
              : 'w-24 md:w-52 md:-my-8'
          }`}>
             <SiteLogo lang={lang} className="w-full h-auto" />
          </div>

          {/* Nav Desktop */}
          <nav className={`hidden lg:flex items-center gap-1 p-1.5 rounded-full border ml-8 transition-all duration-500 ${
            useWhiteStyle
              ? 'bg-white/40 border-white/30 shadow-sm' 
              : 'bg-white/10 backdrop-blur-sm border-white/20 shadow-lg' 
          }`}>
            {navLinks.map(link => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                  isActive(link.href)
                    ? 'bg-foz-azul-escuro text-white shadow-md' // Ativo sempre azul
                    : useWhiteStyle
                        ? 'text-foz-azul-escuro hover:bg-white/60' // Texto escuro em fundo branco
                        : 'text-white hover:text-white hover:bg-white/20' // Texto branco em fundo transparente
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
              className={`relative flex items-center gap-2 px-5 py-3 rounded-full font-bold transition-all duration-300 group ${
                items.length > 0 
                  ? 'bg-foz-amarelo text-foz-azul-escuro shadow-md hover:shadow-lg hover:-translate-y-0.5' 
                  : useWhiteStyle
                      ? 'bg-white/40 border-2 border-white/30 text-foz-azul-escuro hover:bg-white hover:border-white' 
                      : 'bg-white/10 backdrop-blur-md border-2 border-white/20 text-white hover:bg-white hover:text-foz-azul-escuro hover:border-white'
              }`}
            >
              <ShoppingCart className={`w-5 h-5 ${items.length > 0 ? 'animate-bounce-slow' : ''}`} />
              <span className="hidden sm:inline text-sm">Roteiro</span>
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-foz-azul-escuro text-white text-xs font-extrabold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                  {items.length}
                </span>
              )}
            </button>

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className={`lg:hidden p-3 rounded-2xl transition-colors ${
                useWhiteStyle
                  ? 'text-foz-azul-escuro hover:bg-white/30' 
                  : 'text-white hover:bg-white/20'
              }`}
            >
              {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-2xl p-4 flex flex-col h-[calc(100vh-80px)] animate-in slide-in-from-left-full duration-300">
            <div className="flex flex-col gap-2 mt-4">
              {navLinks.map(link => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-4 rounded-2xl text-lg font-bold flex items-center justify-between ${isActive(link.href) ? 'bg-foz-azul-escuro text-white' : 'text-foz-cinza hover:bg-foz-bege'}`}
                >
                  {link.label}
                  {isActive(link.href) && <div className="w-2 h-2 rounded-full bg-foz-amarelo"></div>}
                </Link>
              ))}
            </div>
             <div className="mt-auto mb-8">
               <p className="text-center text-foz-cinza text-sm font-bold mb-4 uppercase tracking-widest opacity-70">Idioma</p>
               <div className="flex justify-center gap-4">
                  {languages.map(l => (
                     <Link key={l.code} href={getLocalizedPath(l.code)} className={`w-16 py-3 rounded-xl text-center font-bold border-2 transition-all ${lang === l.code ? 'border-foz-azul-claro bg-foz-azul-claro/10 text-foz-azul-claro' : 'border-gray-100 text-gray-400'}`}>
                       {l.label}
                     </Link>
                  ))}
               </div>
             </div>
          </div>
        )}
      </header>
    </div>
  );
};