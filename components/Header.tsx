'use client'; // Usa hooks (useState, useCart, usePathname, useParams)

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { ShoppingCart, Menu, X, MapPin } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Locale } from '@/i18n/dictionaries';

interface HeaderProps {
  onCartClick: () => void;
  lang: Locale;
  navText: { // Recebe as traduções como prop
    home: string;
    tours: string;
    about: string;
    contact: string;
  };
}

export const Header: React.FC<HeaderProps> = ({ onCartClick, lang, navText: t }) => {
  const { items } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // CORREÇÃO ESTÁ AQUI
  // usePathname() quando usado dentro de app/[lang] retorna o caminho SEM o lang.
  // Ex: /tours (para a URL .../pt-BR/tours)
  // Ex: / (para a URL .../pt-BR)
  const pathname = usePathname(); 

  const languages = [
    { code: 'pt_BR' as const, label: 'PT', flag: '🇧🇷' },
    { code: 'en_US' as const, label: 'EN', flag: '🇺🇸' },
    { code: 'es_ES' as const, label: 'ES', flag: '🇪🇸' }
  ];

  // --- FUNÇÃO CORRIGIDA ---
  // Função para trocar o locale na URL, mantendo o resto do caminho
  const getLocalizedPath = (locale: Locale) => {
    if (!pathname) return `/${locale}`;

    // Se estivermos na homepage, o pathname é "/"
    if (pathname === '/') {
      return `/${locale}`;
    }

    // Se estivermos em outra página (ex: /tours),
    // o resultado deve ser /novo-locale/tours
    return `/${locale}${pathname}`;
  };
  // --- FIM DA CORREÇÃO ---

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href={`/${lang}`} className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-verde-principal to-verde-secundario rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-verde-principal font-serif">
                ARAUCÁRIA
              </h1>
              <p className="text-xs text-acento-dourado tracking-wider">TURISMO RECEPTIVO</p>
            </div>
          </Link>

          {/* Navegação Principal (Desktop) */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href={`/${lang}`} className="text-gray-700 hover:text-verde-principal transition-colors font-medium">
              {t.home}
            </Link>
            <Link href={`/${lang}/tours`} className="text-gray-700 hover:text-verde-principal transition-colors font-medium">
              {t.tours}
            </Link>
            <Link href={`/${lang}/about`} className="text-gray-700 hover:text-verde-principal transition-colors font-medium">
              {t.about}
            </Link>
            <Link href={`/${lang}/contact`} className="text-gray-700 hover:text-verde-principal transition-colors font-medium">
              {t.contact}
            </Link>
          </nav>

          {/* Ações (Idiomas, Carrinho, Menu Mobile) */}
          <div className="flex items-center space-x-4">
            {/* Seletor de Idioma */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              {languages.map(langItem => (
                <Link
                  key={langItem.code}
                  href={getLocalizedPath(langItem.code)} // Agora usa a função corrigida
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    lang === langItem.code
                      ? 'bg-verde-principal text-white'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                  aria-label={`Mudar para ${langItem.label}`}
                >
                  {langItem.label}
                </Link>
              ))}
            </div>

            {/* Botão do Carrinho */}
            <button
              onClick={onCartClick}
              className="relative p-2 text-gray-700 hover:text-verde-principal transition-colors"
              aria-label="Abrir carrinho"
            >
              <ShoppingCart className="w-6 h-6" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-acento-dourado text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </button>

            {/* Botão do Menu Mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Menu Mobile (Dropdown) */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t">
            <Link href={`/${lang}`} className="block py-2 text-gray-700 hover:text-verde-principal" onClick={() => setMobileMenuOpen(false)}>
              {t.home}
            </Link>
            <Link href={`/${lang}/tours`} className="block py-2 text-gray-700 hover:text-verde-principal" onClick={() => setMobileMenuOpen(false)}>
              {t.tours}
            </Link>
            <Link href={`/${lang}/about`} className="block py-2 text-gray-700 hover:text-verde-principal" onClick={() => setMobileMenuOpen(false)}>
              {t.about}
            </Link>
            <Link href={`/${lang}/contact`} className="block py-2 text-gray-700 hover:text-verde-principal" onClick={() => setMobileMenuOpen(false)}>
              {t.contact}
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};