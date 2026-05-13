'use client';

import { useEffect, useState, useRef } from 'react';
import { aiAssistantService } from '@/services/ai-assistant.service';
import { useAiAssistant } from '@/hooks/useAiAssistant';
import { adminService } from '@/services/admin.service';
import ChatWindow from '@/components/ai-assistant/ChatWindow';
import Topbar from '@/components/layout/Topbar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarDays, Receipt, Send, Sparkles, TrendingUp, Trash2, Users,
  Activity, Info, ShieldCheck, Zap, BrainCircuit, MessageSquare,
  LayoutDashboard, ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const QUICK_PROMPTS = [
  { label: 'كيف أداء المنشأة اليوم؟', icon: Activity, desc: 'ملخص سريع للحالة العامة' },
  { label: 'ملخص الإيرادات هذا الشهر', icon: Receipt, desc: 'تحليل مالي للأداء الحالي' },
  { label: 'المواعيد الملغاة هذا الأسبوع', icon: CalendarDays, desc: 'تتبع معدل الإلغاء والأسباب' },
  { label: 'إحصائيات المرضى الجدد', icon: Users, desc: 'تتبع نمو قاعدة البيانات' },
];

export default function AdminAIPage() {
  const { messages, isLoading, sendMessage, clearMessages } = useAiAssistant({ role: 'admin' });
  const [input, setInput] = useState('');
  const [opSummary, setOpSummary] = useState('');
  const [isFetchingSummary, setIsFetchingSummary] = useState(true);
  const fetchLock = useRef(false);

  useEffect(() => {
    if (fetchLock.current) return;
    fetchLock.current = true;

    Promise.all([
      adminService.getDashboard(),
      aiAssistantService.getOperationalSummary(),
    ])
      .then(([dashboard, aiRes]) => {
        const aiText = typeof aiRes === 'string' ? aiRes : aiRes?.summary ?? '';
        const stats = dashboard
          ? `مواعيد اليوم: ${dashboard.totalAppointmentsToday} · أطباء: ${dashboard.totalDoctors} · مرضى: ${dashboard.totalPatients}`
          : '';
        setOpSummary(stats ? `${stats}\n\n${aiText}` : aiText);
      })
      .catch(() => setOpSummary('تعذر تحميل الملخص التشغيلي الآن.'))
      .finally(() => setIsFetchingSummary(false));
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const msg = input.trim();
    setInput('');
    await sendMessage(msg);
  };

  return (
    <div className="flex h-screen flex-col bg-[#f4f7f8]">
      <Topbar title="المساعد الذكي الإداري" />
      
      <div className="flex flex-1 overflow-hidden p-6 gap-6 max-w-[1600px] mx-auto w-full">
        
        {/* Left Sidebar: Operational Summary & Insights */}
        <aside className="hidden w-96 flex-shrink-0 flex-col gap-6 lg:flex">
          
          {/* Summary Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white p-6 shadow-sm flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 leading-none">الملخص التشغيلي</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">AI Insight</p>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] bg-teal-50/50 border-teal-100 text-teal-700">بيانات مجمعة</Badge>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {isFetchingSummary ? (
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-3 animate-pulse rounded-full bg-slate-100" style={{ width: `${80 - i * 5}%` }} />
                  ))}
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-teal-500/20 to-transparent rounded-full" />
                  <p className="pr-4 whitespace-pre-wrap text-sm leading-7 font-bold text-slate-600">
                    {opSummary || 'لا يوجد ملخص متاح حالياً.'}
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-50">
              <div className="flex items-center gap-3 text-xs font-bold text-emerald-600 bg-emerald-50 p-3 rounded-2xl">
                <ShieldCheck className="w-4 h-4" />
                <span>يتم معالجة البيانات بخصوصية تامة</span>
              </div>
            </div>
          </div>

          {/* Quick Prompts */}
          <div className="bg-[#115e6e] rounded-[2rem] p-6 text-white shadow-xl shadow-[#115e6e]/20 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-5 h-5 text-teal-300" />
              <h3 className="text-sm font-black uppercase tracking-wide">أسئلة مقترحة</h3>
            </div>
            
            <div className="space-y-3">
              {QUICK_PROMPTS.map(({ label, icon: Icon, desc }) => (
                <button
                  key={label}
                  onClick={() => setInput(label)}
                  className="flex w-full items-start gap-3 rounded-2xl bg-white/5 hover:bg-white/10 p-3 text-right transition-all border border-white/5 group"
                >
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white group-hover:text-[#115e6e] transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white">{label}</p>
                    <p className="text-[10px] font-bold text-white/50 mt-0.5">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Chat Area */}
        <div className="flex flex-1 flex-col overflow-hidden bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-sm">
          
          {/* Chat Header */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-slate-50 bg-white/40">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#115e6e] to-[#2bbcb3] text-white flex items-center justify-center shadow-lg shadow-[#115e6e]/20">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-black text-[#115e6e]">مساعد 2YHospital الذكي</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-400">نشط الآن ومتصل بالبيانات</span>
                </div>
              </div>
            </div>
            
            {messages.length > 0 && (
              <button 
                onClick={clearMessages} 
                className="flex items-center gap-2 text-[11px] font-black text-slate-400 hover:text-red-500 transition-colors bg-slate-50 hover:bg-red-50 px-3 py-2 rounded-xl"
              >
                <Trash2 className="w-3.5 h-3.5" />
                مسح المحادثة
              </button>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-hidden relative">
            <ChatWindow
              messages={messages}
              isLoading={isLoading}
              emptyTitle="مرحباً بك في مركز التحليل الذكي"
              emptyDescription="أنا مساعدك الإداري المدعوم بالذكاء الاصطناعي. يمكنني تحليل البيانات المالية، تتبع المواعيد، وتقديم تقارير تشغيلية فورية لمساعدتك في اتخاذ القرار."
              accentColor="teal"
            />
          </div>

          {/* Input Area */}
          <div className="p-6 bg-white/60 border-t border-slate-50">
            <div className="relative max-w-4xl mx-auto flex items-end gap-3 bg-white rounded-[1.5rem] border border-slate-200 p-2 pl-4 focus-within:border-[#2bbcb3] focus-within:shadow-lg focus-within:shadow-[#2bbcb3]/5 transition-all">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="اكتب سؤالك هنا عن أداء المستشفى..."
                className="min-h-[50px] max-h-[150px] flex-1 resize-none border-none focus-visible:ring-0 text-sm font-bold bg-transparent pr-4 pt-4 custom-scrollbar"
                rows={1}
                disabled={isLoading}
              />
              
              <div className="flex items-center gap-2 pb-2">
                <Button 
                  onClick={handleSend} 
                  disabled={isLoading || !input.trim()} 
                  className="h-10 w-10 rounded-xl bg-[#115e6e] hover:bg-[#0d4753] text-white shadow-lg shadow-[#115e6e]/20 flex-shrink-0 transition-transform active:scale-90"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <p className="text-center text-[10px] font-bold text-slate-400 mt-4 flex items-center justify-center gap-2">
              <Info className="w-3 h-3" />
              يرجى ملاحظة أن المساعد يعتمد على البيانات المجمعة فقط لضمان الخصوصية.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
