'use client'; // Usa hooks (useState, useCart)

import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { X, Trash2, ShoppingCart, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartText: { // Recebe as traduções como prop
    title: string;
    empty: string;
    date: string;
    adults: string;
    children: string;
    name: string;
    email: string;
    total: string;
    checkoutWhatsapp: string;
    required: string;
  };
}

export const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, cartText: t }) => {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  if (!isOpen) return null;

  const handleCheckout = () => {
    if (!customerName || !customerEmail) {
      alert(t.required);
      return;
    }

    let message = `Olá, Araucária Turismo! 🌲\nGostaria de solicitar uma reserva para:\n\n`;
    message += `*Cliente:* ${customerName}\n`;
    message += `*Email:* ${customerEmail}\n\n`;
    message += `*MEU ROTEIRO:*\n`;

    items.forEach((item, index) => {
      message += `${index + 1}. *${item.tourTitle}*\n`;
      // A data já vem como string 'yyyy-MM-dd', precisamos formatá-la
      message += `   - Data: ${format(new Date(item.date), 'dd/MM/yyyy')}\n`;
      message += `   - Pessoas: ${item.adults} adulto(s)`;
      if (item.children > 0) {
        message += ` + ${item.children} criança(s)`;
      }
      message += `\n   - Subtotal: R$ ${item.subtotal.toFixed(2)}\n\n`;
    });

    message += `*TOTAL DO PEDIDO: R$ ${total.toFixed(2)}*\n\n`;
    message += `Aguardo a confirmação e os detalhes para pagamento. Obrigado!`;

    // Lembre-se de pegar o número do .env
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5545000000000';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    clearCart();
    setCustomerName('');
    setCustomerEmail('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

      {/* Painel do Carrinho */}
      <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-6 h-6 text-verde-principal" />
            <h2 className="text-2xl font-bold text-verde-principal">{t.title}</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{t.empty}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={`${item.tourId}-${item.date}`} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-800 flex-1">{item.tourTitle}</h3>
                    <button
                      onClick={() => removeItem(item.tourId, item.date)}
                      className="text-red-500 hover:text-red-700 ml-2"
                      aria-label="Remover item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">
                    {t.date}: {format(new Date(item.date), 'dd/MM/yyyy')}
                  </p>

                  <div className="flex items-center space-x-4 mb-2">
                    <div className="flex items-center space-x-2">
                      <label htmlFor={`adults-${item.tourId}`} className="text-sm text-gray-600">{t.adults}:</label>
                      <input
                        id={`adults-${item.tourId}`}
                        type="number"
                        min="1"
                        value={item.adults}
                        onChange={(e) => updateQuantity(item.tourId, item.date, parseInt(e.target.value) || 1, item.children)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <label htmlFor={`children-${item.tourId}`} className="text-sm text-gray-600">{t.children}:</label>
                      <input
                        id={`children-${item.tourId}`}
                        type="number"
                        min="0"
                        value={item.children}
                        onChange={(e) => updateQuantity(item.tourId, item.date, item.adults, parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                      />
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-verde-principal">R$ {item.subtotal.toFixed(2)}</span>
                  </div>
                </div>
              ))}

              <div className="border-t pt-4 mt-6">
                <div className="space-y-3 mb-4">
                  <input
                    type="text"
                    placeholder={t.name}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent"
                    required
                  />
                  <input
                    type="email"
                    placeholder={t.email}
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex justify-between items-center text-xl font-bold mb-4">
                  <span>{t.total}:</span>
                  <span className="text-verde-principal">R$ {total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t bg-gray-50">
            <button
              onClick={handleCheckout}
              className="w-full bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white py-4 rounded-lg font-semibold text-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{t.checkoutWhatsapp}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};