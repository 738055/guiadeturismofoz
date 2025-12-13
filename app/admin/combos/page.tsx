'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Plus, Trash2, Edit, Layers, Loader2 } from 'lucide-react';

export default function AdminCombosList() {
  const [combos, setCombos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCombos();
  }, []);

  const loadCombos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('combos')
        .select(`*, combo_translations!inner(title)`)
        .eq('combo_translations.language_code', 'pt-BR')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCombos(data || []);
    } catch (error) {
      console.error('Erro ao carregar combos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este combo?')) return;
    try {
      const { error } = await supabase.from('combos').delete().eq('id', id);
      if (error) throw error;
      setCombos(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      alert('Erro ao excluir combo.');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-10 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-gray-600 hover:text-verde-principal">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Layers className="text-purple-600" />
              Gerenciar Combos
            </h1>
          </div>
          <Link href="/admin/combos/new" className="bg-verde-principal text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-verde-secundario transition-colors">
            <Plus className="w-5 h-5" />
            Novo Combo
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-8">
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-verde-principal" />
          </div>
        ) : combos.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Nenhum combo encontrado</h3>
            <p className="text-gray-500 mb-6">Crie pacotes promocionais para aumentar suas vendas.</p>
            <Link href="/admin/combos/new" className="inline-flex items-center gap-2 text-verde-principal font-semibold hover:underline">
              Criar meu primeiro combo
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-700">Título (PT-BR)</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Preço</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {combos.map((combo) => (
                  <tr key={combo.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-800 font-medium">{combo.combo_translations[0]?.title || 'Sem título'}</td>
                    <td className="px-6 py-4 text-gray-600">R$ {combo.base_price.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      {combo.is_active ? <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">Ativo</span> : <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full font-medium">Inativo</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {/* LINK DE EDIÇÃO ATUALIZADO */}
                        <Link href={`/admin/combos/edit/${combo.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Editar">
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button onClick={() => handleDelete(combo.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Excluir"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}