'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      // Tenta pegar a sessão do Supabase (que usa localStorage)
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // Se não houver sessão E não estivermos na página de login, redireciona
        if (pathname !== '/admin/login') {
          router.replace('/admin/login');
        } else {
          setLoading(false);
        }
      } else {
        // Se houver sessão E estivermos na página de login, redireciona para o dashboard
        if (pathname === '/admin/login') {
          router.replace('/admin/dashboard');
        } else {
          setLoading(false);
        }
      }
    };

    checkAuth();
    
    // Ouve mudanças na autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        router.replace('/admin/login');
      } else if (event === 'SIGNED_IN') {
        if (pathname === '/admin/login') {
            router.replace('/admin/dashboard');
        }
      }
    });

    // Limpa o listener
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (loading && pathname !== '/admin/login') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-verde-principal" />
      </div>
    );
  }

  return <>{children}</>;
};