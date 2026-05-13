'use client';

import { useEffect, useState, useRef } from 'react';
import { notificationsService } from '@/services/notifications.service';
import { LoadingSpinner, EmptyState } from '@/components/shared';
import Topbar from '@/components/layout/Topbar';
import { 
  Bell, CheckCheck, Calendar, AlertTriangle, Receipt, 
  Stethoscope, Info, Filter, ArrowLeft, Trash2,
  Clock, Sparkles, MessageSquare
} from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Notification } from '@/types';
import Link from 'next/link';

const TYPE_ICONS: Record<string, React.ElementType> = {
  appointment: Calendar,
  alert: AlertTriangle,
  billing: Receipt,
  doctor: Stethoscope,
  default: Info,
};

const TYPE_COLORS: Record<string, string> = {
  appointment: 'bg-blue-50 text-blue-600 border-blue-100',
  alert: 'bg-amber-50 text-amber-600 border-amber-100',
  billing: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  doctor: 'bg-teal-50 text-teal-600 border-teal-100',
  default: 'bg-slate-50 text-slate-500 border-slate-100',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const fetchLock = useRef(false);

  useEffect(() => {
    if (fetchLock.current) return;
    fetchLock.current = true;

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

  if (isLoading) return (
    <div className="bg-[#f4f7f8] min-h-screen">
      <Topbar title="مركز التنبيهات" />
      <div className="p-8 max-w-3xl mx-auto space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-white/50 animate-pulse border border-slate-100" />
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-[#f4f7f8] min-h-screen pb-12">
      <Topbar title="مركز التنبيهات" />

      <div className="px-6 md:px-8 py-8 space-y-8 max-w-3xl mx-auto">
        
        {/* Header Hero */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#115e6e] to-[#0d4753] rounded-[2.5rem] p-8 text-white shadow-xl shadow-[#115e6e]/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                  <Bell className="w-6 h-6 text-teal-300" />
                </div>
                <div>
                  <h1 className="text-2xl font-black">الإشعارات</h1>
                  <p className="text-white/60 text-sm font-medium">ابق على اطلاع بكل جديد في المستشفى</p>
                </div>
              </div>
              
              {unread > 0 && (
                <button 
                  onClick={handleMarkAll}
                  className="flex items-center gap-2 text-xs font-black bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-xl transition-all border border-white/20"
                >
                  <CheckCheck className="w-4 h-4" />
                  تعيين الكل كمقروء
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {(['all', 'unread'] as const).map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => setFilter(tab)}
                  className={cn(
                    "px-5 py-2 rounded-xl text-xs font-black transition-all",
                    filter === tab 
                      ? "bg-white text-[#115e6e] shadow-lg" 
                      : "bg-white/5 hover:bg-white/10 text-white/80"
                  )}
                >
                  {tab === 'all' ? `جميع الإشعارات (${notifications.length})` : `غير مقروءة (${unread})`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* List */}
        {displayed.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white p-12 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
              <Bell className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-lg font-black text-slate-800">لا توجد تنبيهات</h3>
            <p className="text-sm font-medium text-slate-400 mt-2 max-w-xs">
              {filter === 'unread' ? 'لقد قمت بقراءة جميع الإشعارات الهامة.' : 'مركز الإشعارات فارغ حالياً.'}
            </p>
            <Link prefetch={false} href="/dashboard" className="mt-8 text-sm font-bold text-[#2bbcb3] hover:underline">
              العودة للوحة التحكم
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {displayed.map((n) => {
              const Icon = TYPE_ICONS[n.type] ?? TYPE_ICONS.default;
              const theme = TYPE_COLORS[n.type] ?? TYPE_COLORS.default;
              
              return (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && handleMarkOne(n.id)}
                  className={cn(
                    'group relative bg-white/80 backdrop-blur-xl rounded-[1.8rem] border border-white p-5 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1',
                    !n.isRead ? 'shadow-sm border-l-4 border-l-[#2bbcb3]' : 'opacity-80 grayscale-[0.5]'
                  )}
                >
                  {!n.isRead && (
                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#2bbcb3] shadow-lg shadow-[#2bbcb3]/40" />
                  )}
                  
                  <div className="flex items-start gap-4">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border shadow-sm", theme)}>
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <h3 className={cn("text-base truncate leading-none pt-1", !n.isRead ? "font-black text-slate-900" : "font-bold text-slate-600")}>
                          {n.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg flex-shrink-0">
                          <Clock className="w-3 h-3" />
                          {formatDate(n.createdAt, 'HH:mm')}
                        </div>
                      </div>
                      
                      <p className={cn("text-sm leading-relaxed mb-3", !n.isRead ? "font-bold text-slate-600" : "font-medium text-slate-400")}>
                        {n.body}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-slate-300">
                          {formatDate(n.createdAt, 'dd MMM yyyy')}
                        </p>
                        
                        {!n.isRead && (
                          <div className="text-[10px] font-black text-[#2bbcb3] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            تحديد كمقروء <ArrowLeft className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-400">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>مركز إشعارات 2YHospital الذكي</span>
        </div>

      </div>
    </div>
  );
}
