import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Força a rota a ser sempre dinâmica para não ser cacheada (importante para cronjobs)
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Consulta simples para manter a conexão ativa ("wake up")
    // Seleciona apenas 1 ID para ser extremamente leve e rápido
    const { data, error } = await supabase
      .from('tours')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Supabase Keep-Alive Error:', error.message);
      // Retornamos 500 se o banco falhar, para o Cronjob registrar o erro
      return NextResponse.json(
        { status: 'Error', message: error.message },
        { status: 500 }
      );
    }

    // Retorna 200 OK se tudo estiver certo
    return NextResponse.json(
      { 
        status: 'Alive', 
        timestamp: new Date().toISOString(),
        database: 'Connected' 
      }, 
      { status: 200 }
    );

  } catch (err: any) {
    console.error('Keep-Alive Unexpected Error:', err);
    return NextResponse.json(
      { status: 'Error', message: err.message || 'Unknown error' },
      { status: 500 }
    );
  }
}