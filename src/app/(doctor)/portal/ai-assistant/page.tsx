'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { aiAssistantService } from '@/services/ai-assistant.service';
import { useAiAssistant } from '@/hooks/useAiAssistant';
import ChatWindow from '@/components/ai-assistant/ChatWindow';
import PatientContextBar from '@/components/ai-assistant/PatientContextBar';
import Topbar from '@/components/layout/Topbar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Sparkles, Trash2, Bot, Info, Activity, ShieldCheck, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const QUICK_PROMPTS = [
  'لخص لي الحالة الطبية للمريض',
  'ما أبرز نتائج التحاليل؟',
  'هل هناك تفاعلات دوائية محتملة؟',
  'اقترح مسودة خطة متابعة',
];

export default function DoctorAIPage() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId');
  const { messages, isLoading, sendMessage, clearMessages } = useAiAssistant({
    role: 'doctor',
    patientId: patientId ?? undefined,
  });
  const [input, setInput] = useState('');
  const [summary, setSummary] = useState('');
  const [isFetchingSummary, setIsFetchingSummary] = useState(false);
  const fetchLock = useRef(false);

  useEffect(() => {
    let ignore = false;
    if (!patientId) {
      setSummary('');
      return;
    }

    setIsFetchingSummary(true);
    aiAssistantService.getPatientAISummary(patientId)
      .then((res) => { if (!ignore) setSummary(res?.summary ?? 'لا يوجد ملخص قابل للعرض حاليا.'); })
      .catch(() => { if (!ignore) setSummary('تعذر تحميل الملخص الآن.'); })
      .finally(() => { if (!ignore) setIsFetchingSummary(false); });

    return () => { ignore = true; };
  }, [patientId]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const msg = input.trim();
    setInput('');
    await sendMessage(msg);
  };

  return (
    <div className="flex h-screen flex-col bg-[#f4f7f8]">
      <Topbar title="المساعد السريري الذكي" subtitle="تحليل البيانات الطبية المدعوم بالذكاء الاصطناعي" />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Patient Context (Optional) */}
        {patientId && (
          <div className="hidden lg:block w-80 bg-white border-l border-slate-200 overflow-y-auto">
            <PatientContextBar
              summary={summary}
              isLoading={isFetchingSummary}
              title="سياق المريض"
              accentColor="teal"
            />
          </div>
        )}

        {/* Main Chat Area */}
        <div className="flex flex-1 flex-col overflow-hidden relative">
          
          {/* Header Info Bar */}
          <div className="flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/10">
                <Bot className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-800">2Y-Intelligence Core</h3>
                  <span className="flex items-center gap-1 text-[9px] font-black bg-teal-50 text-teal-600 px-2 py-0.5 rounded-lg border border-teal-100 uppercase tracking-wider">
                    <Zap className="w-2.5 h-2.5" /> Active
                  </span>
                </div>
                <p className="text-[10px] font-bold text-slate-400">نموذج طبي متخصص متوافق مع معايير HIPAA</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-1.5 text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                تشفير END-TO-END
              </div>
              {messages.length > 0 && (
                <button 
                  onClick={clearMessages} 
                  className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                  title="مسح المحادثة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Prompts Container */}
          {messages.length === 0 && (
            <div className="absolute top-24 left-0 right-0 z-10 flex justify-center px-6">
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setInput(prompt)}
                    className="group flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-100 text-xs font-bold text-slate-600 shadow-sm transition-all hover:border-[#115e6e] hover:bg-[#115e6e] hover:text-white hover:shadow-lg"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:text-white" />
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages Window */}
          <div className="flex-1 overflow-hidden bg-slate-50/50">
            <ChatWindow
              messages={messages}
              isLoading={isLoading}
              emptyTitle="مرحبا بك في غد الطب"
              emptyDescription="أنا مساعدك السريري الذكي. يمكنني مساعدتك في تحليل نتائج الفحوصات، اقتراح خطط علاجية، أو تلخيص التاريخ المرضي بدقة وسرعة."
              accentColor="teal"
            />
          </div>

          {/* Input Area */}
          <div className="bg-white border-t border-slate-200 p-6 md:p-8">
            <div className="max-w-4xl mx-auto flex items-end gap-4">
              <div className="relative flex-1 group">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="اسأل أي سؤال سريري حول المريض أو الحالة..."
                  className="min-h-[60px] w-full resize-none bg-slate-50 border-slate-100 rounded-[1.5rem] pr-6 pl-14 py-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-[#115e6e]/20 focus:border-[#115e6e] transition-all placeholder:text-slate-400 placeholder:font-medium shadow-inner"
                  rows={2}
                  disabled={isLoading}
                />
                <div className="absolute left-4 bottom-4 text-[10px] font-black text-slate-300 pointer-events-none">
                  SHIFT + ENTER لسطر جديد
                </div>
              </div>
              
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className={`h-[60px] w-[60px] flex-shrink-0 rounded-[1.5rem] flex items-center justify-center shadow-lg transition-all ${
                  isLoading || !input.trim() 
                  ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                  : 'bg-[#115e6e] text-white hover:bg-[#0d4753] shadow-[#115e6e]/20 hover:scale-105 active:scale-95'
                }`}
              >
                <Send className={`w-6 h-6 ${isLoading ? 'animate-pulse' : ''}`} />
              </button>
            </div>
            
            {/* Disclaimer */}
            <div className="max-w-4xl mx-auto mt-4 flex items-center justify-center gap-4 text-[10px] font-black text-slate-400">
              <Info className="w-3.5 h-3.5 text-[#2bbcb3]" />
              <span>تنبيه: يجب مراجعة مخرجات الذكاء الاصطناعي من قبل الطبيب المسؤول قبل اتخاذ أي قرار سريري.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
