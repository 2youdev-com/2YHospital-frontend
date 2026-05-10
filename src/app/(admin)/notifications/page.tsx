'use client';

import { useEffect, useState } from 'react';
import { notificationsService } from '@/services/notifications.service';
import { LoadingSpinner, EmptyState } from '@/components/shared';
import Topbar from '@/components/layout/Topbar';
import { Bell, CheckCheck, Calendar, AlertTriangle, Receipt, Stethoscope, Info } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Notification } from '@/types';

const TYPE_ICONS: Record<string, React.ElementType> = {
  appointment: Calendar,
  alert: AlertTriangle,
  billing: Receipt,
  doctor: Stethoscope,
  default: Info,
};
const TYPE_COLORS: Record<string, string> = {
  appointment: 'bg-blue-100 text-blue-600',
  alert: 'bg-orange-100 text-orange-600',
  billing: 'bg-green-100 text-green-600',
  doctor: 'bg-teal-100 text-teal-600',
  default: 'bg-gray-100 text-gray-500',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    notificationsService.getMyNotifications()
      .then(setNotifications)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleMarkAll = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('تم تعيين جميع الإشعارات كمقروءة');
    } catch { toast.error('حدث خطأ'); }
  };

  const handleMarkOne = async (id: string) => {
    await notificationsService.markAsRead(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  };

  const unread = notifications.filter(n => !n.isRead).length;
  const displayed = filter === 'unread' ? notifications.filter(n => !n.isRead) : notifications;

  return (
    <div className="bg-[#f7f8fc] min-h-screen">
      <Topbar title="الإشعارات" />
      <div className="p-6 space-y-5 max-w-2xl">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">الإشعارات</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {unread > 0 ? <span className="text-blue-600 font-semibold">{unread} غير مقروء</span> : 'كل الإشعارات مقروءة'}
            </p>
          </div>
          {unread > 0 && (
            <button onClick={handleMarkAll} className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors">
              <CheckCheck className="w-4 h-4" /> تعيين الكل كمقروء
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="bg-white rounded-2xl border border-gray-100 p-1 flex gap-1 w-fit">
          {(['all', 'unread'] as const).map((tab) => (
            <button key={tab} onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === tab ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab === 'all' ? `الكل (${notifications.length})` : `غير مقروء (${unread})`}
            </button>
          ))}
        </div>

        {/* Notification list */}
        {isLoading ? <LoadingSpinner /> : displayed.length === 0 ? (
          <EmptyState title={filter === 'unread' ? 'لا توجد إشعارات غير مقروءة' : 'لا توجد إشعارات'} icon={Bell} />
        ) : (
          <div className="space-y-2">
            {displayed.map((n) => {
              const Icon = TYPE_ICONS[n.type] ?? TYPE_ICONS.default;
              const iconColor = TYPE_COLORS[n.type] ?? TYPE_COLORS.default;
              return (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && handleMarkOne(n.id)}
                  className={cn(
                    'bg-white rounded-2xl border border-gray-100 p-4 cursor-pointer hover:shadow-sm transition-all',
                    !n.isRead && 'border-r-4 border-r-blue-500'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn('text-sm leading-snug', !n.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700')}>{n.title}</p>
                        {!n.isRead && <span className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0 mt-1" />}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{n.body}</p>
                      <p className="text-[10px] text-gray-400 mt-1.5">{formatDate(n.createdAt, 'dd MMM yyyy · HH:mm')}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
