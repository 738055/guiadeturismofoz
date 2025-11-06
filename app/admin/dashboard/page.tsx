'use client'; // Página de cliente

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
// Importe o ícone de Tags/Categorias
import { LayoutDashboard, Package, Calendar, Settings, LogOut, MapPin, Tag } from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalTours: 0,
    activeTours: 0,
    upcomingAvailability: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Paraleliza as requisições
      const [toursRes, availabilityRes] = await Promise.all([
        supabase.from('tours').select('id, is_active', { count: 'exact' }),
        supabase.from('tour_availability').select('id', { count: 'exact' })
          .gte('available_date', new Date().toISOString().split('T')[0])
      ]);

      setStats({
        totalTours: toursRes.count || 0,
        activeTours: toursRes.data?.filter(t => t.is_active).length || 0,
        upcomingAvailability: availabilityRes.count || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // O AuthProvider cuidará do redirecionamento
  };

  return (
    <div className="min-h-screen">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-verde-principal to-verde-secundario rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold text-verde-principal">Admin Panel</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-verde-principal">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total de Passeios</p>
                <p className="text-3xl font-bold text-verde-principal">{stats.totalTours}</p>
              </div>
              <Package className="w-12 h-12 text-verde-principal opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-verde-secundario">
             <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Passeios Ativos</p>
                <p className="text-3xl font-bold text-verde-secundario">{stats.activeTours}</p>
              </div>
              <LayoutDashboard className="w-12 h-12 text-verde-secundario opacity-20" />
            </div>
          </div>
           <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-acento-dourado">
             <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Datas Disponíveis</p>
                <p className="text-3xl font-bold text-acento-dourado">{stats.upcomingAvailability}</p>
              </div>
              <Calendar className="w-12 h-12 text-acento-dourado opacity-20" />
            </div>
          </div>
        </div>

        {/* Links de Navegação */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button
            onClick={() => router.push('/admin/tours')}
            className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-shadow group text-left"
          >
            <Package className="w-12 h-12 text-verde-principal mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Gerenciar Passeios</h3>
            <p className="text-gray-600 text-sm">Criar, editar e excluir passeios</p>
          </button>
          
          {/* --- NOVO BOTÃO DE CATEGORIAS --- */}
          <button
            onClick={() => router.push('/admin/categories')}
            className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-shadow group text-left"
          >
            <Tag className="w-12 h-12 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Gerenciar Categorias</h3>
            <p className="text-gray-600 text-sm">Criar e excluir categorias</p>
          </button>

          <button
            onClick={() => alert('Ainda não implementado')}
            className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-shadow group text-left"
          >
            <Calendar className="w-12 h-12 text-verde-secundario mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Disponibilidade</h3>
            <p className="text-gray-600 text-sm">Gerenciar datas e vagas</p>
          </button>

          <button
           onClick={() => router.push('/admin/settings')}
            className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-shadow group text-left"
          >
            <Settings className="w-12 h-12 text-acento-dourado mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Configurações</h3>
            <p className="text-gray-600 text-sm">Banners, contatos e mais</p>
          </button>
        </div>
      </div>
    </div>
  );
}