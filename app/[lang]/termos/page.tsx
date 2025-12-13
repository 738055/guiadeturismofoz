import React from 'react';
import { PageBanner } from '@/components/PageBanner';
import { supabase } from '@/lib/supabase';

export default async function TermosPage() {
  // Busca banner (opcional, fallback para o padrão)
  const { data: bannerData } = await supabase.from('site_settings').select('setting_value').eq('setting_key', 'banner_home').single();
  const bannerUrl = bannerData?.setting_value || "/54.jpg";

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <PageBanner title="Termos de Uso" subtitle="Regras e condições de serviço" image={bannerUrl} />
      <div className="max-w-4xl mx-auto px-4 py-12 prose prose-lg text-gray-600">
        <h3>1. Aceitação dos Termos</h3>
        <p>Ao acessar e usar este site, você aceita e concorda em estar vinculado aos termos e disposições deste acordo.</p>
        
        <h3>2. Reservas e Pagamentos</h3>
        <p>Todas as reservas estão sujeitas a disponibilidade. O pagamento deve ser efetuado conforme as condições estabelecidas no momento da compra.</p>
        
        <h3>3. Cancelamentos</h3>
        <p>Cancelamentos devem ser solicitados com antecedência mínima de 24 horas para reembolso total, salvo exceções especificadas em passeios particulares.</p>
        
        {/* Adicione mais conteúdo real conforme necessário */}
      </div>
    </div>
  );
}