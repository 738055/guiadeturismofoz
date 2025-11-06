// components/HowItWorks.tsx
import React from 'react';
import { Calendar, Route, MessageCircle } from 'lucide-react';

interface HowItWorksProps {
  dict: {
    title: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
  };
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ dict: t }) => {
  // GUARDA DE SEGURANÇA: Se as traduções não chegarem, não renderiza nada.
  if (!t) return null;

  const steps = [
    {
      icon: Calendar,
      title: t.step1Title,
      description: t.step1Desc,
      color: 'from-verde-principal to-azul-foz' // Atualizei para as novas cores
    },
    {
      icon: Route,
      title: t.step2Title,
      description: t.step2Desc,
      color: 'from-azul-foz to-verde-secundario' // Atualizei para as novas cores
    },
    {
      icon: MessageCircle,
      title: t.step3Title,
      description: t.step3Desc,
      color: 'from-verde-secundario to-acento-dourado' // Atualizei para as novas cores
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          className="text-3xl md:text-4xl font-bold text-center text-verde-principal mb-16 font-serif"
        >
          {t.title}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all shadow-lg`}>
                  <step.icon className="w-10 h-10 text-white" />
                </div>

                {/* Número do passo (background) */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-9xl font-black text-gray-50 -z-10 hidden md:block select-none" aria-hidden="true">
                  {index + 1}
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-3 relative">
                  {step.title}
                </h3>

                <p className="text-gray-600 leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>

              {/* Seta conectora (Desktop) - exceto no último item */}
              {index < steps.length - 1 && (
                <div 
                  className="hidden md:block absolute top-10 -right-4 w-24 h-0.5 text-gray-300 -z-20" 
                  aria-hidden="true"
                >
                   <svg className="w-full text-gray-200" viewBox="0 0 100 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <path d="M0 10 H100" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6"/>
                     <path d="M95 5 L100 10 L95 15" stroke="currentColor" strokeWidth="2"/>
                   </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};