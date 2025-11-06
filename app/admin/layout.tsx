import React from 'react';
import { AdminAuthProvider } from './AdminAuthProvider';

// Layout simples para o painel de admin
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Este provider pode verificar a sessão no cliente
    <AdminAuthProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Futuramente, um Header/Sidebar de admin pode ir aqui */}
        {children}
      </div>
    </AdminAuthProvider>
  );
}