import React from 'react';
import { Star, ExternalLink } from 'lucide-react';

// Server Component. Recebe 'dict' como prop.
interface TripAdvisorProps {
  dict: {
    title: string;
    viewMore: string;
  };
}

export const TripAdvisor: React.FC<TripAdvisorProps> = ({ dict: t }) => {
  // Dados mockados (como no seu original)
  const reviews = [
    {
      author: "Maria Silva",
      rating: 5,
      text: "Experiência incrível! A equipe da Araucária Turismo foi muito atenciosa e profissional. Passeios maravilhosos!",
      date: "2024-03"
    },
    {
      author: "John Smith",
      rating: 5,
      text: "Amazing tours! Great value for money and excellent service. Highly recommended for anyone visiting Foz do Iguaçu.",
      date: "2024-02"
    },
    {
      author: "Carlos Rodríguez",
      rating: 5,
      text: "Excelente servicio y tours muy bien organizados. La mejor opción para conocer Foz de Iguazú.",
      date: "2024-02"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-4xl font-bold text-verde-principal mb-4 font-serif"
          >
            {t.title}
          </h2>
          <div className="flex items-center justify-center space-x-2 mb-2" aria-label="5 de 5 estrelas">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-8 h-8 fill-acento-dourado text-acento-dourado" />
            ))}
          </div>
          <p className="text-gray-600">Baseado em 500+ avaliações</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {reviews.map((review, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-1 mb-3">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-acento-dourado text-acento-dourado" />
                ))}
              </div>
              <blockquote className="text-gray-700 mb-4 leading-relaxed">
                "{review.text}"
              </blockquote>
              <div className="flex items-center justify-between text-sm">
                <cite className="font-semibold text-gray-800 not-italic">{review.author}</cite>
                <span className="text-gray-500">{review.date}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <a
            href="https://www.tripadvisor.com" // Link para seu TripAdvisor
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-verde-principal text-white px-8 py-3 rounded-lg font-semibold hover:bg-verde-secundario transition-colors"
          >
            <span>{t.viewMore}</span>
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
};