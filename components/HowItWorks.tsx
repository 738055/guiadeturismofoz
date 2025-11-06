import React from 'react';
import { Calendar, Route, MessageCircle } from 'lucide-react';

// Este é um Server Component. Recebe 'dict' como prop.
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
  const steps = [
    {
      icon: Calendar,
      title: t.step1Title,
      description: t.step1Desc,
      color: 'from-verde-principal to-verde-secundario'
    },
    {
      icon: Route,
      title: t.step2Title,
      description: t.step2Desc,
      color: 'from-verde-secundario to-acento-dourado'
    },
    {
      icon: MessageCircle,
      title: t.step3Title,
      description: t.step3Desc,
      color: 'from-acento-dourado to-verde-principal'
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
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${step.color} mb-6 transform group-hover:scale-110 transition-transform`}>
                  <step.icon className="w-10 h-10 text-white" />
                </div>

                {/* Número do passo (background) */}
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 text-8xl font-bold text-gray-100 -z-10 hidden md:block" aria-hidden="true">
                  {index + 1}
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {step.title}
                </h3>

                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Linha conectora (Desktop) */}
              {index < steps.length - 1 && (
                <div 
                  className="hidden md:block absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-gray-200 via-acento-dourado to-gray-200 -z-20" 
                  style={{ transform: 'translateX(50%)' }}
                  aria-hidden="true"
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};