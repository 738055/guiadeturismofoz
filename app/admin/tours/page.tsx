'use client'; // Página de cliente

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Plus, Edit, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';

// Tipo para os passeios formatados
type FormattedTour = {
  id: string;
  title: string;
  price: number;
  duration: number;
  location: string;
  isActive: boolean;
};

export default function AdminToursPage() {
  const router = useRouter();
  const [tours, setTours] = useState<FormattedTour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTours();
  }, []);

  const loadTours = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('tours')
        .select(`
          id,
          base_price,
          duration_hours,
          location,
          is_active,
          tour_translations!inner (
            title,
            language_code
          )
        `)
        // Pega apenas a tradução em PT_BR para a listagem
        .eq('tour_translations.language_code', 'pt_BR') 
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTours = data.map((tour: any) => ({
        id: tour.id,
        title: tour.tour_translations[0]?.title || 'Sem título',
        price: tour.base_price,
        duration: tour.duration_hours,
        location: tour.location,
        isActive: tour.is_active
      }));

      setTours(formattedTours);
    } catch (error) {
      console.error('Error loading tours:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (tourId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('tours')
        .update({ is_active: !currentStatus })
        .eq('id', tourId);

      if (error) throw error;
      
      // Atualiza o estado local para resposta imediata
      setTours(prevTours => 
        prevTours.map(t => 
          t.id === tourId ? { ...t, isActive: !currentStatus } : t
        )
      );
    } catch (error) {
      console.error('Error toggling tour status:', error);
    }
  };

  const deleteTour = async (tourId: string) => {
    if (!confirm('Tem certeza que deseja excluir este passeio? Esta ação não pode ser desfeita.')) return;

    try {
      // Deleta as traduções primeiro (ou configure 'ON DELETE CASCADE' no Supabase)
      await supabase
        .from('tour_translations')
        .delete()
        .eq('tour_id', tourId);
        
      // Deleta o passeio
      const { error } = await supabase
        .from('tours')
        .delete()
        .eq('id', tourId);

      if (error) throw error;

      // Recarrega a lista
      loadTours();
    } catch (error) {
      console.error('Error deleting tour:', error);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header do Admin */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/admin/dashboard"
              className="flex items-center space-x-2 text-gray-600 hover:text-verde-principal transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </Link>
            <h1 className="text-2xl font-bold text-verde-principal">Gerenciar Passeios</h1>
            <Link
              href="/admin/tours/new"
              className="flex items-center space-x-2 bg-verde-principal text-white px-4 py-2 rounded-lg hover:bg-verde-secundario transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Novo Passeio</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-verde-principal" />
          </div>
        ) : tours.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum passeio cadastrado</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Localização</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duração</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tours.map((tour) => (
                  <tr key={tour.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{tour.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{tour.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{tour.duration}h</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">R$ {tour.price.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleActive(tour.id, tour.isActive)}
                        className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${
                          tour.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {tour.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{tour.isActive ? 'Ativo' : 'Inativo'}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => router.push(`/admin/tours/edit/${tour.id}`)}
                        className="text-verde-principal hover:text-verde-secundario mr-4"
                        aria-label="Editar"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteTour(tour.id)}
                        className="text-red-600 hover:text-red-800"
                        aria-label="Excluir"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
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