'use client'; // Usa Link e props do layout cliente

import React from 'react';
import Link from 'next/link';
import { MapPin, Mail, Phone, Facebook, Instagram, Twitter } from 'lucide-react';
import { Locale } from '@/i18n/dictionaries';

interface FooterProps {
  lang: Locale;
  footerText: {
    description: string;
    contact: string;
    rights: string;
    tours: string;
  };
}

export const Footer: React.FC<FooterProps> = ({ lang, footerText: t }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-verde-principal text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo e Descrição */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                {/* Ícone do Logo */}
                <svg className="w-6 h-6 text-verde-principal" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 90 L50 60 M50 60 Q 30 50 20 45 M50 60 Q 70 50 80 45 M50 50 Q 35 40 25 35 M50 50 Q 65 40 75 35 M50 40 Q 40 30 30 25 M50 40 Q 60 30 70 25" stroke="currentColor" strokeWidth="5" fill="none" />
                  <circle cx="50" cy="20" r="15" fill="currentColor" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold font-serif">
                  ARAUCÁRIA
                </h3>
                <p className="text-xs text-acento-dourado tracking-wider">TURISMO RECEPTIVO</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4 leading-relaxed">
              {t.description}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors" aria-label="Facebook">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors" aria-label="Instagram">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors" aria-label="Twitter">
                <Twitter className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Links de Passeios */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t.tours}</h4>
            <ul className="space-y-2 text-gray-300">
              <li><Link href={`/${lang}/tours`} className="hover:text-white transition-colors">Aventura</Link></li>
              <li><Link href={`/${lang}/tours`} className="hover:text-white transition-colors">Natureza</Link></li>
              <li><Link href={`/${lang}/tours`} className="hover:text-white transition-colors">Compras</Link></li>
              <li><Link href={`/${lang}/tours`} className="hover:text-white transition-colors">Cultura</Link></li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t.contact}</h4>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start space-x-2">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>Foz do Iguaçu, PR</span>
              </li>
              <li className="flex items-start space-x-2">
                <Phone className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>+55 45 0000-0000</span>
              </li>
              <li className="flex items-start space-x-2">
                <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>contato@araucaria.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-verde-secundario pt-8 text-center text-gray-300 text-sm">
          <p>© {currentYear} Araucária Turismo Receptivo. {t.rights}</p>
        </div>
      </div>
    </footer>
  );
};