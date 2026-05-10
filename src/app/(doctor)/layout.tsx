'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DoctorSidebar from '@/components/layout/DoctorSidebar';

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

  if (isLoading || !user || user.role !== 'DOCTOR') {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <DoctorSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}