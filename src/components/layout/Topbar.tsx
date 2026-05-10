'use client';

import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/lib/utils';
import NotificationBell from '@/components/shared/NotificationBell';

interface TopbarProps {
  title: string;
}

export default function Topbar({ title }: TopbarProps) {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400 hidden md:block">{formatDate(new Date())}</span>
        <NotificationBell />
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold select-none">
          {user?.name?.[0] ?? '؟'}
        </div>
      </div>
    </header>
  );
}
