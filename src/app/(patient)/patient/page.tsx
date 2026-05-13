'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Topbar from '@/components/layout/Topbar';
import { useAuth } from '@/context/AuthContext';
import { appointmentsService } from '@/services/appointments.service';
import { 
  Bot, CalendarDays, ChevronLeft, FileText, 
  Receipt, Search, ShieldCheck, Sparkles,
  Activity, Clock, Heart, ArrowUpRight, Zap
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Appointment } from '@/types';

const actions = [
  { href: '/patient/search', label: 'حجز موعد جديد', description: 'ابحث عن طبيب أو تخصص واحجز موعدك الآن', icon: Search, color: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/10' },
  { href: '/patient/appointments', label: 'مواعيدي القادمة', description: 'تابع حالة مواعيدك الحالية والمستقبلية', icon: CalendarDays, color: 'from-teal-500 to-emerald-600', shadow: 'shadow-teal-500/10' },
  { href: '/patient/medical-records', label: 'السجل الطبي', description: 'نتائج التحاليل، الأشعة، والوصفات الطبية', icon: FileText, color: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/10' },
  { href: '/patient/billing', label: 'الفواتير والمدفوعات', description: 'راجع فواتيرك وحالة السداد لكل زيارة', icon: Receipt, color: 'from-rose-500 to-pink-600', shadow: 'shadow-rose-500/10' },
];

export default function PatientHomePage() {
  const { user } = useAuth();
  const [nextAppt, setNextAppt] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetchLock = useRef(false);
  
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'صباح الخير' : hour < 17 ? 'مرحباً بك' : 'مساء الخير';

  useEffect(() => {
    if (fetchLock.current) return;
    fetchLock.current = true;

    appointmentsService.getMyAppointments({ limit: 50 })
      .then(res => {
        const appts = res.data || [];
        const upcoming = (appts as Appointment[])
          .filter((a: Appointment) => a.status === 'CONFIRMED' || a.status === 'PENDING')
          .sort((a: Appointment, b: Appointment) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setNextAppt(upcoming[0] || null);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafb] pb-12">
      <Topbar title="لوحة التحكم الشخصية" subtitle="مساحتك الصحية الآمنة في 2YHospital" />
      
      <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8">
        
        {/* Modern Hero Section */}
        <section className="relative overflow-hidden bg-slate-950 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl shadow-slate-950/20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-[80px] -ml-40 -mb-40" />
          
          <div className="relative z-10 flex flex-col lg:grid lg:grid-cols-[1fr_350px] gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-black uppercase tracking-wider">{formatDate(now, 'EEEE، dd MMMM')}</span>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-black leading-tight">
                {greeting}، <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-teal-300 to-blue-400">
                  {user?.name?.split(' ')[0] ?? 'ضيفنا العزيز'}
                </span>
              </h1>
              
              <p className="text-slate-400 text-sm md:text-lg max-w-xl font-medium leading-relaxed">
                نحن هنا لنهتم بصحتك. يمكنك الوصول إلى كافة خدماتنا الطبية، سجلاتك، ومواعيدك في مكان واحد مؤمن بالكامل.
              </p>
            </div>

            {/* Next Appointment Card */}
            <div className="w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest">موعدك القادم</p>
                </div>
                <Clock className="w-4 h-4 text-white/30" />
              </div>

              {isLoading ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-6 bg-white/10 rounded-lg w-3/4" />
                  <div className="h-4 bg-white/10 rounded-lg w-1/2" />
                </div>
              ) : nextAppt ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xl font-black">{nextAppt.doctor?.name ?? 'طبيبك المختص'}</p>
                    <p className="text-xs text-white/60 font-bold mt-1">{nextAppt.doctor?.specialty ?? 'زيارة طبية'}</p>
                  </div>
                  <div className="flex items-center gap-4 pt-2 border-t border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-white/40 uppercase">التاريخ</span>
                      <span className="text-sm font-bold">{formatDate(nextAppt.date, 'dd MMM')}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-white/40 uppercase">الوقت</span>
                      <span className="text-sm font-bold" dir="ltr">{nextAppt.time}</span>
                    </div>
                    <Link href={`/patient/appointments/${nextAppt.id}`} className="mr-auto w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white text-teal-400 transition-all">
                      <ChevronLeft className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center space-y-3">
                  <p className="text-sm font-bold text-white/40 italic">لا توجد مواعيد مجدولة حالياً</p>
                  <Link href="/patient/search" className="inline-block text-xs font-black text-teal-400 border-b border-teal-400/30 pb-0.5 hover:text-white hover:border-white transition-all">
                    احجز موعدك الأول الآن
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Quick Actions Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {actions.map((action) => (
            <Link key={action.href} href={action.href} className="group">
              <div className="h-full bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 relative overflow-hidden">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.color} ${action.shadow} text-white flex items-center justify-center mb-6 transition-transform group-hover:scale-110 shadow-lg`}>
                  <action.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-2">{action.label}</h3>
                <p className="text-xs font-medium text-slate-500 leading-relaxed mb-4">{action.description}</p>
                <div className="flex items-center text-[10px] font-black text-[#115e6e] uppercase tracking-wider gap-1 group-hover:gap-2 transition-all">
                  دخول الآن <ChevronLeft className="w-3 h-3" />
                </div>
                
                {/* Decorative Element */}
                <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-slate-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </section>

        {/* AI Assistant Integrated Banner */}
        <section className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          <Link href="/patient/ai-assistant" className="group">
            <div className="relative h-full overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 rounded-[2.5rem] p-8 md:p-10 text-white shadow-xl shadow-blue-600/10 transition-all hover:shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="w-20 h-20 rounded-[2rem] bg-white text-blue-600 flex items-center justify-center shadow-2xl group-hover:rotate-12 transition-transform">
                  <Bot className="w-10 h-10" />
                </div>
                <div className="flex-1 text-center md:text-right">
                  <h3 className="text-2xl font-black mb-2 flex items-center justify-center md:justify-start gap-3">
                    المساعد الصحي الذكي (AI)
                    <span className="text-[10px] bg-white/20 px-3 py-1 rounded-full border border-white/10">متاح 24/7</span>
                  </h3>
                  <p className="text-blue-100 text-sm md:text-base font-medium leading-relaxed max-w-2xl">
                    هل لديك استفسار عن نتائج تحاليلك؟ أو تود معرفة تفاصيل موعدك القادم؟ تحدث مع مساعدنا الذكي بلغة بسيطة وسهلة.
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-white group-hover:text-blue-600 transition-all">
                  <ArrowUpRight className="w-6 h-6" />
                </div>
              </div>
            </div>
          </Link>

          {/* Privacy & Trust Small Card */}
          <div className="bg-emerald-50/50 rounded-[2.5rem] border border-emerald-100 p-8 flex flex-col items-center text-center justify-center">
            <div className="w-16 h-16 rounded-3xl bg-white text-emerald-600 flex items-center justify-center shadow-sm mb-6 border border-emerald-50">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-black text-slate-800 mb-2">خصوصية بياناتك أولويتنا</h4>
            <p className="text-xs font-bold text-slate-500 leading-relaxed">
              جميع بياناتك الصحية مشفرة بالكامل ولا يمكن الوصول إليها إلا من قبل الفريق الطبي المصرح له فقط.
            </p>
            <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-100/50 px-4 py-2 rounded-xl">
              <Zap className="w-3 h-3" /> مؤمن بنظام 2Y-Vault
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

