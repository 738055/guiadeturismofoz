// app/admin/categories/page.tsx
'use client'; // Página de cliente para gerenciar estado

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Plus, Save, Trash2, Loader2, Tag } from 'lucide-react';
import Link from 'next/link';

// Tipo para os dados do formulário
type TranslationData = {
  name: string;
  slug: string;
};
type NewCategoryTranslations = {
  pt_BR: TranslationData;
  en_US: TranslationData;
  es_ES: TranslationData;
};

const initialTranslations: NewCategoryTranslations = {
  pt_BR: { name: '', slug: '' },
  en_US: { name: '', slug: '' },
  es_ES: { name: '', slug: '' }
};

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSave, setLoadingSave] = useState(false);
  
  // Estado para o formulário de nova categoria
  const [newTranslations, setNewTranslations] = useState<NewCategoryTranslations>(initialTranslations);
  const [activeTab, setActiveTab] = useState<'pt_BR' | 'en_US' | 'es_ES'>('pt_BR');

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
          -- CORREÇÃO: Muda para LEFT JOIN para pegar categorias mesmo sem tradução
          category_translations!left (
            name,
            slug,
            language_code
          )
        `)
        // REMOVIDA A LINHA .eq('category_translations.language_code', 'pt_BR')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handler para atualizar o estado aninhado das traduções
  const updateNewTranslation = (field: keyof TranslationData, value: string) => {
    // Auto-gera o slug a partir do nome (apenas em pt-BR)
    let slug = value.toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');

    setNewTranslations(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab], 
        [field]: value,
        // Se estiver editando o nome em pt-BR, atualiza o slug de todos
        ...(field === 'name' && activeTab === 'pt_BR' && { slug: slug })
      }
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTranslations.pt_BR.name || !newTranslations.pt_BR.slug) {
      alert('Preencha pelo menos o Nome e Slug em Português.');
      return;
    }
    setLoadingSave(true);

    try {
      // 1. Cria a Categoria principal
      const { data: newCategory, error: insertError } = await supabase
        .from('categories')
        .insert({})
        .select()
        .single();

      if (insertError) throw insertError;

      // 2. Prepara e salva as Traduções
      const translationsToUpsert = Object.entries(newTranslations)
        .filter(([_, translation]) => translation.name) // Salva apenas se tiver nome
        .map(([langCode, translation]) => ({
          category_id: newCategory.id,
          language_code: langCode,
          name: translation.name,
          slug: translation.slug || newTranslations.pt_BR.slug // Usa o slug PT se o específico estiver vazio
        }));

      const { error: upsertError } = await supabase
        .from('category_translations')
        .upsert(translationsToUpsert);

      if (upsertError) throw upsertError;

      alert('Categoria criada com sucesso!');
      setNewTranslations(initialTranslations); // Limpa o formulário
      loadCategories(); // Recarrega a lista

    } catch (error) {
      console.error('Error creating category:', error);
      alert('Erro ao criar categoria.');
    } finally {
      setLoadingSave(false);
    }
  };


  const deleteCategory = async (categoryId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria? Os passeios associados a ela perderão a categoria.')) return;

    try {
      // Deleta as traduções
      await supabase
        .from('category_translations')
        .delete()
        .eq('category_id', categoryId);
        
      // Deleta a categoria
      await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      // Recarrega a lista
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  // Helper para pegar o nome em PT-BR para a lista (Agora mais robusto)
  const getCategoryName = (translations: any[] | null) => {
    if (!translations || translations.length === 0) return 'Sem nome';
    const pt = translations.find(t => t.language_code === 'pt-BR');
    // Se não tiver pt-BR, pega o nome do primeiro idioma disponível
    return pt?.name || translations[0]?.name || 'Sem nome';
  };

  // Helper para pegar o slug em PT-BR (Agora mais robusto)
  const getCategorySlug = (translations: any[] | null) => {
     if (!translations || translations.length === 0) return '';
    const pt = translations.find(t => t.language_code === 'pt-BR');
    // Se não tiver pt-BR, pega o slug do primeiro idioma disponível
    return pt?.slug || translations[0]?.slug || '';
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
            <div className="w-24"></div> {/* Espaçador */}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Formulário de Nova Categoria */}
          <div className="lg:col-span-1">
            <form onSubmit={handleCreate} className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Nova Categoria</h3>
              
              {/* Abas de Idioma */}
              <div className="flex space-x-2 mb-6 border-b">
                {[
                  { code: 'pt-BR' as const, label: 'Português' },
                  { code: 'en-US' as const, label: 'English' },
                  { code: 'es-ES' as const, label: 'Español' }
                ].map(lang => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setActiveTab(lang.code)}
                    className={`px-4 py-2 font-medium transition-colors ${
                      activeTab === lang.code
                        ? 'border-b-2 border-verde-principal text-verde-principal'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              {/* Campos de Tradução */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                  <input
                    type="text"
                    // Correção: Agora acessa o estado corretamente
                    value={newTranslations[activeTab].name} 
                    onChange={(e) => updateNewTranslation('name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Slug (URL)</label>
                  <input
                    type="text"
                    value={newTranslations[activeTab].slug}
                    onChange={(e) => updateNewTranslation('slug', e.target.value)}
                    disabled={activeTab !== 'pt-BR'} // Edita slug só em PT
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent disabled:bg-gray-100"
                  />
                  {activeTab !== 'pt-BR' && <p className="text-xs text-gray-500 mt-1">O Slug é definido na aba Português.</p>}
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingSave}
                className="w-full mt-6 flex items-center justify-center space-x-2 bg-verde-principal text-white px-4 py-2 rounded-lg hover:bg-verde-secundario transition-colors disabled:opacity-50"
              >
                {loadingSave ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                <span>Salvar Nova Categoria</span>
              </button>
            </form>
          </div>

          {/* Lista de Categorias Existentes */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="text-center py-12 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-verde-principal" />
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-md">
                <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma categoria cadastrada</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome (PT-BR)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{getCategoryName(cat.category_translations)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{getCategorySlug(cat.category_translations)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}