// guiadeturismofoz/contexts/CartContext.tsx
'use client'; // Este componente usa hooks, então precisa ser um Client Component

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  tourId: string;
  tourTitle: string;
  date: string;
  adults: number;
  children: number;
  price: number; // Preço base por adulto
  subtotal: number;
  notes?: string; // <--- NOVO CAMPO: Observações
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (tourId: string, date: string) => void;
  updateQuantity: (tourId: string, date: string, adults: number, children: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') {
      return []; // Retorna vazio no servidor
    }
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse cart from localStorage', e);
      return [];
    }
  });

  useEffect(() => {
    // Só roda no cliente
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(
        i => i.tourId === item.tourId && i.date === item.date
      );

      // Se já existe, atualiza (para caso de adicionar novamente com valores diferentes)
      if (existingIndex >= 0) {
        const updated = [...prev];
        // Mantém as notas do item anterior se a nota atual for vazia, mas atualiza se houver nota nova
        updated[existingIndex] = { ...item, notes: item.notes || updated[existingIndex].notes };
        return updated;
      }
      // Se não existe, adiciona
      return [...prev, item];
    });
  };

  const removeItem = (tourId: string, date: string) => {
    setItems(prev => prev.filter(i => !(i.tourId === tourId && i.date === date)));
  };

  const updateQuantity = (tourId: string, date: string, adults: number, children: number) => {
    setItems(prev => prev.map(item => {
      if (item.tourId === tourId && item.date === date) {
        // Assumindo que crianças pagam metade (ajuste conforme sua regra de negócio)
        const subtotal = item.price * (adults + children * 0.5);
        return { ...item, adults, children, subtotal };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};