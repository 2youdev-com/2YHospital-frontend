'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DoctorSidebar from '@/components/layout/DoctorSidebar';
import { Skeleton } from '@/components/ui/skeleton';

const roleHome: Record<string, string> = {
  ADMIN: '/dashboard',
  RECEPTIONIST: '/appointments',
  FINANCE: '/billing',
  PATIENT: '/patient',
};

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      window.location.href = '/login';
      return;
    }
    if (user.role !== 'DOCTOR') {
      window.location.href = roleHome[user.role] ?? '/login';
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <div className="hidden w-72 border-l border-slate-200 bg-white lg:block" />
        <main className="flex-1 p-6">
          <Skeleton className="mb-6 h-12 w-full" />
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)}
          </div>
        </main>
      </div>
    );
  }

  if (!user || user.role !== 'DOCTOR') {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <DoctorSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
