import React from 'react';
import { PageBanner } from '@/components/PageBanner';
import { supabase } from '@/lib/supabase';

export default async function PrivacidadePage() {
  const { data: bannerData } = await supabase.from('site_settings').select('setting_value').eq('setting_key', 'banner_home').single();
  const bannerUrl = bannerData?.setting_value || "/54.jpg";

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <PageBanner title="Política de Privacidade" subtitle="Como cuidamos dos seus dados" image={bannerUrl} />
      <div className="max-w-4xl mx-auto px-4 py-12 prose prose-lg text-gray-600">
        <h3>1. Coleta de Informações</h3>
        <p>Coletamos informações pessoais apenas quando necessário para processar suas reservas e melhorar sua experiência de viagem.</p>
        
        <h3>2. Uso de Dados</h3>
        <p>Seus dados não são vendidos ou compartilhados com terceiros não relacionados à prestação do serviço turístico contratado.</p>
        
        <h3>3. Segurança</h3>
        <p>Implementamos medidas de segurança para proteger suas informações pessoais contra acesso não autorizado.</p>
      </div>
    </div>
  );
}