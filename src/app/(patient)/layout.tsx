'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import PatientSidebar from '@/components/layout/PatientSidebar';

const roleHome: Record<string, string> = {
  ADMIN: '/dashboard',
  RECEPTIONIST: '/appointments',
  FINANCE: '/billing',
  DOCTOR: '/portal',
};

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      window.location.href = '/login';
      return;
    }
    if (user.role !== 'PATIENT') {
      window.location.href = roleHome[user.role] ?? '/login';
    }
  }, [user, isLoading]);

  if (isLoading || !user || user.role !== 'PATIENT') {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <PatientSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}