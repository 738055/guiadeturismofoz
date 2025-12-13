'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, ComboImage } from '@/lib/supabase';
import { Save, Loader2, ArrowLeft, Plus, Trash2, Check, Upload, Star, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

type TranslationData = { title: string; description: string; whatsIncluded: string[]; };
type FormData = {
  basePrice: string;
  oldPrice: string;
  isActive: boolean;
  translations: { 'pt-BR': TranslationData; 'en-US': TranslationData; 'es-ES': TranslationData; };
};

// Props opcionais para permitir edição futura (se passar comboId)
export const AdminComboForm: React.FC<{ comboId?: string }> = ({ comboId }) => {
  const router = useRouter();
  const isEdit = !!comboId;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [activeTab, setActiveTab] = useState<'pt-BR' | 'en-US' | 'es-ES'>('pt-BR');
  const [includeInput, setIncludeInput] = useState('');
  
  // Estado de Imagens
  const [images, setImages] = useState<ComboImage[]>([]);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    basePrice: '', oldPrice: '', isActive: true,
    translations: {
      'pt-BR': { title: '', description: '', whatsIncluded: [] },
      'en-US': { title: '', description: '', whatsIncluded: [] },
      'es-ES': { title: '', description: '', whatsIncluded: [] }
    }
  });

  // Carregar dados se for edição (Placeholder para o futuro)
  useEffect(() => {
    if (isEdit && comboId) {
        // Lógica de carregar combo existente iria aqui
        // Lembre-se de preencher setImages com os dados do banco
        loadCombo(comboId);
    }
  }, [comboId, isEdit]);

  const loadCombo = async (id: string) => {
      // Implementação futura de edição
      setLoadingData(false); 
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        let currentComboId = comboId;

        // 1. Criar ou Atualizar Combo
        const comboData = {
            base_price: parseFloat(formData.basePrice) || 0,
            old_price: formData.oldPrice ? parseFloat(formData.oldPrice) : null,
            is_active: formData.isActive
        };

        if (isEdit && comboId) {
            await supabase.from('combos').update(comboData).eq('id', comboId);
        } else {
            const { data, error } = await supabase.from('combos').insert(comboData).select().single();
            if (error) throw error;
            currentComboId = data.id;
        }

        if (!currentComboId) throw new Error("Falha ao obter ID do combo");

        // 2. Salvar Traduções
        const translations = Object.entries(formData.translations).map(([lang, data]) => ({
            combo_id: currentComboId,
            language_code: lang, 
            title: data.title,
            description: data.description,
            whats_included: JSON.stringify(data.whatsIncluded)
        }));

        const { error: transError } = await supabase.from('combo_translations').upsert(translations, { onConflict: 'combo_id, language_code' });
        if (transError) throw transError;
        
        // Se for criação e tiver imagens carregadas (que precisam ser vinculadas), isso seria feito aqui
        // Mas no fluxo atual, só permitimos upload DEPOIS de criar o combo (igual Tours), 
        // ou se já tivermos o ID.
        
        alert(isEdit ? 'Combo atualizado!' : 'Combo criado com sucesso! Agora você pode adicionar imagens.');
        
        if (!isEdit) {
            // Redireciona para a lista ou para modo edição (se implementado)
            // Por enquanto, vamos para a lista
            router.push('/admin/combos'); 
        }
    } catch (error) {
        console.error(error);
        alert('Erro ao salvar combo.');
    } finally {
        setLoading(false);
    }
  };

  // --- LÓGICA DE IMAGENS ---

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Só permite upload se tiver um ID (modo edição ou após salvar)
    // Como este form é de criação por padrão, vamos alertar o usuário.
    // **Nota:** Para funcionar 100% igual ao TourForm, o ideal seria salvar o combo primeiro ou ter a página de edição.
    if (!comboId) { 
        alert('Salve o combo primeiro para habilitar o upload de imagens.'); 
        e.target.value = '';
        return; 
    }
    
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    const files = Array.from(e.target.files);

    try {
      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${comboId}-${Date.now()}.${fileExt}`;
        // Usa bucket 'combos' (certifique-se de criar no Supabase)
        const { error: uploadError } = await supabase.storage.from('combos').upload(fileName, file);
        if (uploadError) throw uploadError;
        
        const { data: publicUrlData } = supabase.storage.from('combos').getPublicUrl(fileName);
        const imageUrl = publicUrlData.publicUrl;
        
        const currentMaxOrder = images.reduce((max, img) => Math.max(max, img.display_order || 0), 0); 
        
        const { data: newImageData, error: insertError } = await supabase
          .from('combo_images')
          .insert({ 
              combo_id: comboId, 
              image_url: imageUrl, 
              display_order: currentMaxOrder + 1, 
              is_cover: false 
          })
          .select().single();
          
        if (insertError) throw insertError;
        return newImageData as ComboImage;
      });
      
      const newImages = await Promise.all(uploadPromises);
      setImages(prev => [...prev, ...newImages]);
    } catch (error) { 
        console.error('Error uploading images:', error); 
        alert('Erro ao enviar imagem. Verifique se o bucket "combos" existe e é público.'); 
    } finally { 
        setUploading(false); 
        e.target.value = ''; 
    }
  };

  const handleSetCover = async (image: ComboImage) => {
    if (!comboId) return;
    // Otimista
    setImages(prev => prev.map(img => ({ ...img, is_cover: img.id === image.id })));
    try {
        await supabase.from('combo_images').update({ is_cover: false }).eq('combo_id', comboId);
        await supabase.from('combo_images').update({ is_cover: true }).eq('id', image.id);
    } catch (err) {
        console.error("Erro ao definir capa", err);
    }
  };

  const handleImageDelete = async (image: ComboImage) => {
    if (!confirm('Tem certeza?')) return;
    try {
      const imagePath = image.image_url.split('/combos/').pop();
      if (imagePath) await supabase.storage.from('combos').remove([imagePath]);
      await supabase.from('combo_images').delete().eq('id', image.id);
      setImages(prev => prev.filter(img => img.id !== image.id));
    } catch (error) { console.error('Error deleting image:', error); }
  };

  // --- HANDLERS DE FORMULÁRIO ---

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

  const removeFeature = (idx: number) => {
      updateTrans('whatsIncluded', formData.translations[activeTab].whatsIncluded.filter((_, i) => i !== idx));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow sticky top-0 z-10 p-4">
         <div className="max-w-4xl mx-auto flex justify-between items-center">
             <Link href="/admin/combos" className="flex items-center text-gray-600 hover:text-verde-principal transition-colors">
                <ArrowLeft className="mr-2"/> Voltar
             </Link>
             <h1 className="text-xl font-bold text-gray-800">{isEdit ? 'Editar Combo' : 'Novo Combo'}</h1>
             <button onClick={handleSave} disabled={loading} className="bg-verde-principal text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-verde-secundario transition-colors shadow-md">
                 {loading ? <Loader2 className="animate-spin w-5 h-5"/> : <Save className="w-5 h-5"/>} Salvar
             </button>
         </div>
      </div>

      <div className="max-w-4xl mx-auto mt-8 px-4 space-y-6">
          {/* Informações Básicas */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Definição de Preços e Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Preço Final (R$)</label>
                      <input type="number" step="0.01" className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-verde-principal outline-none transition-all" value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: e.target.value})} placeholder="0.00" />
                  </div>
                  <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Preço Original "De" (Opcional)</label>
                      <input type="number" step="0.01" className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-verde-principal outline-none transition-all" value={formData.oldPrice} onChange={e => setFormData({...formData, oldPrice: e.target.value})} placeholder="0.00" />
                  </div>
              </div>
              <div className="mt-4 flex items-center">
                  <input type="checkbox" id="isActive" className="w-4 h-4 text-verde-principal rounded border-gray-300 focus:ring-verde-principal" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
                  <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700 cursor-pointer">Combo Ativo no Site</label>
              </div>
          </div>

          {/* Galeria de Imagens (Só exibe se tiver ID) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-2 border-b pb-2">Galeria de Imagens</h3>
              <p className="text-sm text-gray-500 mb-4">Clique na estrela para definir a capa.</p>
              
              {images.length > 0 && (
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                   {images.map(image => (
                     <div key={image.id} className={`relative group aspect-square border-2 rounded-lg overflow-hidden ${image.is_cover ? 'border-yellow-400' : 'border-transparent'}`}>
                       <Image src={image.image_url} alt="Combo Imagem" fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                       
                       <button 
                         type="button" 
                         onClick={() => handleSetCover(image)}
                         className={`absolute top-2 left-2 p-1.5 rounded-full shadow-sm transition-colors ${image.is_cover ? 'bg-yellow-400 text-white' : 'bg-white/80 text-gray-400 hover:text-yellow-400'}`}
                         title="Definir como capa"
                       >
                         <Star className={`w-4 h-4 ${image.is_cover ? 'fill-current' : ''}`} />
                       </button>

                       <button type="button" onClick={() => handleImageDelete(image)} className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700">
                         <Trash2 className="w-4 h-4" />
                       </button>
                       
                       {image.is_cover && (
                           <div className="absolute bottom-0 inset-x-0 bg-yellow-400/90 text-white text-xs text-center py-1 font-bold">
                               CAPA
                           </div>
                       )}
                     </div>
                   ))}
                 </div>
               )}

              <label className={`block w-full border-2 border-dashed p-8 text-center cursor-pointer rounded-lg transition-colors ${!comboId ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:bg-gray-50 border-gray-300'}`}>
                  {uploading ? (<Loader2 className="animate-spin mx-auto text-verde-principal"/>) : (
                    <>
                        <Upload className="mx-auto mb-2 text-gray-400"/>
                        <span className="text-gray-500 font-medium">Clique para enviar imagens</span>
                    </>
                  )}
                  <input id="imageUpload" type="file" multiple className="hidden" onChange={handleImageUpload} disabled={uploading || !comboId} /> 
              </label>
              {!comboId && <p className="text-xs text-amber-600 mt-2 text-center">Salve o combo primeiro para habilitar o upload de imagens.</p>}
          </div>

          {/* Traduções */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex gap-4 border-b mb-6">
                  {(['pt-BR', 'en-US', 'es-ES'] as const).map(lang => (
                      <button key={lang} onClick={() => setActiveTab(lang)} className={`pb-2 px-2 transition-colors ${activeTab === lang ? 'border-b-2 border-verde-principal text-verde-principal font-bold' : 'text-gray-500 hover:text-gray-700'}`}>
                          {lang}
                      </button>
                  ))}
              </div>
              
              <div className="space-y-5">
                  <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Título do Combo</label>
                      <input type="text" className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-verde-principal outline-none" value={formData.translations[activeTab].title} onChange={e => updateTrans('title', e.target.value)} placeholder="Ex: Pacote Cataratas + Parque das Aves" />
                  </div>
                  <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Descrição Curta</label>
                      <textarea rows={3} className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-verde-principal outline-none" value={formData.translations[activeTab].description} onChange={e => updateTrans('description', e.target.value)} placeholder="Descrição atrativa para o card..." />
                  </div>
                  <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Itens Incluídos no Pacote</label>
                      <div className="flex gap-2 mb-3">
                          <input type="text" className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-verde-principal outline-none" value={includeInput} onChange={e => setIncludeInput(e.target.value)} placeholder="Ex: Transporte Ida e Volta" />
                          <button type="button" onClick={addFeature} className="bg-verde-principal text-white px-3 py-2 rounded-lg hover:bg-verde-secundario transition-colors"><Plus size={20}/></button>
                      </div>
                      <ul className="space-y-2">
                          {formData.translations[activeTab].whatsIncluded.map((item, i) => (
                              <li key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm group hover:border-gray-300 transition-colors">
                                  <span className="flex items-center gap-2 text-gray-700"><Check className="w-4 h-4 text-green-500"/> {item}</span>
                                  <button onClick={() => removeFeature(i)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={16}/></button>
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