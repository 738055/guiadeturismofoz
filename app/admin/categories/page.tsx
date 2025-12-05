// app/admin/categories/page.tsx
'use client'; // Página de cliente para gerenciar estado

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Plus, Save, Trash2, Loader2, Tag, Image as ImageIcon, Upload, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// BUCKET de Imagens (definido previamente como 'tours')
const BUCKET_NAME = 'tours'; 

// Tipo para os dados do formulário
type TranslationData = {
  name: string;
  slug: string;
};

// CORREÇÃO: Usando o formato padrão com hífen
type LanguageCode = 'pt-BR' | 'en-US' | 'es-ES';

type NewCategoryTranslations = {
  'pt-BR': TranslationData;
  'en-US': TranslationData;
  'es-ES': TranslationData;
};

// NOVO TIPO para o estado local, inclui a URL da imagem
type NewCategoryState = {
  imageUrl: string;
  translations: NewCategoryTranslations;
};

const initialTranslations: NewCategoryTranslations = {
  'pt-BR': { name: '', slug: '' },
  'en-US': { name: '', slug: '' },
  'es-ES': { name: '', slug: '' }
};

const initialCategoryState: NewCategoryState = {
  imageUrl: '',
  translations: initialTranslations
};

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSave, setLoadingSave] = useState(false);
  const [uploading, setUploading] = useState(false); // NOVO: Estado de upload
  
  // CORREÇÃO: Muda o tipo do useState e o valor inicial para o novo objeto de estado
  const [newCategoryState, setNewCategoryState] = useState<NewCategoryState>(initialCategoryState);
  const [activeTab, setActiveTab] = useState<LanguageCode>('pt-BR');

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
          image_url,  // <-- BUSCA NOVA COLUNA
          category_translations!left (
            name,
            slug,
            language_code
          )
        `)
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
    let slug = value.toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');

    setNewCategoryState(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [activeTab]: {
          ...prev.translations[activeTab], 
          [field]: value,
          // Se estiver editando o nome em pt-BR, atualiza o slug de todos
          ...(field === 'name' && activeTab === 'pt-BR' && { slug: slug })
        }
      }
    }));
  };

  // --- NOVO: FUNÇÃO DE UPLOAD DE IMAGEM ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    
    // Usa um nome temporário, como 'new' + timestamp, antes de ter um ID
    const fileName = `categories/new-${Date.now()}.${fileExt}`;
    
    try {
      // 1. Upload da imagem
      const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(fileName, file);
      if (uploadError) throw uploadError;

      // 2. Pegar URL pública
      const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
      
      // 3. Salvar no estado local
      setNewCategoryState(prev => ({ ...prev, imageUrl: publicUrlData.publicUrl }));
      
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Erro ao enviar imagem.');
    } finally {
      setUploading(false);
      e.target.value = ''; // Limpa o input
    }
  };

  // --- NOVO: FUNÇÃO DE REMOÇÃO DE IMAGEM ---
  const handleImageDelete = async () => {
    if (!newCategoryState.imageUrl) return;

    // Remove do Storage
    try {
        const imagePath = newCategoryState.imageUrl.split('/tours/').pop();
        if (imagePath) {
            await supabase.storage.from(BUCKET_NAME).remove([imagePath]);
        }
    } catch (error) {
        console.warn('Could not delete file from storage:', error);
    }

    // Remove do estado local
    setNewCategoryState(prev => ({ ...prev, imageUrl: '' }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const translations = newCategoryState.translations;
    if (!translations['pt-BR'].name || !translations['pt-BR'].slug) {
      alert('Preencha pelo menos o Nome e Slug em Português.');
      return;
    }
    setLoadingSave(true);

    try {
      // 1. Cria a Categoria principal (incluindo a URL da imagem)
      const { data: newCategory, error: insertError } = await supabase
        .from('categories')
        .insert({ image_url: newCategoryState.imageUrl }) // <-- SALVA A IMAGEM AQUI
        .select()
        .single();

      if (insertError) throw insertError;

      // 2. Prepara e salva as Traduções
      const translationsToUpsert = Object.entries(translations)
        .filter(([_, translation]) => translation.name) // Salva apenas se tiver nome
        .map(([langCode, translation]) => ({
          category_id: newCategory.id,
          language_code: langCode,
          name: translation.name,
          slug: translation.slug || translations['pt-BR'].slug // Usa o slug PT se o específico estiver vazio
        }));

      const { error: upsertError } = await supabase
        .from('category_translations')
        .upsert(translationsToUpsert);

      if (upsertError) throw upsertError;

      alert('Categoria criada com sucesso!');
      setNewCategoryState(initialCategoryState); // Limpa o formulário
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
      // 1. Encontra o URL da imagem para deletar no storage
      const catToDelete = categories.find(c => c.id === categoryId);
      if (catToDelete?.image_url) {
        const imagePath = catToDelete.image_url.split('/tours/').pop();
        if (imagePath) await supabase.storage.from(BUCKET_NAME).remove([imagePath]);
      }
      
      // 2. Deleta as traduções
      await supabase
        .from('category_translations')
        .delete()
        .eq('category_id', categoryId);
        
      // 3. Deleta a categoria principal
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

  // Helper para pegar o nome em PT-BR para a lista
  const getCategoryName = (translations: any[] | null) => {
    if (!translations || translations.length === 0) return 'Sem nome';
    const pt = translations.find(t => t.language_code === 'pt-BR');
    return pt?.name || translations[0]?.name || 'Sem nome';
  };

  // Helper para pegar o slug em PT-BR
  const getCategorySlug = (translations: any[] | null) => {
     if (!translations || translations.length === 0) return '';
    const pt = translations.find(t => t.language_code === 'pt-BR');
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
              
              {/* --- NOVO: Seção de Imagem de Destaque --- */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Imagem de Destaque (Home)</label>
                <div className="flex flex-col gap-3">
                  {newCategoryState.imageUrl ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden group border-2">
                       <Image 
                          src={newCategoryState.imageUrl} 
                          alt="Pré-visualização da Categoria" 
                          fill 
                          className="object-cover" 
                        />
                        <button type="button" onClick={handleImageDelete}
                          className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full transition-opacity"
                          aria-label="Excluir imagem">
                          <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  ) : (
                    <label htmlFor="categoryImageUpload" className="relative flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      {uploading ? (<Loader2 className="w-6 h-6 animate-spin text-verde-principal" />) : (
                        <><Upload className="w-6 h-6 text-gray-500 mb-1" /><span className="text-sm text-gray-600">Enviar Imagem</span></>
                      )}
                      <input 
                          id="categoryImageUpload" 
                          type="file" 
                          accept="image/*" 
                          className="opacity-0 absolute inset-0"
                          onChange={handleImageUpload} 
                          disabled={uploading} 
                      />
                    </label>
                  )}
                  <p className="text-xs text-gray-500">Recomendado: Imagem de paisagem (proporção 4:3).</p>
                </div>
              </div>
              {/* --- FIM: Seção de Imagem de Destaque --- */}


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
                    className={`flex-1 text-sm font-semibold pb-3 border-b-2 transition-all ${
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
                    value={newCategoryState.translations[activeTab].name} // USAR NOVO ESTADO
                    onChange={(e) => updateNewTranslation('name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Slug (URL)</label>
                  <input
                    type="text"
                    value={newCategoryState.translations[activeTab].slug} // USAR NOVO ESTADO
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagem</th> {/* NOVO */}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome (PT-BR)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="relative w-12 h-8 rounded overflow-hidden">
                                {cat.image_url ? (
                                    <Image src={cat.image_url} alt={getCategoryName(cat.category_translations)} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center"><ImageIcon className='w-4 h-4 text-gray-400'/></div>
                                )}
                            </div>
                        </td> {/* NOVO */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{getCategoryName(cat.category_translations)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{getCategorySlug(cat.category_translations)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {/* Em um projeto mais complexo, haveria um botão de editar que carregaria os dados para o formulário */}
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