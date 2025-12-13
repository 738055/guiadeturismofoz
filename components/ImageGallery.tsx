'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, MapPin, Maximize2 } from 'lucide-react';

interface ImageGalleryProps {
  images: { image_url: string; alt_text?: string }[];
  title: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, title }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Se não houver imagens, mostra placeholder
  if (!images || images.length === 0) {
    return (
      <div className="relative h-96 rounded-2xl overflow-hidden mb-4 bg-gray-200 flex items-center justify-center">
        <MapPin className="w-24 h-24 text-gray-400 opacity-50" />
      </div>
    );
  }

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      {/* Grade de Imagens na Página */}
      <div>
        {/* Imagem Principal (Capa) */}
        <div 
          className="relative h-96 rounded-2xl overflow-hidden mb-4 bg-gray-100 cursor-pointer group"
          onClick={() => openLightbox(0)}
        >
          <Image
            src={images[0].image_url}
            alt={images[0].alt_text || title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
             <Maximize2 className="text-white opacity-0 group-hover:opacity-100 w-10 h-10 drop-shadow-lg transition-opacity" />
          </div>
        </div>

        {/* Miniaturas */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {images.slice(1, 5).map((image, index) => (
              <div 
                key={index} 
                className="relative h-24 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openLightbox(index + 1)}
              >
                <Image
                  src={image.image_url}
                  alt={image.alt_text || `${title} ${index + 2}`}
                  fill
                  className="object-cover"
                  sizes="20vw"
                />
                {/* Se houver mais de 5 imagens, mostra indicador na última */}
                {index === 3 && images.length > 5 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-lg">
                    +{images.length - 5}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Lightbox */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 z-50 bg-black/20 rounded-full"
          >
            <X className="w-8 h-8" />
          </button>

          <button 
            onClick={prevImage}
            className="absolute left-4 text-white hover:text-gray-300 p-2 z-50 bg-black/20 rounded-full"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>

          <div className="relative w-full h-full max-w-7xl max-h-[85vh] flex items-center justify-center">
            <Image
              src={images[currentIndex].image_url}
              alt={images[currentIndex].alt_text || title}
              fill
              className="object-contain"
              sizes="100vw"
              quality={100}
            />
          </div>

          <button 
            onClick={nextImage}
            className="absolute right-4 text-white hover:text-gray-300 p-2 z-50 bg-black/20 rounded-full"
          >
            <ChevronRight className="w-10 h-10" />
          </button>

          <div className="absolute bottom-4 text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
};