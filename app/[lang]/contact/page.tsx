// app/[lang]/contact/page.tsx
import React from 'react';
import { Locale, getDictionary } from '@/i18n/dictionaries';
import { Mail, Phone, MapPin } from 'lucide-react';
import { ContactForm } from './ContactForm';

export default async function ContactPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dict = await getDictionary(lang);
  const t = dict.contact;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Informações */}
        <div>
          <span className="text-azul-foz font-bold tracking-wider uppercase mb-2 block">Fale Conosco</span>
          <h1 className="text-4xl md:text-5xl font-bold text-verde-principal mb-6 font-serif">{t.title}</h1>
          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            {t.subtitle}
          </p>

          <div className="space-y-8">
            <div className="flex items-start space-x-5 p-6 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100">
              <div className="bg-verde-principal/10 p-4 rounded-full text-verde-principal">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">WhatsApp / Telefone</h3>
                <p className="text-verde-principal font-semibold text-lg">+55 45 9996-4855</p>
                <p className="text-sm text-gray-500 mt-1">Seg a Sex, 8h às 18h | Sáb 8h às 12h</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-5 p-6 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100">
               <div className="bg-azul-foz/10 p-4 rounded-full text-azul-foz">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">E-mail</h3>
                <a href="mailto:contato@guiafoz.com" className="text-azul-foz font-semibold text-lg hover:underline">contato@guiafoz.com</a>
                <p className="text-sm text-gray-500 mt-1">Respondemos em até 24 horas úteis</p>
              </div>
            </div>

            <div className="flex items-start space-x-5 p-6 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100">
               <div className="bg-acento-dourado/10 p-4 rounded-full text-acento-dourado">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">Nosso Escritório</h3>
                <p className="text-gray-700 leading-relaxed">Av. Brasil, 1234 - Centro<br />Foz do Iguaçu - PR, Brasil<br />CEP: 85851-000</p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-gray-100 sticky top-24">
          <ContactForm dict={t} />
        </div>
      </div>
    </div>
  );
}