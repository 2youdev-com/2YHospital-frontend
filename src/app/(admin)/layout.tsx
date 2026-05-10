'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar from '@/components/layout/AdminSidebar';

const ADMIN_ROLES = ['ADMIN', 'RECEPTIONIST', 'FINANCE'];

const roleHome: Record<string, string> = {
  DOCTOR: '/portal',
  PATIENT: '/patient',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      window.location.href = '/login';
      return;
    }
    if (!ADMIN_ROLES.includes(user.role)) {
      window.location.href = roleHome[user.role] ?? '/login';
    }
  }, [user, isLoading]);

  if (isLoading || !user || !ADMIN_ROLES.includes(user.role)) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}