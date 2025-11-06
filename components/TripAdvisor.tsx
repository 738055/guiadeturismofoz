// components/TripAdvisor.tsx
import React from 'react';
import { Star, ExternalLink } from 'lucide-react';

interface TripAdvisorProps {
  dict: {
    title: string;
    viewMore: string;
  };
}

export const TripAdvisor: React.FC<TripAdvisorProps> = ({ dict: t }) => {
  // GUARDA DE SEGURANÇA: Se as traduções não chegarem, não renderiza nada.
  if (!t) return null;

  // Dados mockados (idealmente viriam de uma API ou CMS no futuro)
  const reviews = [
    {
      author: "Maria Silva",
      rating: 5,
      text: "Experiência incrível! A equipe da Guia de Turismo Foz foi muito atenciosa e profissional. Passeios maravilhosos!",
      date: "Março 2024"
    },
    {
      author: "John Smith",
      rating: 5,
      text: "Amazing tours! Great value for money and excellent service. Highly recommended for anyone visiting Foz do Iguaçu.",
      date: "February 2024"
    },
    {
      author: "Carlos Rodríguez",
      rating: 5,
      text: "Excelente servicio y tours muy bien organizados. La mejor opción para conocer Foz de Iguazú.",
      date: "Febrero 2024"
    }
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
           {/* Ícone do TripAdvisor (simulado com texto/cor para evitar problemas de imagem por enquanto) */}
           <div className="inline-flex items-center justify-center mb-4">
              <span className="bg-[#00AA6C] text-white px-3 py-1 rounded-full font-bold text-sm flex items-center gap-2">
                 <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <span className="text-[#00AA6C] text-xs">TA</span>
                 </div>
                 Tripadvisor
              </span>
           </div>
          <h2 className="text-3xl md:text-4xl font-bold text-verde-principal mb-6 font-serif">
            {t.title}
          </h2>
          <div className="flex items-center justify-center gap-1 mb-4" aria-label="5 de 5 estrelas">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-[#00AA6C] text-[#00AA6C]" />
            ))}
          </div>
          <p className="text-gray-600 font-medium">Excelência comprovada por milhares de viajantes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {reviews.map((review, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all relative">
              {/* Aspas decorativas */}
              <div className="absolute top-4 right-6 text-6xl text-gray-100 font-serif leading-none -z-0">”</div>
              
              <div className="flex items-center space-x-1 mb-4 relative z-10">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#00AA6C] text-[#00AA6C]" />
                ))}
              </div>
              <blockquote className="text-gray-700 mb-6 leading-relaxed relative z-10 min-h-[80px]">
                "{review.text}"
              </blockquote>
              <div className="flex items-center justify-between text-sm border-t border-gray-50 pt-4">
                <cite className="font-bold text-gray-900 not-italic">{review.author}</cite>
                <span className="text-gray-400 text-xs">{review.date}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <a
            href="https://www.tripadvisor.com.br/" // Substitua pelo seu link real do TripAdvisor
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-gray-800 px-8 py-4 rounded-full font-bold border-2 border-gray-200 hover:border-[#00AA6C] hover:text-[#00AA6C] transition-all group"
          >
            <span>{t.viewMore}</span>
            <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
};