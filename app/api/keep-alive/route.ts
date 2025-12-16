import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Força a rota a ser sempre dinâmica
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // --- CAMADA DE SEGURANÇA ---
    // Verifica se a requisição tem a "Senha" correta no cabeçalho
    // Você deve definir CRON_SECRET no seu arquivo .env.local
    const authHeader = request.headers.get('authorization');
    
    // Se a variável de ambiente existir, exigimos que a senha bata
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { status: 'Forbidden', message: 'Invalid or missing token' }, 
        { status: 401 }
      );
    }

    // --- EXECUÇÃO ---
    // Consulta ultra-leve (busca apenas 1 ID)
    const { error } = await supabase
      .from('tours')
      .select('id')
      .limit(1);

    if (error) {
      // Loga o erro real no servidor (para você ver), mas não manda pro cliente
      console.error('Keep-Alive Internal Error:', error.message);
      
      // Retorna erro genérico para quem chamou (segurança por obscuridade)
      return NextResponse.json(
        { status: 'Error', message: 'Database check failed' }, 
        { status: 500 }
      );
    }

    return NextResponse.json(
      { status: 'Alive', timestamp: new Date().toISOString() }, 
      { status: 200 }
    );

  } catch (err) {
    console.error('Keep-Alive Unexpected Error:', err);
    return NextResponse.json(
      { status: 'Error', message: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}