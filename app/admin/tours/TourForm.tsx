// guiadeturismofoz/app/admin/tours/TourForm.tsx
'use client'; 

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft, Save, Loader2, Trash2, Upload, X, Check, Plus, Calendar as CalendarIcon, Star
} from 'lucide-react';
import Link from 'next/link';
import { TourImage } from '@/lib/supabase';
import Image from 'next/image';

type TranslationData = {
  title: string;
  description: string;
  whatsIncluded: string[];
  whatsExcluded: string[];
};

type LanguageCode = 'pt-BR' | 'en-US' | 'es-ES';

type FormData = {
  basePrice: string;
  durationHours: string;
  location: string;
  isActive: boolean;
  isWomenExclusive: boolean; 
  isFeatured: boolean; 
  translations: {
    'pt-BR': TranslationData;
    'en-US': TranslationData;
    'es-ES': TranslationData;
  };
};

const initialFormData: FormData = {
  basePrice: '',
  durationHours: '',
  location: '',
  isActive: true,
  isWomenExclusive: false,
  isFeatured: false, 
  translations: {
    'pt-BR': { title: '', description: '', whatsIncluded: [], whatsExcluded: [] },
    'en-US': { title: '', description: '', whatsIncluded: [], whatsExcluded: [] },
    'es-ES': { title: '', description: '', whatsIncluded: [], whatsExcluded: [] }
  }
};

type CategoryOption = { id: string; name: string; };

export const AdminTourForm: React.FC<{ tourId?: string }> = ({ tourId }) => {
  const router = useRouter();
  const isEdit = !!tourId;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [activeTab, setActiveTab] = useState<LanguageCode>('pt-BR');
  const [images, setImages] = useState<TourImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [disabledDays, setDisabledDays] = useState<number[]>([]);
  const [specificDisabledDates, setSpecificDisabledDates] = useState<string[]>([]);
  const [dateInput, setDateInput] = useState('');
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [includeInput, setIncludeInput] = useState('');
  const [excludeInput, setExcludeInput] = useState('');

  useEffect(() => {
    loadCategories();
    if (isEdit) {
      loadTour();
    }
  }, [tourId, isEdit]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select(`id, category_translations!inner(name, language_code)`)
        .eq('category_translations.language_code', 'pt-BR'); 
      if (error) throw error;
      if (data) {
        const categoryOptions = data.map((c: any) => ({ 
             id: c.id, 
             name: c.category_translations.find((t: any) => t.language_code === 'pt-BR')?.name || 'Sem nome'
        }));
        setCategories(categoryOptions);
      }
    } catch (error) { console.error('Error loading categories:', error); }
  };

  const loadTour = async () => {
    if (!tourId) return;
    try {
      setLoadingData(true);
      const { data: tour, error: tourError } = await supabase
        .from('tours')
        .select(`
          *,
          tour_translations (*),
          tour_images (*)
        `) 
        .eq('id', tourId)
        .order('display_order', { referencedTable: 'tour_images', ascending: true })
        .maybeSingle();

      if (tourError) throw tourError;
      if (!tour) {
        alert('Passeio não encontrado');
        router.push('/admin/tours');
        return;
      }

      const translations = { ...initialFormData.translations };
      tour.tour_translations.forEach((t: any) => {
        const langCode = (t.language_code === 'pt_BR' ? 'pt-BR' : t.language_code) as LanguageCode; 
        if (translations[langCode]) {
          const included = Array.isArray(t.whats_included) ? t.whats_included : (t.whats_included ? [t.whats_included] : []);
          const excluded = Array.isArray(t.whats_excluded) ? t.whats_excluded : (t.whats_excluded ? [t.whats_excluded] : []);
          translations[langCode] = {
            title: t.title, description: t.description, whatsIncluded: included, whatsExcluded: excluded
          };
        }
      });

      setFormData({
        basePrice: tour.base_price.toString(), 
        durationHours: tour.duration_hours.toString(),
        location: tour.location, 
        isActive: tour.is_active, 
        isWomenExclusive: tour.is_women_exclusive || false, 
        isFeatured: tour.is_featured || false, 
        translations: translations as FormData['translations'] 
      });

      setCategoryId(tour.category_id);
      setImages(tour.tour_images || []);
      setDisabledDays(tour.disabled_week_days || []);
      setSpecificDisabledDates(tour.disabled_specific_dates || []);

    } catch (error) {
      console.error('Error loading tour:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const tourData = {
        base_price: parseFloat(formData.basePrice) || 0,
        duration_hours: parseInt(formData.durationHours) || 0,
        location: formData.location,
        is_active: formData.isActive,
        is_women_exclusive: formData.isWomenExclusive, 
        is_featured: formData.isFeatured, 
        category_id: categoryId,
        disabled_week_days: disabledDays,
        disabled_specific_dates: specificDisabledDates
      };

      let currentTourId = tourId;

      if (isEdit) {
        const { error: updateError } = await supabase.from('tours').update(tourData).eq('id', tourId);
        if (updateError) throw updateError;
      } else {
        const { data: newTour, error: insertError } = await supabase.from('tours').insert(tourData).select().single();
        if (insertError) throw insertError;
        currentTourId = newTour.id;
      }

      if (!currentTourId) throw new Error('ID do passeio não encontrado');

      const translationsToUpsert = Object.entries(formData.translations).map(([langCode, translation]) => ({
        tour_id: currentTourId, language_code: langCode, title: translation.title,
        description: translation.description, whats_included: translation.whatsIncluded, whats_excluded: translation.whatsExcluded
      }));
      const { error: upsertError } = await supabase.from('tour_translations').upsert(translationsToUpsert, { onConflict: 'tour_id, language_code' });
      if (upsertError) throw upsertError;
      
      alert('Passeio salvo com sucesso!');
      router.push('/admin/tours');

    } catch (error) {
      console.error('Error saving tour:', error);
      alert('Erro ao salvar passeio.');
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers Auxiliares ---

  const handleSetCover = async (image: TourImage) => {
    // 1. Atualização Otimista
    const updatedImages = images.map(img => ({
        ...img,
        is_cover: img.id === image.id
    }));
    setImages(updatedImages);

    // 2. Atualização no Banco
    try {
        // Remove capa de todos deste tour
        await supabase.from('tour_images').update({ is_cover: false }).eq('tour_id', tourId);
        // Define nova capa
        await supabase.from('tour_images').update({ is_cover: true }).eq('id', image.id);
    } catch (err) {
        console.error("Erro ao definir capa", err);
        alert("Erro ao salvar capa no banco.");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEdit && !tourId) { alert('Você precisa salvar o passeio (Informações Gerais) antes de adicionar imagens.'); e.target.value = ''; return; }
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    const files = Array.from(e.target.files);
    
    let currentId = tourId;
    if (!currentId) return;

    try {
      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${currentId}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        const { error: uploadError } = await supabase.storage.from('tours').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from('tours').getPublicUrl(filePath);
        const imageUrl = publicUrlData.publicUrl;
        const currentMaxOrder = images.reduce((max, img) => Math.max(max, img.display_order || 0), 0); 
        
        // Define is_cover: false no insert
        const { data: newImageData, error: insertError } = await supabase
          .from('tour_images')
          .insert({ tour_id: currentId, image_url: imageUrl, alt_text: formData.translations['pt-BR'].title || 'Imagem', display_order: currentMaxOrder + 1, is_cover: false })
          .select().single();
        if (insertError) throw insertError;
        return newImageData as TourImage;
      });
      const newImages = await Promise.all(uploadPromises);
      setImages(prev => [...prev, ...newImages]);
    } catch (error) { console.error('Error uploading images:', error); alert('Erro ao enviar imagem.'); } finally { setUploading(false); e.target.value = ''; }
  };

  const handleImageDelete = async (image: TourImage) => {
    if (!confirm('Tem certeza?')) return;
    try {
      const imagePath = image.image_url.split('/tours/').pop();
      if (imagePath) await supabase.storage.from('tours').remove([imagePath]);
      await supabase.from('tour_images').delete().eq('id', image.id);
      setImages(prev => prev.filter(img => img.id !== image.id));
    } catch (error) { console.error('Error deleting image:', error); }
  };

  const updateTranslation = (field: keyof Omit<TranslationData, 'whatsIncluded' | 'whatsExcluded'>, value: string) => {
    setFormData(prev => ({ ...prev, translations: { ...prev.translations, [activeTab]: { ...prev.translations[activeTab], [field]: value } } }));
  };

  const handleDayToggle = (dayIndex: number) => {
    setDisabledDays(prev => prev.includes(dayIndex) ? prev.filter(d => d !== dayIndex) : [...prev, dayIndex].sort());
  };
  const handleAddSpecificDate = () => {
    if (dateInput && !specificDisabledDates.includes(dateInput)) { setSpecificDisabledDates(prev => [...prev, dateInput].sort()); setDateInput(''); }
  };
  const handleRemoveSpecificDate = (dateToRemove: string) => {
    setSpecificDisabledDates(prev => prev.filter(date => date !== dateToRemove));
  };
  const handleAddItem = (type: 'include' | 'exclude') => {
    const input = type === 'include' ? includeInput : excludeInput; const field = type === 'include' ? 'whatsIncluded' : 'whatsExcluded'; if (!input) return;
    setFormData(prev => ({ ...prev, translations: { ...prev.translations, [activeTab]: { ...prev.translations[activeTab], [field]: [...prev.translations[activeTab][field], input] } } }));
    if (type === 'include') setIncludeInput(''); else setExcludeInput('');
  };
  const handleRemoveItem = (type: 'include' | 'exclude', index: number) => {
    const field = type === 'include' ? 'whatsIncluded' : 'whatsExcluded';
    setFormData(prev => ({ ...prev, translations: { ...prev.translations, [activeTab]: { ...prev.translations[activeTab], [field]: prev.translations[activeTab][field].filter((_, i) => i !== index) } } }));
  };
  const weekDays = [ { label: 'Dom', index: 0 }, { label: 'Seg', index: 1 }, { label: 'Ter', index: 2 }, { label: 'Qua', index: 3 }, { label: 'Qui', index: 4 }, { label: 'Sex', index: 5 }, { label: 'Sáb', index: 6 }, ];

  if (loadingData) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-verde-principal" /></div>;

  return (
    <div className="min-h-screen">
      <form onSubmit={handleSave}>
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/admin/tours" className="flex items-center space-x-2 text-gray-600 hover:text-verde-principal transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Voltar</span>
              </Link>
              <h1 className="text-2xl font-bold text-verde-principal">{isEdit ? 'Editar Passeio' : 'Novo Passeio'}</h1>
              <button type="submit" disabled={loading} className="flex items-center space-x-2 bg-verde-principal text-white px-4 py-2 rounded-lg hover:bg-verde-secundario transition-colors disabled:opacity-50 shadow-lg">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                <span>Salvar</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-md p-8">
            {/* Informações Gerais */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Informações Gerais</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preço Base (R$)</label>
                  <input type="number" step="0.01" value={formData.basePrice} onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duração (horas)</label>
                  <input type="number" value={formData.durationHours} onChange={(e) => setFormData({ ...formData, durationHours: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Localização</label>
                  <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                  <select value={categoryId || ''} onChange={(e) => setCategoryId(e.target.value || null)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent">
                    <option value="">Nenhuma</option>
                    {categories.map(cat => ( <option key={cat.id} value={cat.id}>{cat.name}</option> ))}
                  </select>
                </div>
                <div className="flex items-end pb-2 space-x-6">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-4 h-4 text-verde-principal focus:ring-verde-principal border-gray-300 rounded" />
                    <span className="text-sm font-medium text-gray-700">Passeio Ativo</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" checked={formData.isWomenExclusive} onChange={(e) => setFormData({ ...formData, isWomenExclusive: e.target.checked })} className="w-4 h-4 text-acento-mulher focus:ring-acento-mulher border-gray-300 rounded" />
                    <span className="text-sm font-medium text-acento-mulher">Exclusivo Mulheres</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })} className="w-4 h-4 text-foz-amarelo focus:ring-foz-amarelo border-gray-300 rounded" />
                    <span className="text-sm font-medium text-foz-amarelo">Destaque na Home</span>
                  </label>
                </div>
              </div>
              
              <div className="mt-6">
                 <label className="block text-sm font-medium text-gray-700 mb-3">Dias da semana que o passeio NÃO funciona (recorrente)</label>
                 <div className="flex flex-wrap gap-2">
                   {weekDays.map(day => (
                     <button type="button" key={day.index} onClick={() => handleDayToggle(day.index)} className={`px-4 py-2 rounded-lg font-medium transition-colors ${disabledDays.includes(day.index) ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                       {day.label}
                     </button>
                   ))}
                 </div>
               </div>
              <div className="mt-6">
                 <label className="block text-sm font-medium text-gray-700 mb-3">Datas específicas que o passeio NÃO funciona (ex: feriados)</label>
                 <div className="flex gap-2">
                   <input type="date" value={dateInput} onChange={(e) => setDateInput(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent" />
                   <button type="button" onClick={handleAddSpecificDate} className="px-4 py-2 bg-verde-principal text-white rounded-lg font-medium hover:bg-verde-secundario">Adicionar</button>
                 </div>
                 {specificDisabledDates.length > 0 && (
                   <div className="flex flex-wrap gap-2 mt-4">
                     {specificDisabledDates.map(date => (
                       <div key={date} className="flex items-center gap-2 px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm">
                         {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                         <button type="button" onClick={() => handleRemoveSpecificDate(date)} className="text-red-600 hover:text-red-800"><X className="w-4 h-4" /></button>
                       </div>
                     ))}
                   </div>
                 )}
               </div>
            </div>

             <div className="mb-8 mt-8 border-t pt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2"><CalendarIcon className="w-5 h-5 text-verde-principal" /><span>Regra de Disponibilidade</span></h3>
                <p className="text-sm text-gray-700 leading-relaxed p-4 border rounded-lg bg-gray-50">
                  O sistema considera o passeio **disponível todos os dias nos próximos 90 dias**, exceto nos dias bloqueados acima.
                </p>
            </div>

            {/* Galeria de Imagens com Seleção de Capa */}
            <div className="mb-8 mt-8 border-t pt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Galeria de Imagens</h3>
              <p className="text-sm text-gray-500 mb-4">Clique na estrela para definir a foto de capa do produto.</p>
              
               {images.length > 0 && (
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                   {images.map(image => (
                     <div key={image.id} className={`relative group aspect-square border-2 rounded-lg overflow-hidden ${image.is_cover ? 'border-yellow-400' : 'border-transparent'}`}>
                       <Image src={image.image_url} alt={image.alt_text || 'Imagem'} fill className="object-cover" sizes="(max-width: 768px) 50vw, 33vw" />
                       
                       {/* Botão de Capa */}
                       <button 
                         type="button" 
                         onClick={() => handleSetCover(image)}
                         className={`absolute top-2 left-2 p-1.5 rounded-full shadow-sm transition-colors ${image.is_cover ? 'bg-yellow-400 text-white' : 'bg-white/80 text-gray-400 hover:text-yellow-400'}`}
                         title="Definir como capa"
                       >
                         <Star className={`w-4 h-4 ${image.is_cover ? 'fill-current' : ''}`} />
                       </button>

                       <button type="button" onClick={() => handleImageDelete(image)} className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Excluir imagem">
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
              <div>
                <label htmlFor="imageUpload" className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  {uploading ? (<Loader2 className="w-8 h-8 animate-spin text-verde-principal" />) : (
                    <><Upload className="w-8 h-8 text-gray-500 mb-2" /><span className="text-sm text-gray-600">Arraste ou clique para enviar (múltiplas)</span></>
                  )}
                  <input id="imageUpload" type="file" multiple className="opacity-0 absolute inset-0" onChange={handleImageUpload} disabled={uploading || !tourId && !isEdit} /> 
                </label>
                {!isEdit && <p className="text-xs text-gray-500 mt-1">Salve o passeio inicial para habilitar o upload de imagens.</p>}
              </div>
            </div>

            {/* Traduções */}
            <div className="mt-8 border-t pt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Traduções</h3>
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
                   <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                   <input type="text" value={formData.translations[activeTab].title} onChange={(e) => updateTranslation('title', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent" />
                 </div>
                <div> 
                   <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                   <textarea rows={4} value={formData.translations[activeTab].description} onChange={(e) => updateTranslation('description', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent" />
                 </div>
                <div> 
                   <label className="block text-sm font-medium text-gray-700 mb-2">O que está incluído</label>
                   <div className="flex gap-2">
                     <input type="text" value={includeInput} onChange={(e) => setIncludeInput(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent" />
                     <button type="button" onClick={() => handleAddItem('include')} className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"><Plus className="w-5 h-5" /></button>
                   </div>
                   <ul className="mt-4 space-y-2">
                     {formData.translations[activeTab].whatsIncluded.map((item, index) => (
                       <li key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                         <div className="flex items-center text-sm text-gray-700"><Check className="w-4 h-4 text-green-600 mr-2" />{item}</div>
                         <button type="button" onClick={() => handleRemoveItem('include', index)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                       </li>
                     ))}
                   </ul>
                 </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">O que não está incluído</label>
                   <div className="flex gap-2">
                     <input type="text" value={excludeInput} onChange={(e) => setExcludeInput(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent" />
                     <button type="button" onClick={() => handleAddItem('exclude')} className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"><Plus className="w-5 h-5" /></button>
                   </div>
                   <ul className="mt-4 space-y-2">
                     {formData.translations[activeTab].whatsExcluded.map((item, index) => (
                       <li key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                         <div className="flex items-center text-sm text-gray-700"><X className="w-4 h-4 text-red-600 mr-2" />{item}</div>
                         <button type="button" onClick={() => handleRemoveItem('exclude', index)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                       </li>
                     ))}
                   </ul>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};