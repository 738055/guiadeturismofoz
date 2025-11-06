'use client';

import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ContactFormProps {
  dict: any;
}

export const ContactForm: React.FC<ContactFormProps> = ({ dict: t }) => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulação de envio
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1500);
  };

  if (sent) {
    return (
      <div className="text-center py-12 animate-in fade-in zoom-in">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Send className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-3">Mensagem Enviada!</h3>
        <p className="text-gray-600 text-lg">{t.success}</p>
        <button onClick={() => setSent(false)} className="mt-8 text-verde-principal font-semibold hover:underline">
          Enviar outra mensagem
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">{t.formName}</label>
        <input type="text" required className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-verde-principal focus:ring-0 transition-all" />
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">{t.formEmail}</label>
        <input type="email" required className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-verde-principal focus:ring-0 transition-all" />
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">{t.formPhone}</label>
        <input type="tel" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-verde-principal focus:ring-0 transition-all" />
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">{t.formMessage}</label>
        <textarea rows={5} required className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-verde-principal focus:ring-0 transition-all resize-none"></textarea>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-verde-principal hover:bg-verde-secundario text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 text-lg"
      >
        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
        <span>{t.send}</span>
      </button>
    </form>
  );
};