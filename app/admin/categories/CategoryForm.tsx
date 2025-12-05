// guiadeturismofoz/app/admin/categories/CategoryForm.tsx
'use client'; 

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Save, Loader2, Tag, Image as ImageIcon, Upload, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const BUCKET_NAME = 'tours'; // Usando o bucket existente para assets

// Tipos
type TranslationData = {
  name: string;
  slug: string;
};

type LanguageCode = 'pt-BR' | 'en-US' | 'es-ES';

type CategoryTranslations = {
  'pt-BR': TranslationData;
  'en-US': TranslationData;
  'es-ES': TranslationData;
};

type FormData = {
  imageUrl: string;
  translations: CategoryTranslations;
};

const initialTranslations: CategoryTranslations = {
  'pt-BR': { name: '', slug: '' },
  'en-US': { name: '', slug: '' },
  'es-ES': { name: '', slug: '' }
};

const initialFormData: FormData = {
  imageUrl: '',
  translations: initialTranslations
};

export const CategoryForm: React.FC<{ categoryId?: string }> = ({ categoryId }) => {
  const router = useRouter();
  const isEdit = !!categoryId;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<LanguageCode>('pt-BR');

  useEffect(() => {
    if (isEdit) {
      loadCategory();
    }
  }, [categoryId, isEdit]);

  const loadCategory = async () => {
    if (!categoryId) return;
    try {
      setLoadingData(true);
      const { data: category, error } = await supabase
        .from('categories')
        .select(`
          id,
          image_url,
          category_translations (*)
        `)
        .eq('id', categoryId)
        .maybeSingle();

      if (error) throw error;
      if (!category) {
        alert('Categoria não encontrada.');
        router.push('/admin/categories');
        return;
      }

      // Preenche traduções
      const translations = { ...initialTranslations };
      category.category_translations.forEach((t: any) => {
        const langCode = t.language_code as LanguageCode; 
        if (translations[langCode]) {
          translations[langCode] = { name: t.name, slug: t.slug };
        }
      });

      setFormData({
        imageUrl: category.image_url || '',
        translations: translations
      });

    } catch (error) {
      console.error('Error loading category:', error);
    } finally {
      setLoadingData(false);
    }
  };
  
  const updateTranslation = (field: keyof TranslationData, value: string) => {
    // Auto-gera o slug a partir do nome (apenas em pt-BR)
    let slug = value.toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');

    setFormData(prev => ({
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    
    // Nome do arquivo: Usa o ID da categoria se estiver editando, senão usa um prefixo temporário
    const prefix = categoryId || 'new';
    const fileName = `categories/${prefix}-${Date.now()}.${fileExt}`;
    
    try {
      // 1. Upload da imagem
      const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(fileName, file);
      if (uploadError) throw uploadError;

      // 2. Pegar URL pública
      const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
      
      // 3. Salvar no estado local
      setFormData(prev => ({ ...prev, imageUrl: publicUrlData.publicUrl }));
      
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Erro ao enviar imagem.');
    } finally {
      setUploading(false);
      e.target.value = ''; 
    }
  };

  const handleImageDelete = async () => {
    if (!formData.imageUrl) return;

    // Remove do Storage
    try {
        const pathSegments = formData.imageUrl.split(`${BUCKET_NAME}/`);
        const imagePath = pathSegments.length > 1 ? pathSegments[1] : null;

        if (imagePath) {
            await supabase.storage.from(BUCKET_NAME).remove([imagePath]);
        }
    } catch (error) {
        console.warn('Could not delete file from storage:', error);
    }

    // Remove do estado local
    setFormData(prev => ({ ...prev, imageUrl: '' }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const translations = formData.translations;
    if (!translations['pt-BR'].name || !translations['pt-BR'].slug) {
      alert('Preencha pelo menos o Nome e Slug em Português.');
      setLoading(false);
      return;
    }

    try {
      let currentCategoryId = categoryId;

      // 1. Salva/Atualiza a Categoria principal
      const categoryData = { image_url: formData.imageUrl };
      
      if (isEdit) {
        const { error: updateError } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', categoryId);
        if (updateError) throw updateError;
        currentCategoryId = categoryId;
      } else {
        const { data: newCategory, error: insertError } = await supabase
          .from('categories')
          .insert(categoryData)
          .select()
          .single();
        if (insertError) throw insertError;
        currentCategoryId = newCategory.id;
      }

      if (!currentCategoryId) throw new Error('ID da categoria não encontrado');

      // 2. Prepara e salva as Traduções
      const translationsToUpsert = Object.entries(translations)
        .filter(([_, translation]) => translation.name)
        .map(([langCode, translation]) => ({
          category_id: currentCategoryId,
          language_code: langCode,
          name: translation.name,
          slug: translation.slug || translations['pt-BR'].slug
        }));

      const { error: upsertError } = await supabase
        .from('category_translations')
        .upsert(translationsToUpsert, { onConflict: 'category_id, language_code' });

      if (upsertError) throw upsertError;

      alert(`Categoria ${isEdit ? 'atualizada' : 'criada'} com sucesso!`);
      router.push('/admin/categories'); 

    } catch (error) {
      console.error('Error saving category:', error);
      alert('Erro ao salvar categoria. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };
  

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-verde-principal" />
      </div>
    );
  }

  const translations = formData.translations[activeTab];

  return (
    <div className="min-h-screen">
      <form onSubmit={handleSave}>
        {/* Header Fixo - Botão Salvar */}
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/admin/categories" className="flex items-center space-x-2 text-gray-600 hover:text-verde-principal transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Voltar</span>
              </Link>
              <h1 className="text-2xl font-bold text-verde-principal">
                {isEdit ? 'Editar Categoria' : 'Nova Categoria'}
              </h1>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 bg-verde-principal text-white px-4 py-2 rounded-lg hover:bg-verde-secundario transition-colors disabled:opacity-50 shadow-lg"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                <span>Salvar</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Conteúdo do Formulário */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-xl shadow-md p-8">

              {/* --- Seção de Imagem de Destaque --- */}
              <div className="mb-8 border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Imagem de Destaque (Home)</h3>
                <div className="flex flex-col gap-3">
                  {formData.imageUrl ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden group border-2">
                       <Image 
                          src={formData.imageUrl} 
                          alt="Pré-visualização da Categoria" 
                          fill 
                          className="object-cover" 
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <button type="button" onClick={handleImageDelete}
                          className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full transition-opacity shadow-md"
                          aria-label="Excluir imagem">
                          <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  ) : (
                    <label htmlFor="categoryImageUpload" className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      {uploading ? (<Loader2 className="w-8 h-8 animate-spin text-verde-principal" />) : (
                        <><Upload className="w-8 h-8 text-gray-500 mb-1" /><span className="text-sm text-gray-600">Enviar Imagem</span></>
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
                  <p className="text-xs text-gray-500">Recomendado: Imagem de paisagem (proporção 4:3). Esta imagem é usada no acordeão da Home.</p>
                </div>
              </div>

              {/* Traduções */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Traduções</h3>
                {/* Abas */}
                <div className="flex space-x-2 mb-6 border-b">
                  {[{ code: 'pt-BR' as const, label: 'Português' }, { code: 'en-US' as const, label: 'English' }, { code: 'es-ES' as const, label: 'Español' }]
                  .map(lang => (
                    <button key={lang.code} type="button" onClick={() => setActiveTab(lang.code)}
                      className={`px-4 py-2 font-medium transition-colors ${
                        activeTab === lang.code ? 'border-b-2 border-verde-principal text-verde-principal' : 'text-gray-500 hover:text-gray-700'
                      }`}>
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
                      value={translations.name}
                      onChange={(e) => updateTranslation('name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Slug (URL)</label>
                    <input
                      type="text"
                      value={translations.slug}
                      onChange={(e) => updateTranslation('slug', e.target.value)}
                      disabled={activeTab !== 'pt-BR'} 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent disabled:bg-gray-100"
                    />
                    {activeTab !== 'pt-BR' && <p className="text-xs text-gray-500 mt-1">O Slug é definido na aba Português.</p>}
                  </div>
                </div>
              </div>
            </div>
        </div>
      </form>
    </div>
  );
};