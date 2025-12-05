// guiadeturismofoz/app/[lang]/tour/[id]/TourClient.tsx
'use client'; 

import React, { useState, useMemo } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Calendar, User, MessageCircle, ShoppingCart, ArrowRight, Loader2 } from 'lucide-react';
import { format, parseISO, getDay, addDays } from 'date-fns';
import { Locale, Dictionary } from '@/i18n/dictionaries';
// --- CORREÇÃO: Importa os objetos de Locale do date-fns ---
import { Locale as DateFnsLocale } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { enUS } from 'date-fns/locale/en-US';
import { es } from 'date-fns/locale/es'; // Usando 'es' para 'es-ES'

// Mapeamento do nosso Locale string para o objeto Locale do date-fns
const localeMap: Record<Locale, DateFnsLocale> = {
    'pt-BR': ptBR,
    'en-US': enUS,
    'es-ES': es, 
};
// ---------------------------------------------------


// Tipamos as props recebidas do Server Component
interface TourClientProps {
  tour: {
    id: string;
    title: string;
    base_price: number;
    disabled_week_days?: number[]; 
    disabled_specific_dates?: string[];
  };
  availableDates: { available_date: string; total_spots: number; spots_booked: number; }[];
  dict: Dictionary; // Recebe o dicionário completo
  lang: Locale; 
}

export const TourClient: React.FC<TourClientProps> = ({ tour, availableDates, dict, lang }) => { 
  const { addItem } = useCart();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [notes, setNotes] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const t = dict.tours;
  const c = dict.cart;
  const tCommon = dict.common;
  
  // --- LÓGICA DE SELEÇÃO DE LOCALE PARA date-fns ---
  const dateFnsLocale = localeMap[lang];
  // ---------------------------------------------------
  
  // --- LÓGICA DE FILTRO E VISUALIZAÇÃO DE DATAS ---
  const disabledDays = tour.disabled_week_days || [];
  const disabledSpecificDates = tour.disabled_specific_dates || [];
  
  const filteredDates = useMemo(() => {
    return availableDates.filter(avail => {
      try {
        const dateString = avail.available_date;
        const date = parseISO(dateString);
        
        // --- ADIÇÃO DE VALIDAÇÃO DENTRO DO FILTRO ---
        if (isNaN(date.getTime())) {
            return false;
        }
        // ---------------------------------------------
        
        const dayOfWeek = getDay(date); // 0 = Dom
        
        // 1. Filtro de Dia da Semana Recorrente
        if (disabledDays.includes(dayOfWeek)) {
           return false;
        }
        
        // 2. Filtro de Data Específica
        if (disabledSpecificDates.includes(dateString)) {
            return false;
        }
        
        // 3. Filtro de Vagas (se total for 50, e booked for 0, mostra)
        return avail.total_spots > avail.spots_booked;

      } catch (e) {
        return false;
      }
    });
  }, [availableDates, disabledDays, disabledSpecificDates]);
  
  // Simulação de 7 dias de visualização (para o calendário simplificado)
  const previewDates = filteredDates.slice(0, 7);
  const selectedDateObject = filteredDates.find(d => d.available_date === selectedDate);
  const remainingSpots = selectedDateObject ? selectedDateObject.total_spots - selectedDateObject.spots_booked : 0;
  // --- FIM DA LÓGICA DE DATAS ---

  const handleAddToCart = () => {
    if (!selectedDate || adults < 1) {
      alert(t.selectDate);
      return;
    }

    setIsAdding(true);
    
    // Lógica de subtotal (criança paga 0.5)
    const subtotal = tour.base_price * (adults + children * 0.5);

    addItem({
      tourId: tour.id,
      tourTitle: tour.title,
      date: selectedDate, 
      adults,
      children,
      price: tour.base_price,
      subtotal
    });
    
    // Limpa o estado e volta para a primeira etapa após um pequeno delay
    setTimeout(() => {
        setIsAdding(false);
        setStep(1);
        setSelectedDate('');
        setAdults(1);
        setChildren(0);
        setNotes('');
        // Alertando o usuário que o item foi para o carrinho (modal)
        alert('Adicionado ao roteiro!'); 
    }, 500); 
  };
  
  // Valor estimado
  const estimatedTotal = tour.base_price * (adults + children * 0.5);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
      <div className="flex items-center justify-between mb-4 border-b pb-4">
        <h3 className="font-bold text-xl text-foz-azul-escuro font-serif">
          {c.title}
        </h3>
        <div className="flex space-x-2">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step === 1 ? 'bg-verde-principal text-white' : 'bg-gray-100 text-gray-500'}`}>1</span>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step === 2 ? 'bg-verde-principal text-white' : 'bg-gray-100 text-gray-500'}`}>2</span>
        </div>
      </div>

      {/* --- ETAPA 1: Seleção de Data e Quantidade --- */}
      <div className={`${step === 1 ? 'block animate-fade-in-up' : 'hidden'}`}>
        <h4 className="font-semibold text-lg mb-4 flex items-center space-x-2 text-gray-800">
          <Calendar className="w-5 h-5 text-verde-secundario" />
          <span>{t.selectDate}</span>
        </h4>
        
        {/* Simulação de Calendário Estilizado (Carrossel de Datas) */}
        <div className="flex overflow-x-auto space-x-3 pb-3 scrollbar-hide mb-6">
          {previewDates.length > 0 ? previewDates.map((avail) => {
            const parsedDate = parseISO(avail.available_date);
            // --- CORREÇÃO: Adiciona a verificação de data inválida ---
            if (isNaN(parsedDate.getTime())) return null; 
            // -----------------------------------------------------
            return (
            <button
              key={avail.available_date}
              onClick={() => setSelectedDate(avail.available_date)}
              className={`
                flex-shrink-0 w-24 h-24 rounded-xl border-2 transition-all duration-300 shadow-sm
                ${selectedDate === avail.available_date 
                    ? 'bg-verde-principal border-verde-principal text-white shadow-lg scale-105' 
                    : 'bg-gray-50 border-gray-200 text-gray-800 hover:border-verde-principal/50'
                }
              `}
            >
              <span className="block text-xs font-medium uppercase transition-colors">
                {format(parsedDate, 'EEE', { locale: dateFnsLocale })}
              </span>
              <span className="block text-2xl font-bold transition-colors">
                {format(parsedDate, 'dd')}
              </span>
              <span className="block text-xs opacity-70 transition-colors">
                {avail.total_spots - avail.spots_booked} vagas
              </span>
            </button>
          )}) : (
              <p className="text-gray-500">{tCommon.noResults}</p>
          )}
        </div>
        {/* Fim do Calendário Estilizado */}
        
        <h4 className="font-semibold text-lg mb-3 flex items-center space-x-2 text-gray-800">
          <User className="w-5 h-5 text-verde-secundario" />
          <span>{c.adults} / {c.children}</span>
        </h4>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {c.adults}
            </label>
            <input
              type="number"
              min="1"
              value={adults}
              onChange={(e) => setAdults(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent"
              disabled={!selectedDate}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {c.children}
            </label>
            <input
              type="number"
              min="0"
              value={children}
              onChange={(e) => setChildren(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent"
              disabled={!selectedDate}
            />
          </div>
        </div>

        <button
          onClick={() => setStep(2)}
          disabled={!selectedDate || adults < 1}
          className="w-full bg-foz-azul-escuro text-white py-3 rounded-xl font-semibold hover:bg-foz-azul-claro transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          <span>Continuar para Observações</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* --- ETAPA 2: Observações e Resumo --- */}
      <div className={`${step === 2 ? 'block animate-fade-in-up' : 'hidden'}`}>
         <h4 className="font-semibold text-lg mb-4 flex items-center space-x-2 text-gray-800">
            <MessageCircle className="w-5 h-5 text-verde-secundario" />
            <span>Adicionar Observações (Opcional)</span>
         </h4>
         
         <textarea 
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: Alergia, prefere guia falando Inglês, etc."
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-verde-principal focus:ring-0 transition-all resize-none mb-6"
         ></textarea>
         
         {/* Resumo Estilizado */}
         <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-6">
            <p className="font-bold text-lg text-foz-azul-escuro mb-2">Resumo do Pedido</p>
            <div className="text-sm text-gray-700 space-y-1">
               {/* Assegura que selectedDate só é usado se for uma string válida */}
               <p><span className="font-medium">{c.date}:</span> <span className="font-bold text-verde-principal">{selectedDate ? format(parseISO(selectedDate), 'dd/MM/yyyy') : 'Selecione uma data'}</span></p>
               <p><span className="font-medium">{c.adults}:</span> {adults}</p>
               <p><span className="font-medium">{c.children}:</span> {children}</p>
            </div>
            <div className="mt-3 border-t border-gray-300 pt-2 flex justify-between items-center">
               <span className="text-lg font-bold">{c.total}:</span>
               <span className="text-2xl font-black text-verde-principal">R$ {estimatedTotal.toFixed(2)}</span>
            </div>
         </div>
         
         <div className="flex flex-col space-y-3">
             <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="w-full bg-gradient-to-r from-verde-principal to-verde-secundario text-white py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2"
             >
                {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
                <span>{t.addToCart}</span>
             </button>
             <button 
                onClick={() => setStep(1)}
                className="w-full text-sm text-gray-500 hover:text-foz-azul-escuro transition-colors font-medium"
             >
                Voltar à seleção de data
             </button>
         </div>
      </div>
    </div>
  );
};