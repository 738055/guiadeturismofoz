// guiadeturismofoz/app/admin/combos/ComboForm.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
// CORREÇÃO: Adicionado 'Check' aos imports
import { Save, Loader2, ArrowLeft, Plus, Trash2, Check } from 'lucide-react';
import Link from 'next/link';

type TranslationData = { title: string; description: string; whatsIncluded: string[]; };
type FormData = {
  basePrice: string;
  oldPrice: string;
  isActive: boolean;
  translations: { 'pt-BR': TranslationData; 'en-US': TranslationData; 'es-ES': TranslationData; };
};

export const AdminComboForm: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'pt-BR' | 'en-US' | 'es-ES'>('pt-BR');
  const [includeInput, setIncludeInput] = useState('');
  
  const [formData, setFormData] = useState<FormData>({
    basePrice: '', oldPrice: '', isActive: true,
    translations: {
      'pt-BR': { title: '', description: '', whatsIncluded: [] },
      'en-US': { title: '', description: '', whatsIncluded: [] },
      'es-ES': { title: '', description: '', whatsIncluded: [] }
    }
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        // 1. Criar Combo
        const { data: combo, error: comboError } = await supabase.from('combos').insert({
            base_price: parseFloat(formData.basePrice) || 0,
            old_price: formData.oldPrice ? parseFloat(formData.oldPrice) : null,
            is_active: formData.isActive
        }).select().single();

        if (comboError) throw comboError;

        // 2. Salvar Traduções
        const translations = Object.entries(formData.translations).map(([lang, data]) => ({
            combo_id: combo.id,
            language_code: lang, 
            title: data.title,
            description: data.description,
            whats_included: JSON.stringify(data.whatsIncluded)
        }));

        const { error: transError } = await supabase.from('combo_translations').insert(translations);
        if (transError) throw transError;
        
        alert('Combo criado com sucesso!');
        router.push('/admin/combos'); 
    } catch (error) {
        console.error(error);
        alert('Erro ao salvar combo.');
    } finally {
        setLoading(false);
    }
  };

  const updateTrans = (field: string, val: any) => {
    setFormData(prev => ({
        ...prev, 
        translations: { ...prev.translations, [activeTab]: { ...prev.translations[activeTab], [field]: val } } 
    }));
  };

  const addFeature = () => {
      if(!includeInput) return;
      updateTrans('whatsIncluded', [...formData.translations[activeTab].whatsIncluded, includeInput]);
      setIncludeInput('');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow sticky top-0 z-10 p-4">
         <div className="max-w-4xl mx-auto flex justify-between items-center">
             <Link href="/admin/combos" className="flex items-center text-gray-600"><ArrowLeft className="mr-2"/> Voltar</Link>
             <h1 className="text-xl font-bold">Lançar Novo Combo</h1>
             <button onClick={handleSave} disabled={loading} className="bg-verde-principal text-white px-4 py-2 rounded flex items-center gap-2">
                 {loading ? <Loader2 className="animate-spin"/> : <Save size={20}/>} Salvar
             </button>
         </div>
      </div>

      <div className="max-w-4xl mx-auto mt-8 px-4 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-bold mb-4">Definição de Preços</h3>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm mb-1 text-gray-700">Preço Final (R$)</label>
                      <input type="number" step="0.01" className="w-full border p-2 rounded focus:ring-2 focus:ring-verde-principal" value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: e.target.value})} />
                  </div>
                  <div>
                      <label className="block text-sm mb-1 text-gray-700">Preço Original "De" (Opcional)</label>
                      <input type="number" step="0.01" className="w-full border p-2 rounded focus:ring-2 focus:ring-verde-principal" value={formData.oldPrice} onChange={e => setFormData({...formData, oldPrice: e.target.value})} />
                  </div>
              </div>
              <div className="mt-4">
                  <label className="flex items-center gap-2 font-medium"><input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} /> Combo Ativo no Site</label>
              </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex gap-4 border-b mb-4">
                  {(['pt-BR', 'en-US', 'es-ES'] as const).map(lang => (
                      <button key={lang} onClick={() => setActiveTab(lang)} className={`pb-2 px-2 transition-colors ${activeTab === lang ? 'border-b-2 border-verde-principal text-verde-principal font-bold' : 'text-gray-500'}`}>
                          {lang}
                      </button>
                  ))}
              </div>
              
              <div className="space-y-4">
                  <div>
                      <label className="block text-sm mb-1 text-gray-700">Título do Combo</label>
                      <input type="text" className="w-full border p-2 rounded" value={formData.translations[activeTab].title} onChange={e => updateTrans('title', e.target.value)} placeholder="Ex: Pacote Cataratas + Parque das Aves" />
                  </div>
                  <div>
                      <label className="block text-sm mb-1 text-gray-700">Descrição Curta</label>
                      <textarea rows={3} className="w-full border p-2 rounded" value={formData.translations[activeTab].description} onChange={e => updateTrans('description', e.target.value)} placeholder="Descrição atrativa para o card..." />
                  </div>
                  <div>
                      <label className="block text-sm mb-1 text-gray-700">Itens Incluídos no Pacote</label>
                      <div className="flex gap-2 mb-2">
                          <input type="text" className="w-full border p-2 rounded" value={includeInput} onChange={e => setIncludeInput(e.target.value)} placeholder="Ex: Transporte Ida e Volta" />
                          <button type="button" onClick={addFeature} className="bg-verde-principal text-white px-3 py-2 rounded hover:bg-verde-secundario"><Plus size={20}/></button>
                      </div>
                      <ul className="space-y-2 mt-3">
                          {formData.translations[activeTab].whatsIncluded.map((item, i) => (
                              <li key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm">
                                  <span className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500"/> {item}</span>
                                  <button onClick={() => updateTrans('whatsIncluded', formData.translations[activeTab].whatsIncluded.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                              </li>
                          ))}
                      </ul>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};