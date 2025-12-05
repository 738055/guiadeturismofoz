// guiadeturismofoz/app/[lang]/tour/[id]/TourClient.tsx
'use client'; // Este componente é de cliente (usa hooks)

import React, { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Calendar } from 'lucide-react';
// IMPORTAR getDay
import { format, parseISO, getDay } from 'date-fns';
import { Dictionary } from '@/i18n/dictionaries';

// Tipamos as props recebidas do Server Component
interface TourClientProps {
  tour: {
    id: string;
    title: string;
    base_price: number;
    disabled_week_days?: number[]; // <-- ADICIONE ESTA PROP
  };
  availableDates: any[];
  dict: Dictionary; // Recebe o dicionário completo
}

export const TourClient: React.FC<TourClientProps> = ({ tour, availableDates, dict }) => {
  const { addItem } = useCart();
  const [selectedDate, setSelectedDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  const t = dict.tours; // Atalho para as traduções de "tours"
  const c = dict.cart; // Atalho para as traduções de "cart"

  const handleAddToCart = () => {
    if (!selectedDate) {
      alert(t.selectDate);
      return;
    }

    // Lógica de subtotal (criança paga 0.5)
    const subtotal = tour.base_price * (adults + children * 0.5);

    addItem({
      tourId: tour.id,
      tourTitle: tour.title,
      date: selectedDate, // 'selectedDate' já está no formato 'yyyy-MM-dd'
      adults,
      children,
      price: tour.base_price,
      subtotal
    });

    // Idealmente, você chamaria onCartClick() do layout pai,
    // mas por simplicidade, vamos apenas dar um alerta.
    alert('Adicionado ao roteiro!');
  };

  // --- LÓGICA DE FILTRO DE DATAS ---
  const disabledDays = tour.disabled_week_days || [];
  
  const filteredDates = availableDates.filter(avail => {
    try {
      const date = parseISO(avail.available_date);
      const dayOfWeek = getDay(date); // 0 = Domingo, 1 = Segunda...
      
      // Retorna true se o dia DA SEMANA NÃO ESTÁ na lista de desabilitados
      return !disabledDays.includes(dayOfWeek);

    } catch (e) {
      console.error('Data inválida:', avail.available_date, e);
      return false;
    }
  });
  // --- FIM DA LÓGICA DE FILTRO ---

  return (
    <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
      <h3 className="font-semibold text-lg mb-4 flex items-center space-x-2">
        <Calendar className="w-5 h-5 text-verde-principal" />
        <span>{t.availability}</span>
      </h3>

      {/* ATUALIZE AQUI PARA USAR filteredDates */}
      {filteredDates.length > 0 ? (
        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent mb-4"
        >
          <option value="">{t.selectDate}</option>
          {/* ATUALIZE AQUI PARA USAR filteredDates */}
          {filteredDates.map((avail: any) => (
            <option key={avail.available_date} value={avail.available_date}>
              {/* Formata a data para dd/MM/yyyy */}
              {format(parseISO(avail.available_date), 'dd/MM/yyyy')} 
              {' - '}
              ({avail.total_spots - avail.spots_booked} vagas)
            </option>
          ))}
        </select>
      ) : (
        <p className="text-gray-500 mb-4">{dict.common.noResults}</p>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
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
          />
        </div>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={!selectedDate}
        className="w-full bg-gradient-to-r from-verde-principal to-verde-secundario text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {t.addToCart}
      </button>
    </div>
  );
};