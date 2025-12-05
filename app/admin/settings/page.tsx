// app/admin/settings/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Save, Loader2, Upload, ImageIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const BUCKET_NAME = 'tours'; 

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [banners, setBanners] = useState({
    banner_tours: '',
    banner_combos: '',
    banner_women_exclusive: '',
    banner_about: '' // <-- NOVO: Banner Sobre Nós
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['banner_tours', 'banner_combos', 'banner_women_exclusive', 'banner_about']); // <-- NOVO: Inclui a nova chave

      if (error) throw error;

      const newBanners = { ...banners };
      data?.forEach(item => {
        // Usa o índice de string para mapear a chave de forma segura
        newBanners[item.setting_key as keyof typeof newBanners] = item.setting_value; 
      });
      setBanners(newBanners);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: keyof typeof banners) => { // <-- Tipo da chave genérico
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `banners/${key}-${Date.now()}.${fileExt}`;

    try {
      setSaving(true);
      const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
      const publicUrl = publicUrlData.publicUrl;

      setBanners(prev => ({ ...prev, [key]: publicUrl }));

    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao fazer upload da imagem.');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = [
        { setting_key: 'banner_tours', setting_value: banners.banner_tours },
        { setting_key: 'banner_combos', setting_value: banners.banner_combos },
        { setting_key: 'banner_women_exclusive', setting_value: banners.banner_women_exclusive },
        { setting_key: 'banner_about', setting_value: banners.banner_about } // <-- NOVO: Salva a nova chave
      ];

      const { error } = await supabase.from('site_settings').upsert(updates, { onConflict: 'setting_key' });
      if (error) throw error;

      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar configurações.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-verde-principal" /></div>;
  }

  // Helper para renderizar um bloco de banner
  const renderBannerControl = (key: keyof typeof banners, title: string, subtitle: string, accentColor: string) => (
    <div>
      <label className={`block text-sm font-medium ${accentColor} mb-3`}>{title}</label>
      <div className="flex items-start space-x-6">
        <div className="relative w-64 h-36 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center">
          {banners[key] ? (
            <Image src={banners[key]} alt={`Banner ${title}`} fill className="object-cover" sizes="20vw" />
          ) : (
            <ImageIcon className="w-10 h-10 text-gray-400" />
          )}
        </div>
        <div>
          <label htmlFor={`upload-${key}`} className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 transition ease-in-out duration-150">
            <Upload className="w-4 h-4" />
            <span>Alterar Imagem</span>
          </label>
          <input id={`upload-${key}`} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, key)} />
          <p className="mt-2 text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
           <Link href="/admin/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-verde-principal transition-colors">
              <ArrowLeft className="w-5 h-5" /><span>Voltar ao Dashboard</span>
           </Link>
           <h1 className="text-xl font-bold text-verde-principal">Configurações do Site</h1>
           <button onClick={handleSave} disabled={saving} className="flex items-center space-x-2 bg-verde-principal text-white px-4 py-2 rounded-lg hover:bg-verde-secundario transition-colors disabled:opacity-50 shadow-lg">
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              <span>Salvar Tudo</span>
           </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-6 border-b pb-2">Banners das Páginas</h2>
          
          <div className="grid gap-8">
            
            {renderBannerControl('banner_tours', 'Banner da Página de Passeios', 'Recomendado: 1920x400px. Max 2MB.', 'text-verde-principal')}
            {renderBannerControl('banner_combos', 'Banner da Página de Combos', 'Recomendado: 1920x400px. Max 2MB.', 'text-azul-foz')}
            
            {/* NOVO BANNER SOBRE NÓS */}
            {renderBannerControl('banner_about', 'Banner da Página Sobre Nós', 'Recomendado: 1920x400px. Imagem institucional.', 'text-gray-800')}
            
            {/* Banner Exclusivo Mulheres (Estilo customizado mantido) */}
            <div>
              <label className="block text-sm font-medium text-acento-mulher mb-3">Banner da Página Exclusiva para Mulheres</label>
              <div className="flex items-start space-x-6">
                <div className="relative w-64 h-36 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-acento-mulher-dark flex items-center justify-center">
                  {banners.banner_women_exclusive ? (
                    <Image src={banners.banner_women_exclusive} alt="Banner Mulheres" fill className="object-cover" sizes="20vw" />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-acento-mulher" />
                  )}
                </div>
                <div>
                  <label htmlFor="upload-women-exclusive" className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2 bg-acento-mulher text-white border border-acento-mulher-dark rounded-md font-semibold text-xs uppercase tracking-widest shadow-sm hover:bg-acento-mulher-dark transition ease-in-out duration-150">
                    <Upload className="w-4 h-4" />
                    <span>Alterar Imagem Exclusiva</span>
                  </label>
                  <input id="upload-women-exclusive" type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'banner_women_exclusive')} />
                  <p className="mt-2 text-xs text-gray-500">Recomendado: 1920x400px. Max 2MB. Use tons de rosa/roxo.</p>
                </div>
              </div>
            </div>
            
          </div>

        </div>
      </div>
    </div>
  );
}