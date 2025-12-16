'use client'; 

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft, Save, Loader2, Upload, X
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

type TranslationData = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
};

type LanguageCode = 'pt-BR' | 'en-US' | 'es-ES';

type FormData = {
  isActive: boolean;
  imageUrl: string;
  translations: {
    'pt-BR': TranslationData;
    'en-US': TranslationData;
    'es-ES': TranslationData;
  };
};

const initialFormData: FormData = {
  isActive: true,
  imageUrl: '',
  translations: {
    'pt-BR': { title: '', slug: '', excerpt: '', content: '' },
    'en-US': { title: '', slug: '', excerpt: '', content: '' },
    'es-ES': { title: '', slug: '', excerpt: '', content: '' }
  }
};

export const AdminPostForm: React.FC<{ postId?: string }> = ({ postId }) => {
  const router = useRouter();
  const isEdit = !!postId;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [activeTab, setActiveTab] = useState<LanguageCode>('pt-BR');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      loadPost();
    }
  }, [postId, isEdit]);

  const loadPost = async () => {
    if (!postId) return;
    try {
      setLoadingData(true);
      const { data: post, error: postError } = await supabase
        .from('posts')
        .select(`
          *,
          post_translations (*)
        `) 
        .eq('id', postId)
        .maybeSingle();

      if (postError) throw postError;
      if (!post) {
        alert('Post não encontrado');
        router.push('/admin/posts');
        return;
      }

      const translations = { ...initialFormData.translations };
      post.post_translations.forEach((t: any) => {
        const langCode = (t.language_code === 'pt_BR' ? 'pt-BR' : t.language_code) as LanguageCode; 
        if (translations[langCode]) {
          translations[langCode] = {
            title: t.title, slug: t.slug, excerpt: t.excerpt || '', content: t.content || ''
          };
        }
      });

      setFormData({
        isActive: post.is_active, 
        imageUrl: post.image_url || '',
        translations: translations as FormData['translations'] 
      });

    } catch (error) {
      console.error('Error loading post:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const postData = {
        is_active: formData.isActive,
        image_url: formData.imageUrl,
        updated_at: new Date().toISOString()
      };

      let currentPostId = postId;

      if (isEdit) {
        const { error: updateError } = await supabase.from('posts').update(postData).eq('id', postId);
        if (updateError) throw updateError;
      } else {
        const { data: newPost, error: insertError } = await supabase.from('posts').insert(postData).select().single();
        if (insertError) throw insertError;
        currentPostId = newPost.id;
      }

      if (!currentPostId) throw new Error('ID do post não encontrado');

      const translationsToUpsert = Object.entries(formData.translations).map(([langCode, translation]) => ({
        post_id: currentPostId, 
        language_code: langCode, 
        title: translation.title,
        slug: translation.slug || translation.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        excerpt: translation.excerpt, 
        content: translation.content
      }));
      
      const { error: upsertError } = await supabase.from('post_translations').upsert(translationsToUpsert, { onConflict: 'post_id, language_code' });
      if (upsertError) throw upsertError;
      
      alert('Post salvo com sucesso!');
      router.push('/admin/posts');

    } catch (error) {
      console.error('Error saving post:', error);
      alert('Erro ao salvar post. Verifique se o slug é único.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    const file = e.target.files[0];
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `blog-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // Envia para o bucket 'blog'
      const { error: uploadError } = await supabase.storage.from('blog').upload(filePath, file);
      if (uploadError) throw uploadError;
      
      const { data: publicUrlData } = supabase.storage.from('blog').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, imageUrl: publicUrlData.publicUrl }));
      
    } catch (error) { 
      console.error('Error uploading image:', error); 
      alert('Erro ao enviar imagem. Verifique se o bucket "blog" existe e tem permissão.'); 
    } finally { 
      setUploading(false); 
      e.target.value = ''; 
    }
  };

  const updateTranslation = (field: keyof TranslationData, value: string) => {
    setFormData(prev => ({ ...prev, translations: { ...prev.translations, [activeTab]: { ...prev.translations[activeTab], [field]: value } } }));
  };

  const autoGenerateSlug = () => {
      const currentTitle = formData.translations[activeTab].title;
      const slug = currentTitle.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove acentos
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');
      updateTranslation('slug', slug);
  };

  if (loadingData) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-verde-principal" /></div>;

  return (
    <div className="min-h-screen">
      <form onSubmit={handleSave}>
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/admin/posts" className="flex items-center space-x-2 text-gray-600 hover:text-verde-principal transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Voltar</span>
              </Link>
              <h1 className="text-2xl font-bold text-verde-principal">{isEdit ? 'Editar Informação' : 'Nova Informação'}</h1>
              <button type="submit" disabled={loading} className="flex items-center space-x-2 bg-verde-principal text-white px-4 py-2 rounded-lg hover:bg-verde-secundario transition-colors disabled:opacity-50 shadow-lg">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                <span>Salvar</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Configurações Gerais</h3>
              <div className="flex items-center space-x-6 mb-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-5 h-5 text-verde-principal focus:ring-verde-principal border-gray-300 rounded" />
                    <span className="text-base font-medium text-gray-700">Publicado / Ativo</span>
                  </label>
              </div>

              {/* Upload de Imagem de Capa */}
              <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Imagem de Capa (Principal)</label>
                  <div className="flex items-start gap-4">
                      {formData.imageUrl && (
                          <div className="relative w-40 h-40 rounded-lg overflow-hidden border">
                              <Image src={formData.imageUrl} alt="Capa" fill className="object-cover" />
                              <button type="button" onClick={() => setFormData({...formData, imageUrl: ''})} className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full">
                                  <X className="w-4 h-4" />
                              </button>
                          </div>
                      )}
                      <label className="flex flex-col items-center justify-center w-40 h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        {uploading ? (<Loader2 className="w-8 h-8 animate-spin text-verde-principal" />) : (
                            <><Upload className="w-6 h-6 text-gray-400 mb-2" /><span className="text-xs text-center text-gray-500 px-2">Alterar Capa</span></>
                        )}
                        <input type="file" className="hidden" onChange={handleImageUpload} disabled={uploading} /> 
                      </label>
                  </div>
              </div>
            </div>

            {/* Traduções e Conteúdo */}
            <div className="mt-8 border-t pt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Conteúdo (Multilíngue)</h3>
              
              <div className="flex space-x-2 mb-6 border-b">
                 {[{ code: 'pt-BR' as const, label: 'Português' }, { code: 'en-US' as const, label: 'English' }, { code: 'es-ES' as const, label: 'Español' }]
                 .map(lang => (
                   <button key={lang.code} type="button" onClick={() => setActiveTab(lang.code)} className={`px-4 py-2 font-medium transition-colors ${activeTab === lang.code ? 'border-b-2 border-verde-principal text-verde-principal' : 'text-gray-500 hover:text-gray-700'}`}>
                     {lang.label}
                   </button>
                 ))}
               </div>

              <div className="space-y-6">
                <div> 
                   <label className="block text-sm font-medium text-gray-700 mb-2">Título do Post</label>
                   <input type="text" value={formData.translations[activeTab].title} onChange={(e) => updateTranslation('title', e.target.value)} onBlur={autoGenerateSlug} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent text-lg font-medium" placeholder="Ex: Melhores horários para visitar as Cataratas" />
                 </div>
                 
                 <div> 
                   <label className="block text-sm font-medium text-gray-700 mb-2">URL Amigável (Slug)</label>
                   <div className="flex items-center">
                     <span className="text-gray-400 bg-gray-50 border border-r-0 border-gray-300 px-3 py-2 rounded-l-lg">/informacoes/</span>
                     <input type="text" value={formData.translations[activeTab].slug} onChange={(e) => updateTranslation('slug', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent" placeholder="minha-noticia-incrivel" />
                   </div>
                   <p className="text-xs text-gray-500 mt-1">Gerado automaticamente a partir do título. Deve ser único para cada idioma.</p>
                 </div>

                 <div> 
                   <label className="block text-sm font-medium text-gray-700 mb-2">Resumo (Excerpt)</label>
                   <textarea rows={3} value={formData.translations[activeTab].excerpt} onChange={(e) => updateTranslation('excerpt', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent" placeholder="Um breve resumo que aparecerá na listagem..." />
                 </div>

                 <div> 
                   <label className="block text-sm font-medium text-gray-700 mb-2">Conteúdo Completo (Markdown/HTML Simples)</label>
                   <textarea rows={15} value={formData.translations[activeTab].content} onChange={(e) => updateTranslation('content', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent font-mono text-sm" placeholder="Escreva aqui o conteúdo completo..." />
                   <p className="text-xs text-gray-500 mt-2">Dica: Você pode usar HTML básico ou Markdown para formatar o texto.</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};