'use client'; // Componente de cliente

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft, Save, Loader2, Image as ImageIcon, Trash2, Upload, X, Check, Plus, Calendar as CalendarIcon
} from 'lucide-react';
import Link from 'next/link';
import { TourImage, TourAvailability } from '@/lib/supabase'; // Importar tipos
import Image from 'next/image';
import { format, parseISO } from 'date-fns'; // Para formatar datas na lista

// Tipo para os dados do formulário
type TranslationData = {
  title: string;
  description: string;
  whatsIncluded: string[];
  whatsExcluded: string[];
};
type FormData = {
  basePrice: string;
  durationHours: string;
  location: string;
  isActive: boolean;
  translations: {
    pt_BR: TranslationData;
    en_US: TranslationData;
    es_ES: TranslationData;
  };
};

const initialFormData: FormData = {
  basePrice: '',
  durationHours: '',
  location: '',
  isActive: true,
  translations: {
    pt_BR: { title: '', description: '', whatsIncluded: [], whatsExcluded: [] },
    en_US: { title: '', description: '', whatsIncluded: [], whatsExcluded: [] },
    es_ES: { title: '', description: '', whatsIncluded: [], whatsExcluded: [] }
  }
};

// Tipo para Categoria
type CategoryOption = { id: string; name: string; };

// --- NOVO TIPO PARA ITEM DE DISPONIBILIDADE NO ESTADO ---
type AvailabilityStateItem = {
  available_date: string; // Formato 'YYYY-MM-DD'
  total_spots: number;
};

export const AdminTourForm: React.FC<{ tourId?: string }> = ({ tourId }) => {
  const router = useRouter();
  const isEdit = !!tourId;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [activeTab, setActiveTab] = useState<'pt_BR' | 'en_US' | 'es_ES'>('pt_BR');

  const [images, setImages] = useState<TourImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [disabledDays, setDisabledDays] = useState<number[]>([]);
  const [specificDisabledDates, setSpecificDisabledDates] = useState<string[]>([]);
  const [dateInput, setDateInput] = useState('');

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [includeInput, setIncludeInput] = useState('');
  const [excludeInput, setExcludeInput] = useState('');

  // --- ESTADOS PARA GERENCIAR DISPONIBILIDADE ---
  const [availabilityList, setAvailabilityList] = useState<AvailabilityStateItem[]>([]);
  const [availabilityDateInput, setAvailabilityDateInput] = useState('');
  const [availabilitySpotsInput, setAvailabilitySpotsInput] = useState<number>(10); // Default

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
        .eq('category_translations.language_code', 'pt_BR');
      if (error) throw error;
      if (data) {
        const categoryOptions = data.map((c: any) => ({ id: c.id, name: c.category_translations[0].name }));
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
          tour_images (*),
          tour_availability (*)
        `) // <-- BUSCA tour_availability (*)
        .eq('id', tourId)
        .order('display_order', { referencedTable: 'tour_images', ascending: true })
        .order('available_date', { referencedTable: 'tour_availability', ascending: true }) // Ordena disponibilidade
        .maybeSingle();

      if (tourError) throw tourError;
      if (!tour) {
        alert('Passeio não encontrado');
        router.push('/admin/tours');
        return;
      }

      // Preenche traduções (com verificação de array)
      const translations = { ...initialFormData.translations };
      tour.tour_translations.forEach((t: any) => {
        if (translations[t.language_code as keyof typeof translations]) {
          const included = Array.isArray(t.whats_included) ? t.whats_included : [];
          const excluded = Array.isArray(t.whats_excluded) ? t.whats_excluded : [];
          translations[t.language_code as keyof typeof translations] = {
            title: t.title, description: t.description, whatsIncluded: included, whatsExcluded: excluded
          };
        }
      });

      setFormData({
        basePrice: tour.base_price.toString(), durationHours: tour.duration_hours.toString(),
        location: tour.location, isActive: tour.is_active, translations
      });

      setCategoryId(tour.category_id);
      setImages(tour.tour_images || []);
      setDisabledDays(tour.disabled_week_days || []);
      setSpecificDisabledDates(tour.disabled_specific_dates || []);

      // --- CARREGA A DISPONIBILIDADE EXISTENTE ---
      setAvailabilityList(tour.tour_availability.map((avail: TourAvailability) => ({
        available_date: avail.available_date,
        total_spots: avail.total_spots
      })) || []);

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
      // 1. Prepara dados do Passeio Principal
      const tourData = {
        base_price: parseFloat(formData.basePrice) || 0,
        duration_hours: parseInt(formData.durationHours) || 0,
        location: formData.location,
        is_active: formData.isActive,
        category_id: categoryId,
        disabled_week_days: disabledDays,
        disabled_specific_dates: specificDisabledDates
      };

      let currentTourId = tourId;

      // 2. Salva/Atualiza o Passeio principal
      if (isEdit) {
        const { error: updateError } = await supabase.from('tours').update(tourData).eq('id', tourId);
        if (updateError) throw updateError;
      } else {
        const { data: newTour, error: insertError } = await supabase.from('tours').insert(tourData).select().single();
        if (insertError) throw insertError;
        currentTourId = newTour.id;
      }

      if (!currentTourId) throw new Error('ID do passeio não encontrado');

      // 3. Salva/Atualiza as Traduções
      const translationsToUpsert = Object.entries(formData.translations).map(([langCode, translation]) => ({
        tour_id: currentTourId, language_code: langCode, title: translation.title,
        description: translation.description, whats_included: translation.whatsIncluded, whats_excluded: translation.whatsExcluded
      }));
      const { error: upsertError } = await supabase.from('tour_translations').upsert(translationsToUpsert, { onConflict: 'tour_id, language_code' });
      if (upsertError) throw upsertError;

      // --- 4. GERENCIA DISPONIBILIDADE (APAGA E RECRIA) ---
      if (currentTourId) { // Só faz se tivermos um ID
        // 4.1 Apaga a disponibilidade antiga
        const { error: deleteError } = await supabase
          .from('tour_availability')
          .delete()
          .eq('tour_id', currentTourId);
        // Não lançar erro aqui, pois pode não haver disponibilidade antiga
        if (deleteError) { console.warn('Could not delete old availability:', deleteError.message); }

        // 4.2 Insere a nova disponibilidade (se houver)
        if (availabilityList.length > 0) {
          const availabilityToInsert = availabilityList.map(item => ({
            tour_id: currentTourId,
            available_date: item.available_date,
            total_spots: item.total_spots,
            spots_booked: 0 // Novas datas começam com 0 reservas
          }));
          const { error: insertAvailError } = await supabase
            .from('tour_availability')
            .insert(availabilityToInsert);
          if (insertAvailError) throw insertAvailError;
        }
      }
      // --- FIM DA LÓGICA DE DISPONIBILIDADE ---

      alert('Passeio salvo com sucesso!');
      router.push('/admin/tours');

    } catch (error) {
      console.error('Error saving tour:', error);
      alert('Erro ao salvar passeio. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers existentes ---
  const updateTranslation = (field: keyof Omit<TranslationData, 'whatsIncluded' | 'whatsExcluded'>, value: string) => {
    setFormData(prev => ({ ...prev, translations: { ...prev.translations, [activeTab]: { ...prev.translations[activeTab], [field]: value } } }));
  };
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEdit && !tourId) { alert('Você precisa salvar o passeio (Informações Gerais) antes de adicionar imagens.'); e.target.value = ''; return; }
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    const files = Array.from(e.target.files);
    // Tenta pegar o ID atual (se editando) ou busca o último ID criado (se for novo e acabou de salvar)
    let currentId = tourId;
    if (!currentId) {
        try {
            // Se for um novo passeio, busca o ID mais recente (pode ser falho em ambientes concorrentes)
            const { data: latestTour, error: fetchError } = await supabase.from('tours').select('id').order('created_at', { ascending: false }).limit(1).single();
            if (fetchError || !latestTour) throw new Error('Failed to fetch latest tour ID');
            currentId = latestTour.id;
            // Se for um novo passeio, talvez redirecionar para a página de edição seja melhor após o primeiro save?
            // router.replace(`/admin/tours/edit/${currentId}`); // Opcional
        } catch (err) {
            console.error("Error determining tour ID for upload:", err);
            alert('Erro: Não foi possível obter o ID do passeio para o upload. Salve o passeio primeiro.');
            setUploading(false);
            return;
        }
    }
    if (!currentId) { alert('Erro: ID do passeio não encontrado.'); setUploading(false); return; }

    try {
      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${currentId}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        const { error: uploadError } = await supabase.storage.from('tours').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from('tours').getPublicUrl(filePath);
        const imageUrl = publicUrlData.publicUrl;
        const currentMaxOrder = images.reduce((max, img) => Math.max(max, img.display_order || 0), 0); // Adicionado || 0
        const { data: newImageData, error: insertError } = await supabase
          .from('tour_images')
          .insert({ tour_id: currentId, image_url: imageUrl, alt_text: formData.translations.pt_BR.title || 'Imagem', display_order: currentMaxOrder + 1 })
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

  // --- FUNÇÕES DE DISPONIBILIDADE ---
  const handleAddAvailability = () => {
    if (availabilityDateInput && availabilitySpotsInput > 0) {
      const existingIndex = availabilityList.findIndex(item => item.available_date === availabilityDateInput);
      if (existingIndex !== -1) {
        const updatedList = [...availabilityList];
        updatedList[existingIndex].total_spots = availabilitySpotsInput;
        setAvailabilityList(updatedList.sort((a, b) => a.available_date.localeCompare(b.available_date)));
      } else {
        const newItem: AvailabilityStateItem = { available_date: availabilityDateInput, total_spots: availabilitySpotsInput };
        setAvailabilityList(prev => [...prev, newItem].sort((a, b) => a.available_date.localeCompare(b.available_date)));
      }
    } else {
      alert("Por favor, selecione uma data e informe um número de vagas maior que zero.");
    }
  };

  const handleRemoveAvailability = (dateToRemove: string) => {
    setAvailabilityList(prev => prev.filter(item => item.available_date !== dateToRemove));
  };

  const weekDays = [
     { label: 'Dom', index: 0 }, { label: 'Seg', index: 1 }, { label: 'Ter', index: 2 },
     { label: 'Qua', index: 3 }, { label: 'Qui', index: 4 }, { label: 'Sex', index: 5 }, { label: 'Sáb', index: 6 },
  ];

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-verde-principal" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <form onSubmit={handleSave}>
        {/* Header Fixo */}
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/admin/tours" className="flex items-center space-x-2 text-gray-600 hover:text-verde-principal transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Voltar</span>
              </Link>
              <h1 className="text-2xl font-bold text-verde-principal">
                {isEdit ? 'Editar Passeio' : 'Novo Passeio'}
              </h1>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 bg-verde-principal text-white px-4 py-2 rounded-lg hover:bg-verde-secundario transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                <span>Salvar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Conteúdo do Formulário */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-md p-8">
            {/* Informações Gerais */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Informações Gerais</h3>
              {/* Grid Preço, Duração, Localização */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preço Base (R$)</label>
                  <input type="number" step="0.01" value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duração (horas)</label>
                  <input type="number" value={formData.durationHours}
                    onChange={(e) => setFormData({ ...formData, durationHours: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Localização</label>
                  <input type="text" value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent" />
                </div>
              </div>
              {/* Seletor Categoria e Checkbox Ativo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                  <select
                    value={categoryId || ''}
                    onChange={(e) => setCategoryId(e.target.value || null)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent"
                  >
                    <option value="">Nenhuma</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-verde-principal focus:ring-verde-principal border-gray-300 rounded" />
                    <span className="text-sm font-medium text-gray-700">Passeio Ativo</span>
                  </label>
                </div>
              </div>
              {/* Dias da semana */}
              <div className="mt-6">
                 <label className="block text-sm font-medium text-gray-700 mb-3">
                   Dias da semana que o passeio NÃO funciona (recorrente)
                 </label>
                 <div className="flex flex-wrap gap-2">
                   {weekDays.map(day => (
                     <button type="button" key={day.index} onClick={() => handleDayToggle(day.index)}
                       className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                         disabledDays.includes(day.index) ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                       }`}>
                       {day.label}
                     </button>
                   ))}
                 </div>
               </div>
              {/* Datas específicas */}
              <div className="mt-6">
                 <label className="block text-sm font-medium text-gray-700 mb-3">
                   Datas específicas que o passeio NÃO funciona (ex: feriados)
                 </label>
                 <div className="flex gap-2">
                   <input type="date" value={dateInput} onChange={(e) => setDateInput(e.target.value)}
                     className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent" />
                   <button type="button" onClick={handleAddSpecificDate}
                     className="px-4 py-2 bg-verde-principal text-white rounded-lg font-medium hover:bg-verde-secundario">
                     Adicionar
                   </button>
                 </div>
                 {specificDisabledDates.length > 0 && (
                   <div className="flex flex-wrap gap-2 mt-4">
                     {specificDisabledDates.map(date => (
                       <div key={date} className="flex items-center gap-2 px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm">
                         {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                         <button type="button" onClick={() => handleRemoveSpecificDate(date)} className="text-red-600 hover:text-red-800">
                           <X className="w-4 h-4" />
                         </button>
                       </div>
                     ))}
                   </div>
                 )}
               </div>
            </div>

             {/* --- SEÇÃO DE GERENCIAMENTO DE DISPONIBILIDADE --- */}
             <div className="mb-8 mt-8 border-t pt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Gerenciar Disponibilidade</h3>
                <p className="text-sm text-gray-500 mb-4">Adicione as datas em que o passeio estará disponível e quantas vagas totais terá em cada dia.</p>
                {/* Inputs e Botão Adicionar */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 border rounded-lg bg-gray-50">
                   <div className='flex-1'>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                     <input type="date" value={availabilityDateInput} onChange={(e) => setAvailabilityDateInput(e.target.value)}
                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent" />
                   </div>
                   <div className='w-full sm:w-32'>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Vagas Totais</label>
                     <input type="number" min="1" value={availabilitySpotsInput} onChange={(e) => setAvailabilitySpotsInput(parseInt(e.target.value) || 1)}
                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent" />
                   </div>
                   <div className="flex items-end">
                      <button type="button" onClick={handleAddAvailability}
                        className="w-full sm:w-auto px-4 py-2 bg-verde-principal text-white rounded-lg font-medium hover:bg-verde-secundario flex items-center justify-center space-x-2">
                         <Plus className="w-5 h-5" />
                         <span>Adicionar/Atualizar</span> {/* Texto mais curto */}
                      </button>
                   </div>
                </div>
                {/* Lista de disponibilidade */}
                {availabilityList.length > 0 ? (
                  <div>
                    <h4 className="text-md font-semibold text-gray-700 mb-3">Datas Disponíveis Adicionadas:</h4>
                    <ul className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-3 bg-white">
                      {availabilityList.map(item => (
                        <li key={item.available_date} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                          <div className="flex items-center space-x-2">
                            <CalendarIcon className="w-4 h-4 text-gray-500"/>
                            {/* Formata a data para dd/MM/yyyy */}
                            <span>{format(parseISO(item.available_date), 'dd/MM/yyyy')}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-gray-600">{item.total_spots} vagas</span>
                            <button type="button" onClick={() => handleRemoveAvailability(item.available_date)}
                              className="text-red-500 hover:text-red-700" aria-label="Remover data">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4 border rounded-lg bg-gray-50">Nenhuma data de disponibilidade adicionada ainda.</p>
                )}
            </div>
            {/* --- FIM DA SEÇÃO DE DISPONIBILIDADE --- */}

            {/* Galeria de Imagens */}
            <div className="mb-8 mt-8 border-t pt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Galeria de Imagens</h3>
               {images.length > 0 && (
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                   {images.map(image => (
                     <div key={image.id} className="relative group aspect-square">
                       <Image src={image.image_url} alt={image.alt_text || 'Imagem'} fill
                         className="object-cover rounded-lg border" sizes="(max-width: 768px) 50vw, 33vw" />
                       <button type="button" onClick={() => handleImageDelete(image)}
                         className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                         aria-label="Excluir imagem">
                         <Trash2 className="w-4 h-4" />
                       </button>
                       <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black bg-opacity-50 text-white text-xs rounded">
                         Ordem: {image.display_order}
                       </div>
                     </div>
                   ))}
                 </div>
               )}
              <div>
                <label htmlFor="imageUpload" className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  {uploading ? (<Loader2 className="w-8 h-8 animate-spin text-verde-principal" />) : (
                    <><Upload className="w-8 h-8 text-gray-500 mb-2" /><span className="text-sm text-gray-600">Arraste ou clique para enviar (múltiplas)</span></>
                  )}
                  <input id="imageUpload" type="file" multiple className="opacity-0 absolute inset-0"
                    onChange={handleImageUpload} disabled={uploading || !tourId && !isEdit} /> {/* Ajuste no disabled */}
                </label>
                 {/* Mensagem ajustada para modo de criação */}
                {!isEdit && <p className="text-xs text-gray-500 mt-1">Salve o passeio inicial para habilitar o upload de imagens.</p>}
              </div>
            </div>

            {/* Traduções */}
            <div className="mt-8 border-t pt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Traduções</h3>
              {/* Abas */}
              <div className="flex space-x-2 mb-6 border-b">
                 {[{ code: 'pt_BR' as const, label: 'Português' }, { code: 'en_US' as const, label: 'English' }, { code: 'es_ES' as const, label: 'Español' }]
                 .map(lang => (
                   <button key={lang.code} type="button" onClick={() => setActiveTab(lang.code)}
                     className={`px-4 py-2 font-medium transition-colors ${
                       activeTab === lang.code ? 'border-b-2 border-verde-principal text-verde-principal' : 'text-gray-500 hover:text-gray-700'
                     }`}>
                     {lang.label}
                   </button>
                 ))}
               </div>
              {/* Campos */}
              <div className="space-y-6">
                <div> {/* Título */}
                   <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                   <input type="text" value={formData.translations[activeTab].title}
                     onChange={(e) => updateTranslation('title', e.target.value)}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent" />
                 </div>
                <div> {/* Descrição */}
                   <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                   <textarea rows={4} value={formData.translations[activeTab].description}
                     onChange={(e) => updateTranslation('description', e.target.value)}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent" />
                 </div>
                <div> {/* Incluído */}
                   <label className="block text-sm font-medium text-gray-700 mb-2">O que está incluído (Adicionar item)</label>
                   <div className="flex gap-2">
                     <input type="text" value={includeInput} onChange={(e) => setIncludeInput(e.target.value)}
                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent" />
                     <button type="button" onClick={() => handleAddItem('include')}
                       className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
                       <Plus className="w-5 h-5" />
                     </button>
                   </div>
                   <ul className="mt-4 space-y-2">
                     {formData.translations[activeTab].whatsIncluded.map((item, index) => (
                       <li key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                         <div className="flex items-center text-sm text-gray-700">
                           <Check className="w-4 h-4 text-green-600 mr-2" />
                           {item}
                         </div>
                         <button type="button" onClick={() => handleRemoveItem('include', index)} className="text-red-500 hover:text-red-700">
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </li>
                     ))}
                   </ul>
                 </div>
                <div> {/* Não Incluído */}
                   <label className="block text-sm font-medium text-gray-700 mb-2">O que não está incluído (Adicionar item)</label>
                   <div className="flex gap-2">
                     <input type="text" value={excludeInput} onChange={(e) => setExcludeInput(e.target.value)}
                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-principal focus:border-transparent" />
                     <button type="button" onClick={() => handleAddItem('exclude')}
                       className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">
                       <Plus className="w-5 h-5" />
                     </button>
                   </div>
                   <ul className="mt-4 space-y-2">
                     {formData.translations[activeTab].whatsExcluded.map((item, index) => (
                       <li key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                         <div className="flex items-center text-sm text-gray-700">
                           <X className="w-4 h-4 text-red-600 mr-2" />
                           {item}
                         </div>
                         <button type="button" onClick={() => handleRemoveItem('exclude', index)} className="text-red-500 hover:text-red-700">
                           <Trash2 className="w-4 h-4" />
                         </button>
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