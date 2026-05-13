'use client';

import { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import { useAiAssistant } from '@/hooks/useAiAssistant';
import ChatWindow from '@/components/ai-assistant/ChatWindow';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Bot, ShieldCheck, Info, Sparkles, Trash2, Zap } from 'lucide-react';

const QUICK_PROMPTS = [
  'ما هو موعدي القادم؟',
  'لخص لي آخر نتائج تحاليلي',
  'هل لدي أي فواتير غير مدفوعة؟',
  'كيف يمكنني حجز موعد جديد؟',
];

export default function PatientAIAssistantPage() {
  const { messages, isLoading, sendMessage, clearMessages } = useAiAssistant({
    role: 'patient',
  });
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const msg = input.trim();
    setInput('');
    await sendMessage(msg);
  };

  return (
    <div className="flex h-screen flex-col bg-[#f4f7f8]">
      <Topbar title="المساعد الصحي الذكي" subtitle="رفيقك الدائم للإجابة على استفساراتك الصحية" />
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Main Chat Area */}
        <div className="flex flex-1 flex-col overflow-hidden relative">
          
          {/* Header Info Bar */}
          <div className="flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/10">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-800">2Y-Health Assistant</h3>
                  <span className="flex items-center gap-1 text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg border border-blue-100 uppercase tracking-wider">
                    <Zap className="w-2.5 h-2.5" /> Online
                  </span>
                </div>
                <p className="text-[10px] font-bold text-slate-400">مساعدك الشخصي ضمن سياقك الصحي فقط</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-1.5 text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                بيانات مؤمنة
              </div>
              {messages.length > 0 && (
                <button 
                  onClick={clearMessages} 
                  className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-rose-50 text-rose-500 transition-all shadow-sm"
                  title="مسح المحادثة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Prompts */}
          {messages.length === 0 && (
            <div className="absolute top-24 left-0 right-0 z-10 flex justify-center px-6">
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setInput(prompt)}
                    className="group flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-100 text-xs font-bold text-slate-600 shadow-sm transition-all hover:border-blue-600 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:text-amber-500" />
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages Window */}
          <div className="flex-1 overflow-hidden">
            <ChatWindow
              messages={messages}
              isLoading={isLoading}
              emptyTitle="مرحبا بك، أنا هنا لمساعدتك"
              emptyDescription="يمكنك سؤالي عن نتائج تحاليلك، مواعيدك، أو أي معلومة حول خدماتنا الصحية."
              accentColor="blue"
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
                  placeholder="اكتب سؤالك هنا بوضوح..."
                  className="min-h-[60px] w-full resize-none bg-slate-50 border-slate-100 rounded-[1.5rem] pr-6 pl-14 py-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 placeholder:font-medium shadow-inner"
                  rows={2}
                  disabled={isLoading}
                />
                <div className="absolute left-4 bottom-4 text-[10px] font-black text-slate-300 pointer-events-none">
                  Press Enter to send
                </div>
              </div>
              
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className={`h-[60px] w-[60px] flex-shrink-0 rounded-[1.5rem] flex items-center justify-center shadow-lg transition-all ${
                  isLoading || !input.trim() 
                  ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20 hover:scale-105 active:scale-95'
                }`}
              >
                <Send className={`w-6 h-6 ${isLoading ? 'animate-pulse' : ''}`} />
              </button>
            </div>
            
            {/* Disclaimer */}
            <div className="max-w-4xl mx-auto mt-4 flex items-center justify-center gap-4 text-[10px] font-black text-slate-400">
              <Info className="w-3.5 h-3.5 text-blue-500" />
              <span>تنبيه: هذا المساعد لخدمتك معلوماتياً ولا يعد بديلاً عن الاستشارة الطبية المباشرة.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

