// components/CartModal.tsx
'use client'; // Usa hooks (useState, useCart)

import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { X, Trash2, ShoppingCart, MessageCircle, User, Hotel, Phone, Mail } from 'lucide-react'; // Ícones adicionados
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
    name: string;      // Titular
    hotel: string;     // Hotel (NOVO)
    contact: string;   // Contato (NOVO)
    email: string;     // Email
    total: string;
    checkoutWhatsapp: string;
    required: string;
    subtotal: string;
    notes: string;     // Observações (NOVO)
  };
}

export const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, cartText: t }) => {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  
  // Novos estados para o formulário de checkout
  const [customerName, setCustomerName] = useState('');
  const [customerHotel, setCustomerHotel] = useState('');
  const [customerContact, setCustomerContact] = useState(''); // WhatsApp/Telefone
  const [customerEmail, setCustomerEmail] = useState('');
  
  // Estado para controlar a visualização do formulário
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);

  if (!isOpen) return null;

  // Lógica para formatação da mensagem completa
  const handleCheckout = () => {
    if (!customerName || !customerHotel || !customerContact || !customerEmail) {
      alert(t.required);
      return;
    }

    let message = `*SOLICITAÇÃO DE RESERVA* - Guia de Turismo Foz ☂️\n\n`;
    message += `*CLIENTE:*\n`;
    message += `  👤 ${t.name}: ${customerName}\n`;
    message += `  🏨 ${t.hotel}: ${customerHotel}\n`;
    message += `  📞 ${t.contact}: ${customerContact}\n`;
    message += `  📧 ${t.email}: ${customerEmail}\n\n`;
    
    message += `*DETALHES DO ROTEIRO:*\n`;

    items.forEach((item, index) => {
      message += `---------------------------------\n`;
      message += `${index + 1}. *${item.tourTitle}*\n`;
      message += `   - ${t.date}: ${format(new Date(item.date), 'dd/MM/yyyy')}\n`;
      message += `   - ${t.adults}: ${item.adults} x R$ ${item.price.toFixed(2)}\n`;
      if (item.children > 0) {
        message += `   - ${t.children}: ${item.children} x R$ ${(item.price * 0.5).toFixed(2)}\n`;
      }
      if (item.notes) { // Inclui observações, se existirem
         message += `   - ${t.notes}: ${item.notes}\n`;
      }
      message += `   - *${t.subtotal}: R$ ${item.subtotal.toFixed(2)}*\n`;
    });
    
    message += `---------------------------------\n`;
    message += `*VALOR ESTIMADO: R$ ${total.toFixed(2)}*\n\n`;
    message += `*Por favor, confirme a disponibilidade e o valor final. Aguardamos a resposta!*`;

    // Lembre-se de pegar o número do .env
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5545999999999';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    
    // Abrir o WhatsApp
    window.open(whatsappUrl, '_blank');

    // Limpar e fechar a modal
    clearCart();
    setCustomerName('');
    setCustomerHotel('');
    setCustomerContact('');
    setCustomerEmail('');
    setShowCheckoutForm(false);
    onClose();
  };

  // --- COMPONENTE DE CHECKOUT FORM ---
  const CheckoutForm = () => (
    <div className="p-6 border-t bg-gray-50">
        <h4 className="text-xl font-bold text-verde-principal mb-4">Finalizar Reserva</h4>
        
        <div className="space-y-4 mb-6">
            {/* Nome do Titular */}
            <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder={t.name}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent"
                    required
                />
            </div>
            {/* Hotel */}
             <div className="relative">
                <Hotel className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder={t.hotel}
                    value={customerHotel}
                    onChange={(e) => setCustomerHotel(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent"
                    required
                />
            </div>
            {/* Contato (WhatsApp) */}
            <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="tel"
                    placeholder={t.contact}
                    value={customerContact}
                    onChange={(e) => setCustomerContact(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent"
                    required
                />
            </div>
            {/* Email */}
            <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="email"
                    placeholder={t.email}
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent"
                    required
                />
            </div>
        </div>

        <button
            onClick={handleCheckout}
            className="w-full bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white py-4 rounded-lg font-semibold text-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2"
        >
            <MessageCircle className="w-5 h-5" />
            <span>{t.checkoutWhatsapp}</span>
        </button>
         <button 
            onClick={() => setShowCheckoutForm(false)}
            className="w-full text-sm text-gray-500 hover:text-foz-azul-escuro transition-colors font-medium mt-3"
         >
            Voltar ao carrinho
         </button>
    </div>
  );
  // --- FIM DO COMPONENTE DE CHECKOUT FORM ---

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
                    {t.date}: <span className="font-medium">{format(new Date(item.date), 'dd/MM/yyyy')}</span>
                  </p>
                  
                  {/* Observações */}
                  {item.notes && (
                     <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded mb-2 border border-gray-200">
                        <span className="font-bold mr-1">{t.notes}:</span> {item.notes}
                     </div>
                  )}

                  <div className="flex items-center space-x-4 mb-2">
                    {/* Input Adultos */}
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
                    {/* Input Crianças */}
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
              
               {/* Total e Subtotal */}
                <div className="border-t pt-4 mt-6">
                    <div className="flex justify-between items-center text-xl font-bold">
                        <span>{t.total}:</span>
                        <span className="text-verde-principal">R$ {total.toFixed(2)}</span>
                    </div>
                </div>
              
            </div>
          )}
        </div>

        {/* Footer (Botão de Continuar ou Formulário de Checkout) */}
        {items.length > 0 && (
          <>
            {/* Se o formulário não estiver visível, mostra o botão "Continuar" */}
            {!showCheckoutForm && (
                <div className="p-6 border-t bg-gray-50">
                    <button
                        onClick={() => setShowCheckoutForm(true)}
                        className="w-full bg-foz-azul-escuro text-white py-4 rounded-lg font-semibold text-lg hover:bg-foz-azul-claro transition-all flex items-center justify-center space-x-2"
                    >
                        <span>Continuar para Finalizar</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            )}
            
            {/* Se o formulário estiver visível, mostra ele */}
            {showCheckoutForm && (
                <CheckoutForm />
            )}
          </>
        )}
      </div>
    </div>
  );
};