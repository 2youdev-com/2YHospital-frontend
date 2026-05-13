'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { Skeleton } from '@/components/ui/skeleton';

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

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <div className="hidden w-72 border-l border-slate-200 bg-white lg:block" />
        <main className="flex-1 p-6">
          <Skeleton className="mb-6 h-12 w-full" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
          </div>
        </main>
      </div>
    );
  }

  if (!user || !ADMIN_ROLES.includes(user.role)) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
