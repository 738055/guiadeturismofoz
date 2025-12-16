'use client'; 

import React, { useState, useEffect, useMemo } from 'react'; // Adicionado useMemo
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Save, Loader2, Upload, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Importação dinâmica do ReactQuill para evitar erro de SSR (Server Side Rendering)
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css'; // Estilos do editor

const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="h-64 w-full bg-gray-100 animate-pulse rounded-lg" />
});

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

  // Configuração da barra de ferramentas do Editor
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'clean'] // 'image' removido para evitar base64 pesado, use a imagem de capa ou upload separado se precisar
    ],
  }), []);

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
        .select(`*, post_translations (*)`) 
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
            title: t.title, 
            slug: t.slug, 
            excerpt: t.excerpt || '', 
            content: t.content || ''
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
      alert('Erro ao salvar. Verifique se todos os campos estão preenchidos.');
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
      
      const { error: uploadError } = await supabase.storage.from('blog').upload(filePath, file);
      if (uploadError) throw uploadError;
      
      const { data: publicUrlData } = supabase.storage.from('blog').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, imageUrl: publicUrlData.publicUrl }));
      
    } catch (error) { 
      console.error('Error uploading image:', error); 
      alert('Erro ao enviar imagem. Verifique o bucket "blog".'); 
    } finally { 
      setUploading(false); 
      e.target.value = ''; 
    }
  };

  const updateTranslation = (field: keyof TranslationData, value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      translations: { 
        ...prev.translations, 
        [activeTab]: { ...prev.translations[activeTab], [field]: value } 
      } 
    }));
  };

  const autoGenerateSlug = () => {
      const currentTitle = formData.translations[activeTab].title;
      const slug = currentTitle.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');
      updateTranslation('slug', slug);
  };

  if (loadingData) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-verde-principal" /></div>;

  return (
    <div className="min-h-screen pb-20">
      <form onSubmit={handleSave}>
        {/* Header fixo */}
        <div className="bg-white shadow-sm sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/admin/posts" className="flex items-center space-x-2 text-gray-600 hover:text-verde-principal transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Voltar</span>
              </Link>
              <h1 className="text-2xl font-bold text-verde-principal">{isEdit ? 'Editar Post' : 'Novo Post'}</h1>
              <button type="submit" disabled={loading} className="flex items-center space-x-2 bg-verde-principal text-white px-4 py-2 rounded-lg hover:bg-verde-secundario transition-colors disabled:opacity-50 shadow-lg">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                <span>Salvar</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-md p-8">
            
            {/* Configurações Gerais */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-8 border-b pb-8">
               <div className="md:col-span-1">
                 <h3 className="text-lg font-semibold text-gray-800 mb-2">Capa & Status</h3>
                 <p className="text-sm text-gray-500 mb-4">Defina a imagem principal e se o post está visível.</p>
                 
                 <label className="flex items-center space-x-2 cursor-pointer mb-6 p-3 bg-gray-50 rounded-lg border">
                    <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-5 h-5 text-verde-principal rounded" />
                    <span className="font-medium text-gray-700">Post Publicado</span>
                 </label>

                 <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Imagem de Capa</label>
                    <div className="relative aspect-video w-full bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 hover:border-verde-principal transition-colors group">
                        {formData.imageUrl ? (
                            <>
                              <Image src={formData.imageUrl} alt="Capa" fill className="object-cover" />
                              <button type="button" onClick={() => setFormData({...formData, imageUrl: ''})} className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 z-10">
                                  <X className="w-4 h-4" />
                              </button>
                            </>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 group-hover:text-verde-principal">
                                {uploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8 mb-2" />}
                                <span className="text-sm">Clique para enviar</span>
                            </div>
                        )}
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} disabled={uploading} />
                    </div>
                 </div>
               </div>

               {/* Editor de Conteúdo */}
               <div className="md:col-span-2">
                 <div className="flex space-x-2 mb-6 border-b">
                   {[{ code: 'pt-BR', label: 'Português' }, { code: 'en-US', label: 'English' }, { code: 'es-ES', label: 'Español' }]
                   .map((lang: any) => (
                     <button key={lang.code} type="button" onClick={() => setActiveTab(lang.code)} className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === lang.code ? 'border-verde-principal text-verde-principal' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                       {lang.label}
                     </button>
                   ))}
                 </div>

                 <div className="space-y-6">
                   <div> 
                     <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                     <input type="text" value={formData.translations[activeTab].title} onChange={(e) => updateTranslation('title', e.target.value)} onBlur={autoGenerateSlug} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent text-lg font-bold text-gray-800" placeholder="Título do artigo..." />
                   </div>
                   
                   <div className="grid grid-cols-1 gap-4">
                     <div> 
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL (Slug)</label>
                        <input type="text" value={formData.translations[activeTab].slug} onChange={(e) => updateTranslation('slug', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-600" />
                     </div>
                     <div> 
                        <label className="block text-sm font-medium text-gray-700 mb-1">Resumo (Para listagem)</label>
                        <textarea rows={2} value={formData.translations[activeTab].excerpt} onChange={(e) => updateTranslation('excerpt', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Breve descrição que aparece no card..." />
                     </div>
                   </div>

                   <div> 
                     <label className="block text-sm font-medium text-gray-700 mb-2">Conteúdo do Artigo</label>
                     <div className="bg-white">
                        <ReactQuill 
                          theme="snow" 
                          value={formData.translations[activeTab].content} 
                          onChange={(content) => updateTranslation('content', content)} 
                          modules={modules}
                          className="h-96 mb-12" // mb-12 para dar espaço para a barra de status do quill se houver
                        />
                     </div>
                   </div>
                 </div>
               </div>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminPostForm;