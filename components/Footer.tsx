// components/Footer.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Mail, Phone, Facebook, Instagram, Twitter, ShieldCheck, CreditCard, Headphones } from 'lucide-react';
import { Locale } from '@/i18n/dictionaries';
import { SiteLogo } from './SiteLogoCinza'; // 1. Importe o componente SiteLogo

interface FooterProps {
  lang: Locale;
  footerText: any;
}

export const Footer: React.FC<FooterProps> = ({ lang, footerText: t }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Seção de Confiança (Diferencial) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-gray-800">
            <div className="flex items-center gap-4">
                <div className="bg-verde-principal/20 p-3 rounded-full">
                    <ShieldCheck className="w-8 h-8 text-verde-principal" />
                </div>
                <div>
                    <h5 className="text-white font-bold">Compra Segura</h5>
                    <p className="text-sm">Seus dados protegidos sempre</p>
                </div>
            </div>
             <div className="flex items-center gap-4">
                <div className="bg-azul-foz/20 p-3 rounded-full">
                    <CreditCard className="w-8 h-8 text-azul-foz" />
                </div>
                <div>
                    <h5 className="text-white font-bold">Parcele sua viagem</h5>
                    <p className="text-sm">Melhores condições de pagamento</p>
                </div>
            </div>
             <div className="flex items-center gap-4">
                <div className="bg-acento-dourado/20 p-3 rounded-full">
                    <Headphones className="w-8 h-8 text-acento-dourado" />
                </div>
                <div>
                    <h5 className="text-white font-bold">Atendimento Local</h5>
                    <p className="text-sm">Especialistas em Foz te ajudam</p>
                </div>
            </div>
        </div>

        {/* Links Principais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 py-12">
          <div className="col-span-1 md:col-span-2">
            
            {/* --- 2. SUBSTITUA O LOGO DE TEXTO POR ESTE COMPONENTE --- */}
            <SiteLogo lang={lang} className="w-52 mb-6" /> 
            {/* --- FIM DA SUBSTITUIÇÃO --- */}

            <p className="mb-6 max-w-md text-gray-400 leading-relaxed">
              {t.description}
            </p>
            <div className="flex gap-4">
               {/* Ícones sociais */}
               <a href="#" className="bg-gray-800 p-2 rounded-lg hover:bg-verde-principal text-white transition-colors"><Instagram className="w-5 h-5"/></a>
               <a href="#" className="bg-gray-800 p-2 rounded-lg hover:bg-azul-foz text-white transition-colors"><Facebook className="w-5 h-5"/></a>
               <a href="#" className="bg-gray-800 p-2 rounded-lg hover:bg-acento-dourado text-white transition-colors"><Twitter className="w-5 h-5"/></a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">{t.quickLinks}</h4>
            <ul className="space-y-3">
              <li><Link href={`/${lang}/tours`} className="hover:text-verde-secundario transition-colors">Passeios & Ingressos</Link></li>
              <li><Link href={`/${lang}/combos`} className="hover:text-verde-secundario transition-colors">Combos Especiais</Link></li>
              <li><Link href={`/${lang}/blog`} className="hover:text-verde-secundario transition-colors">Dicas de Foz</Link></li>
              <li><Link href={`/${lang}/about`} className="hover:text-verde-secundario transition-colors">Quem Somos</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">{t.contact}</h4>
            <ul className="space-y-4">
               <li className="flex items-start gap-3">
                 <Phone className="w-5 h-5 text-verde-principal flex-shrink-0" />
                 <div>
                    <p className="text-white font-medium">+55 45 9996-4855</p>
                    <p className="text-xs">Seg a Sex: 8h às 18h</p>
                 </div>
               </li>
               <li className="flex items-center gap-3">
                 <Mail className="w-5 h-5 text-azul-foz flex-shrink-0" />
                 <a href="mailto:contato@guiafoz.com" className="hover:text-white transition-colors">contato@guiafoz.com</a>
               </li>
               <li className="flex items-start gap-3">
                 <MapPin className="w-5 h-5 text-acento-dourado flex-shrink-0" />
                 <span className="text-sm">Av. Brasil, 1234 - Centro, Foz do Iguaçu - PR</span>
               </li>
            </ul>
          </div>
        </div>

        {/* Copyright e Selos */}
        <div className="border-t border-gray-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>© {currentYear} Guia de Turismo Foz. {t.rights}. CNPJ: 00.000.000/0001-00</p>
          <div className="flex gap-6 mt-4 md:mt-0">
             <Link href="/termos" className="hover:text-white transition-colors">Termos de Uso</Link>
             <Link href="/privacidade" className="hover:text-white transition-colors">Política de Privacidade</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};