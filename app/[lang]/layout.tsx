// app/[lang]/layout.tsx
'use client'; // Este layout é cliente pois gerencia o estado do CartModal

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Locale } from '@/i18n/dictionaries';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartModal } from '@/components/CartModal';

// Traduções estáticas para componentes de layout (necessário em Client Components)
// --- CORREÇÃO AQUI: 'subtotal' adicionado ao objeto 'cart' ---
const translations = {
  'pt-BR': {
    nav: { home: 'Início', tours: 'Passeios', about: 'Sobre Nós', contact: 'Contato' },
    footer: {
      description: 'Experiências únicas em Foz do Iguaçu desde 2010.',
      contact: 'Contato',
      rights: 'Todos os direitos reservados',
      tours: 'Passeios'
    },
    cart: {
      title: 'Meu Roteiro',
      empty: 'Seu roteiro está vazio',
      date: 'Data',
      adults: 'Adultos',
      children: 'Crianças',
      subtotal: 'Subtotal', // <-- ADICIONADO
      name: 'Nome',
      email: 'Email',
      total: 'Total',
      checkoutWhatsapp: 'Finalizar Pedido via WhatsApp',
      required: 'Por favor, preencha seu nome e email.'
    }
  },
  'en-US': {
    nav: { home: 'Home', tours: 'Tours', about: 'About Us', contact: 'Contact' },
    footer: {
      description: 'Unique experiences in Foz do Iguaçu since 2010.',
      contact: 'Contact',
      rights: 'All rights reserved',
      tours: 'Tours'
    },
    cart: {
      title: 'My Itinerary',
      empty: 'Your itinerary is empty',
      date: 'Date',
      adults: 'Adults',
      children: 'Children',
      subtotal: 'Subtotal', // <-- ADICIONADO
      name: 'Name',
      email: 'Email',
      total: 'Total',
      checkoutWhatsapp: 'Complete Order via WhatsApp',
      required: 'Please fill in your name and email.'
    }
  },
  'es-ES': {
    nav: { home: 'Inicio', tours: 'Tours', about: 'Sobre Nosotros', contact: 'Contacto' },
    footer: {
      description: 'Experiencias únicas en Foz de Iguazú desde 2010.',
      contact: 'Contacto',
      rights: 'Todos los derechos reservados',
      tours: 'Tours'
    },
    cart: {
      title: 'Mi Itinerario',
      empty: 'Tu itinerario está vacío',
      date: 'Fecha',
      adults: 'Adultos',
      children: 'Niños',
      subtotal: 'Subtotal', // <-- ADICIONADO
      name: 'Nombre',
      email: 'Email',
      total: 'Total',
      checkoutWhatsapp: 'Completar Pedido vía WhatsApp',
      required: 'Por favor, complete su nombre y correo electrónico.'
    }
  },
};

export default function LangLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cartOpen, setCartOpen] = useState(false);
  const params = useParams();
  
  // Garante que o Header receba um locale válido
  const lang = (params.lang || 'pt-BR') as Locale;
  
  // --- CORREÇÃO AQUI: Acessa o fallback com colchetes ['pt-BR'] ---
  const t = translations[lang] || translations['pt-BR'];

  return (
    <>
      <Header 
        onCartClick={() => setCartOpen(true)} 
        lang={lang} 
        navText={t.nav} 
      />
      <main>{children}</main>
      <Footer 
        lang={lang} 
        footerText={t.footer} 
      />
      <CartModal 
        isOpen={cartOpen} 
        onClose={() => setCartOpen(false)} 
        cartText={t.cart}
      />
    </>
  );
}