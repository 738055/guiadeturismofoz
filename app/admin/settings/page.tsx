// app/admin/settings/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Save, Loader2, Upload, ImageIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Usaremos o mesmo bucket 'tours' por simplicidade, 
// mas idealmente você criaria um bucket 'site-assets' no Supabase.
const BUCKET_NAME = 'tours'; 

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [banners, setBanners] = useState({
    banner_tours: '',
    banner_combos: ''
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['banner_tours', 'banner_combos']);

      if (error) throw error;

      const newBanners = { ...banners };
      data?.forEach(item => {
        if (item.setting_key === 'banner_tours') newBanners.banner_tours = item.setting_value;
        if (item.setting_key === 'banner_combos') newBanners.banner_combos = item.setting_value;
      });
      setBanners(newBanners);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: 'banner_tours' | 'banner_combos') => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `banners/${key}-${Date.now()}.${fileExt}`;

    try {
      setSaving(true);
      // 1. Upload da imagem
      const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(fileName, file);
      if (uploadError) throw uploadError;

      // 2. Pegar URL pública
      const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
      const publicUrl = publicUrlData.publicUrl;

      // 3. Atualizar estado local
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
        { setting_key: 'banner_combos', setting_value: banners.banner_combos }
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
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-verde-principal" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
           <Link href="/admin/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-verde-principal transition-colors">
              <ArrowLeft className="w-5 h-5" /><span>Voltar ao Dashboard</span>
           </Link>
           <h1 className="text-xl font-bold text-verde-principal">Configurações do Site</h1>
           <button onClick={handleSave} disabled={saving} className="flex items-center space-x-2 bg-verde-principal text-white px-4 py-2 rounded-lg hover:bg-verde-secundario transition-colors disabled:opacity-50">
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              <span>Salvar Tudo</span>
           </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-6 border-b pb-2">Banners das Páginas</h2>
          
          <div className="grid gap-8">
            {/* Banner Passeios */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Banner da Página de Passeios</label>
              <div className="flex items-start space-x-6">
                <div className="relative w-64 h-36 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center">
                  {banners.banner_tours ? (
                    <Image src={banners.banner_tours} alt="Banner Tours" fill className="object-cover" />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <div>
                  <label htmlFor="upload-tours" className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 transition ease-in-out duration-150">
                    <Upload className="w-4 h-4" />
                    <span>Alterar Imagem</span>
                  </label>
                  <input id="upload-tours" type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'banner_tours')} />
                  <p className="mt-2 text-xs text-gray-500">Recomendado: 1920x400px. Max 2MB.</p>
                </div>
              </div>
            </div>

            {/* Banner Combos */}
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Banner da Página de Combos</label>
              <div className="flex items-start space-x-6">
                <div className="relative w-64 h-36 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center">
                  {banners.banner_combos ? (
                    <Image src={banners.banner_combos} alt="Banner Combos" fill className="object-cover" />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <div>
                  <label htmlFor="upload-combos" className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 transition ease-in-out duration-150">
                    <Upload className="w-4 h-4" />
                    <span>Alterar Imagem</span>
                  </label>
                  <input id="upload-combos" type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'banner_combos')} />
                  <p className="mt-2 text-xs text-gray-500">Recomendado: 1920x400px. Max 2MB.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}