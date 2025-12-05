// guiadeturismofoz/app/admin/categories/page.tsx
'use client'; // Página de cliente para gerenciar estado

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Plus, Trash2, Loader2, Tag, Image as ImageIcon, Edit } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const BUCKET_NAME = 'tours'; 

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          id,
          created_at,
          image_url,  
          category_translations!left (
            name,
            slug,
            language_code
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading categories:', error);
        throw error; 
      }
      
      setCategories((data || []).filter(item => item.id)); 
      
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria? Isso é irreversível.')) return;

    try {
      // 1. Encontra o URL da imagem para deletar no storage
      const catToDelete = categories.find(c => c.id === categoryId);
      if (catToDelete?.image_url) {
        const pathSegments = catToDelete.image_url.split(`${BUCKET_NAME}/`);
        const imagePath = pathSegments.length > 1 ? pathSegments[1] : null;

        if (imagePath) await supabase.storage.from(BUCKET_NAME).remove([imagePath]);
      }
      
      // 2. Deleta a categoria (ON DELETE CASCADE deve remover as traduções)
      await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      // Recarrega a lista
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Erro ao excluir categoria. Verifique o console.');
    }
  };

  // Helper para pegar o nome em PT-BR para a lista
  const getCategoryName = (translations: any[] | null) => {
    if (!translations || translations.length === 0) return 'Sem nome';
    const pt = Array.isArray(translations) ? translations.find(t => t.language_code === 'pt-BR') : null;
    return pt?.name || translations?.[0]?.name || 'Sem nome';
  };

  // Helper para pegar o slug em PT-BR
  const getCategorySlug = (translations: any[] | null) => {
     if (!translations || translations.length === 0) return '';
    const pt = Array.isArray(translations) ? translations.find(t => t.language_code === 'pt-BR') : null;
    return pt?.slug || translations?.[0]?.slug || '';
  }


  return (
    <div className="min-h-screen">
      {/* Header do Admin */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/admin/dashboard"
              className="flex items-center space-x-2 text-gray-600 hover:text-verde-principal transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </Link>
            <h1 className="text-2xl font-bold text-verde-principal">Gerenciar Categorias</h1>
            {/* Botão Nova Categoria */}
            <Link
              href="/admin/categories/new"
              className="flex items-center space-x-2 bg-verde-principal text-white px-4 py-2 rounded-lg hover:bg-verde-secundario transition-colors shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Nova Categoria</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Conteúdo: Apenas Lista */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {loading ? (
              <div className="text-center py-12 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-verde-principal" />
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-md">
                <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma categoria cadastrada</p>
                <Link
                  href="/admin/categories/new"
                  className="mt-4 inline-flex items-center space-x-2 text-verde-principal hover:underline"
                >
                    <Plus className="w-4 h-4" />
                    <span>Crie a primeira categoria</span>
                </Link>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagem</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome (PT-BR)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="relative w-12 h-8 rounded overflow-hidden border border-gray-200">
                                {cat.image_url ? (
                                    <Image src={cat.image_url} alt={getCategoryName(cat.category_translations)} fill className="object-cover" sizes="100px" />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center"><ImageIcon className='w-4 h-4 text-gray-400'/></div>
                                )}
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{getCategoryName(cat.category_translations)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{getCategorySlug(cat.category_translations)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => router.push(`/admin/categories/edit/${cat.id}`)}
                            className="text-verde-principal hover:text-verde-secundario mr-4"
                            aria-label="Editar"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => deleteCategory(cat.id)}
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
            )}
        </div>
      </div>
    </div>
  );
}