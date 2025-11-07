// components/ServicesTabs.tsx
'use client';

import React, { useState } from 'react';
import { Users, Car, Info, Settings, CreditCard } from 'lucide-react';

// Interface para as props, agora esperando a estrutura do JSON
interface ServicesTabsProps {
  // A prop 'dict' pode ser opcional ou nula se a chave não existir
  dict?: { 
    title: string;
    tabs: {
      description: string;
      howItWorks: string;
      howToBook: string;
    };
    guide: {
      title: string;
      description: string;
      howItWorks: string;
      howToBook: string;
    };
    private: {
      title: string;
      description: string;
      howItWorks: string;
      howToBook: string;
    };
  };
}

// O tipo para as chaves das abas
type TabId = 'description' | 'howItWorks' | 'howToBook';

export const ServicesTabs: React.FC<ServicesTabsProps> = ({ dict }) => {
  const [activeTabGuia, setActiveTabGuia] = useState<TabId>('description');
  const [activeTabParticular, setActiveTabParticular] = useState<TabId>('description');

  // --- GUARDA DE SEGURANÇA ADICIONADA ---
  // Se a prop 'dict' (ou seja, dict.servicesSection) não for encontrada,
  // o componente simplesmente não renderiza nada, evitando o crash.
  if (!dict) {
    return null;
  }
  // --- FIM DA GUARDA ---

  // Define as abas com base nas traduções
  const tabs = [
    { id: 'description' as TabId, label: dict.tabs.description, icon: Info },
    { id: 'howItWorks' as TabId, label: dict.tabs.howItWorks, icon: Settings },
    { id: 'howToBook' as TabId, label: dict.tabs.howToBook, icon: CreditCard },
  ];

  // Mapeia o conteúdo dinamicamente
  const guiaContent = {
    description: dict.guide.description,
    howItWorks: dict.guide.howItWorks,
    howToBook: dict.guide.howToBook,
  };

  const particularContent = {
    description: dict.private.description,
    howItWorks: dict.private.howItWorks,
    howToBook: dict.private.howToBook,
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-verde-principal mb-16 font-serif">
          {dict.title}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          
          {/* Card 1: Guia para Excursão */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 h-full flex flex-col">
            <div className="flex items-center gap-4 mb-5">
              <div className="bg-verde-principal/10 p-3 rounded-xl text-verde-principal">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-verde-principal font-serif">
                {dict.guide.title}
              </h3>
            </div>
            
            {/* Abas do Guia */}
            <div className="flex gap-2 mb-6 border-b border-gray-100">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabGuia(tab.id)}
                  className={`flex-1 text-sm font-semibold pb-3 border-b-2 transition-all ${
                    activeTabGuia === tab.id
                      ? 'border-verde-principal text-verde-principal'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Conteúdo das Abas do Guia */}
            <div className="text-gray-600 leading-relaxed text-sm flex-grow">
              <p className="whitespace-pre-line">{guiaContent[activeTabGuia]}</p>
            </div>
          </div>

          {/* Card 2: Passeios Particulares */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 h-full flex flex-col">
            <div className="flex items-center gap-4 mb-5">
              <div className="bg-azul-foz/10 p-3 rounded-xl text-azul-foz">
                <Car className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-azul-foz font-serif">
                {dict.private.title}
              </h3>
            </div>
            
            {/* Abas do Particular */}
            <div className="flex gap-2 mb-6 border-b border-gray-100">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabParticular(tab.id)}
                  className={`flex-1 text-sm font-semibold pb-3 border-b-2 transition-all ${
                    activeTabParticular === tab.id
                      ? 'border-azul-foz text-azul-foz'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Conteúdo das Abas do Particular */}
            <div className="text-gray-600 leading-relaxed text-sm flex-grow">
              <p className="whitespace-pre-line">{particularContent[activeTabParticular]}</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};