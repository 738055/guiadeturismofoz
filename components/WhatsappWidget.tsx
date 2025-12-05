// components/WhatsAppWidget.tsx
'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';

export const WhatsAppWidget = () => {
  // Número do .env ou fallback
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5545999648551';
  const defaultMessage = "Olá! Estou no site da Guia de Turismo Foz e gostaria de ajuda.";

  const handleClick = () => {
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#128C7E] text-white p-4 rounded-full shadow-2xl flex items-center justify-center group transition-all duration-300 hover:scale-110 animate-bounce-slow"
      aria-label="Falar no WhatsApp"
    >
      <MessageCircle className="w-8 h-8" />
      <span className="absolute right-full mr-4 bg-white text-gray-800 px-4 py-2 rounded-xl font-bold text-sm shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        Fale conosco agora!
      </span>
    </button>
  );
};