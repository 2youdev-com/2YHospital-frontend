'use client';

import { useEffect, useState } from 'react';
import { aiAssistantService } from '@/services/ai-assistant.service';
import { useAiAssistant } from '@/hooks/useAiAssistant';
import { adminService } from '@/services/admin.service';
import ChatWindow from '@/components/ai-assistant/ChatWindow';
import Topbar from '@/components/layout/Topbar';
import { Send, Trash2, Sparkles, TrendingUp, CalendarDays, Receipt, Users } from 'lucide-react';

const QUICK_PROMPTS = [
  { label: 'كيف أداء المنشأة اليوم؟', icon: TrendingUp },
  { label: 'ملخص الإيرادات هذا الشهر', icon: Receipt },
  { label: 'المواعيد الملغاة هذا الأسبوع', icon: CalendarDays },
  { label: 'إحصائيات المرضى الجدد', icon: Users },
];

export default function AdminAIPage() {
  const { messages, isLoading, sendMessage, clearMessages } = useAiAssistant();
  const [input, setInput] = useState('');
  const [opSummary, setOpSummary] = useState('');
  const [isFetchingSummary, setIsFetchingSummary] = useState(true);

  useEffect(() => {
    // Combine real dashboard data into a contextual summary
    Promise.all([
      adminService.getDashboard(),
      aiAssistantService.getOperationalSummary(),
    ])
      .then(([dashboard, aiRes]) => {
        const aiText = typeof aiRes === 'string' ? aiRes : aiRes?.summary ?? '';
        const stats = dashboard ? `مواعيد اليوم: ${dashboard.totalAppointmentsToday} · أطباء: ${dashboard.totalDoctors} · مرضى: ${dashboard.totalPatients}` : '';
        setOpSummary(stats ? `${stats}\n\n${aiText}` : aiText);
      })
      .catch(() => {})
      .finally(() => setIsFetchingSummary(false));
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const msg = input.trim();
    setInput('');
    await sendMessage(msg);
  };

  return (
    <div className="flex flex-col h-screen bg-[#f7f8fc]">
      <Topbar title="المساعد الذكي الإداري" />
      <div className="flex flex-1 overflow-hidden">

        {/* Left panel */}
        <div className="w-72 border-l border-gray-200 bg-white flex flex-col flex-shrink-0">
          {/* Summary */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-gray-800">الملخص التشغيلي</h3>
            </div>
            {isFetchingSummary ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${70 + i * 8}%` }} />
                ))}
              </div>
            ) : opSummary ? (
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-blue-50 rounded-2xl p-3 border border-blue-100">
                {opSummary}
              </p>
            ) : (
              <p className="text-sm text-gray-400">لا يوجد ملخص متاح</p>
            )}
          </div>

          {/* Quick prompts */}
          <div className="border-t border-gray-100 p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">أسئلة سريعة</p>
            {QUICK_PROMPTS.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => setInput(label)}
                className="w-full text-right text-xs text-gray-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-xl transition-colors flex items-center gap-2"
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <p className="text-sm font-semibold text-gray-800">المساعد الذكي الإداري</p>
            </div>
            {messages.length > 0 && (
              <button onClick={clearMessages} className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> مسح المحادثة
              </button>
            )}
          </div>

          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            emptyTitle="المساعد الذكي الإداري"
            emptyDescription="اسألني عن أداء المنشأة، الإيرادات، المواعيد، أو أي تقرير تحتاجه"
            accentColor="blue"
          />

          <div className="bg-white border-t border-gray-100 p-4">
            <div className="flex gap-3 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="اكتب سؤالك..."
                className="flex-1 border-2 border-gray-200 focus:border-blue-500 rounded-2xl px-4 py-3 text-sm outline-none resize-none leading-relaxed transition-colors"
                rows={2}
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="w-11 h-11 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl flex items-center justify-center transition-colors flex-shrink-0"
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
