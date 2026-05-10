'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { aiAssistantService } from '@/services/ai-assistant.service';
import { useAiAssistant } from '@/hooks/useAiAssistant';
import ChatWindow from '@/components/ai-assistant/ChatWindow';
import PatientContextBar from '@/components/ai-assistant/PatientContextBar';
import Topbar from '@/components/layout/Topbar';
import { Send, Trash2, Sparkles } from 'lucide-react';
import { useState as useInputState } from 'react';

const QUICK_PROMPTS = [
  'لخّص لي الحالة الطبية للمريض',
  'ما أبرز نتائج التحاليل؟',
  'هل هناك تفاعلات دوائية محتملة؟',
  'اقترح خطة علاجية مناسبة',
];

export default function DoctorAIPage() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId');
  const { messages, isLoading, sendMessage, clearMessages } = useAiAssistant();
  const [input, setInput] = useState('');
  const [summary, setSummary] = useState('');
  const [isFetchingSummary, setIsFetchingSummary] = useState(false);

  useEffect(() => {
    if (!patientId) return;
    setIsFetchingSummary(true);
    aiAssistantService.getPatientAISummary(patientId)
      .then((res) => setSummary(res?.summary ?? JSON.stringify(res)))
      .catch(() => {})
      .finally(() => setIsFetchingSummary(false));
  }, [patientId]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const msg = input.trim();
    setInput('');
    await sendMessage(msg);
  };

  return (
    <div className="flex flex-col h-screen bg-[#f7f8fc]">
      <Topbar title="المساعد الذكي" />
      <div className="flex flex-1 overflow-hidden">

        {/* Context sidebar */}
        {patientId && (
          <PatientContextBar
            summary={summary}
            isLoading={isFetchingSummary}
            title="ملخص المريض الذكي"
            accentColor="teal"
          />
        )}

        {/* Chat */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Sub-header */}
          <div className="bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <p className="text-sm font-semibold text-gray-800">مساعد الطبيب الذكي</p>
              {patientId && <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">مع سياق المريض</span>}
            </div>
            {messages.length > 0 && (
              <button onClick={clearMessages} className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> مسح
              </button>
            )}
          </div>

          {/* Quick prompts row (when no messages) */}
          {messages.length === 0 && (
            <div className="px-5 pt-4 flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => setInput(p)}
                  className="text-xs text-gray-600 bg-white border border-gray-200 hover:border-teal-400 hover:text-teal-700 px-3 py-1.5 rounded-full transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            emptyTitle="مساعد الطبيب الذكي"
            emptyDescription="اسألني عن المريض، التحاليل، التفاعلات الدوائية، أو أي سؤال سريري"
            accentColor="teal"
          />

          {/* Input */}
          <div className="bg-white border-t border-gray-100 p-4">
            <div className="flex gap-3 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="اكتب سؤالك السريري..."
                className="flex-1 border-2 border-gray-200 focus:border-teal-500 rounded-2xl px-4 py-3 text-sm outline-none resize-none leading-relaxed transition-colors"
                rows={2}
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="w-11 h-11 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-2xl flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
