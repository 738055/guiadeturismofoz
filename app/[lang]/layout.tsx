// app/[lang]/layout.tsx
'use client'; // Este layout é cliente pois gerencia o estado do CartModal

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Locale } from '@/i18n/dictionaries';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartModal } from '@/components/CartModal';

// Traduções estáticas para componentes de layout (necessário em Client Components)
const translations = {
  'pt-BR': {
    // CORREÇÃO: 'tours' alterado para 'products'
    nav: { home: 'Início', products: 'Passeios', combos: 'Combos', blog: 'Dicas', about: 'Sobre Nós', contact: 'Contato' },
    footer: {
      description: 'Especialistas em receptivo em Foz do Iguaçu. Transformando sua viagem em memórias inesquecíveis.',
      quickLinks: 'Links Rápidos',
      contact: 'Contato',
      rights: 'Todos os direitos reservados',
      followUs: 'Siga-nos'
    },
    cart: {
      title: 'Meu Roteiro',
      empty: 'Seu roteiro está vazio',
      date: 'Data',
      adults: 'Adultos',
      children: 'Crianças',
      subtotal: 'Subtotal',
      name: 'Nome do Titular', // <-- NOVO
      hotel: 'Hotel/Hospedagem', // <-- NOVO
      contact: 'Contato (WhatsApp)', // <-- NOVO
      email: 'E-mail',
      notes: 'Observações', // <-- NOVO
      total: 'Total',
      checkoutWhatsapp: 'Finalizar Pedido via WhatsApp',
      required: 'Por favor, preencha todos os campos do formulário para continuarmos.'
    }
  },
  'en-US': {
    // CORREÇÃO: 'tours' alterado para 'products'
    nav: { home: 'Home', products: 'Tours', combos: 'Bundles', blog: 'Tips', about: 'About Us', contact: 'Contact' },
    footer: {
      description: 'Receptive experts in Foz do Iguaçu. Turning your trip into unforgettable memories.',
      quickLinks: 'Quick Links',
      contact: 'Contact',
      rights: 'All rights reserved',
      followUs: 'Follow us'
    },
    cart: {
      title: 'My Itinerary',
      empty: 'Your itinerary is empty',
      date: 'Date',
      adults: 'Adults',
      children: 'Children',
      subtotal: 'Subtotal',
      name: 'Lead Booker Name', // <-- NOVO
      hotel: 'Hotel/Accommodation', // <-- NOVO
      contact: 'Contact (WhatsApp)', // <-- NOVO
      email: 'E-mail',
      notes: 'Notes', // <-- NOVO
      total: 'Total',
      checkoutWhatsapp: 'Complete Order via WhatsApp',
      required: 'Please fill in your details to continue.'
    }
  },
  'es-ES': {
    // CORREÇÃO: 'tours' alterado para 'products'
    nav: { home: 'Inicio', products: 'Paseos', combos: 'Combos', blog: 'Consejos', about: 'Nosotros', contact: 'Contacto' },
    footer: {
      description: 'Expertos en receptivo en Foz de Iguazú. Transformando tu viaje en recuerdos inolvidables.',
      quickLinks: 'Enlaces Rápidos',
      contact: 'Contacto',
      rights: 'Todos los derechos reservados',
      followUs: 'Síguenos'
    },
    cart: {
      title: 'Mi Itinerario',
      empty: 'Tu itinerario está vacío',
      date: 'Fecha',
      adults: 'Adultos',
      children: 'Niños',
      subtotal: 'Subtotal',
      name: 'Nombre del Titular', // <-- NOVO
      hotel: 'Hotel/Hospedaje', // <-- NOVO
      contact: 'Contacto (WhatsApp)', // <-- NOVO
      email: 'E-mail',
      notes: 'Observaciones', // <-- NOVO
      total: 'Total',
      checkoutWhatsapp: 'Solicitar Reserva vía WhatsApp',
      required: 'Por favor, completa tus datos para continuar.'
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
  
  // Acessa o fallback com colchetes ['pt-BR']
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