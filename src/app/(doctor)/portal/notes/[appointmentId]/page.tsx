'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { appointmentsService } from '@/services/appointments.service';
import { medicalRecordsService } from '@/services/medical-records.service';
import { aiAssistantService } from '@/services/ai-assistant.service';
import Topbar from '@/components/layout/Topbar';
import { ArrowRight, Bot, CheckCircle2, Loader2, Sparkles, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Appointment } from '@/types';

type Step = 'write' | 'review' | 'done';

export default function VisitNotesPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const router = useRouter();
  const [appt, setAppt] = useState<Appointment | null>(null);
  const [notes, setNotes] = useState('');
  const [draft, setDraft] = useState('');
  const [step, setStep] = useState<Step>('write');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    appointmentsService.getMyAppointment(appointmentId)
      .then(setAppt)
      .catch(() => {});
  }, [appointmentId]);

  const handleGenerateDraft = async () => {
    if (!notes.trim()) { toast.error('أضف ملاحظاتك أولاً'); return; }
    setIsGenerating(true);
    try {
      const patientId = appt?.patient?.id ?? appointmentId;
      const res = await aiAssistantService.draftVisitSummary(patientId, notes);
      setDraft(res.draft ?? res.summary ?? JSON.stringify(res));
      setStep('review');
    } catch { toast.error('فشل توليد المسودة'); }
    finally { setIsGenerating(false); }
  };

  const handleSave = async (content: string) => {
    setIsSaving(true);
    try {
      const patientId = appt?.patient?.id ?? appointmentId;
      await medicalRecordsService.addMedicalNote(patientId, content);
      toast.success('تم حفظ ملاحظات الزيارة بنجاح');
      setStep('done');
    } catch { toast.error('فشل حفظ الملاحظات'); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="bg-[#f7f8fc] min-h-screen">
      <Topbar title="ملاحظات الزيارة" />
      <div className="p-6 max-w-2xl space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
            <ArrowRight className="w-4 h-4" /> العودة
          </button>
          {appt && (
            <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-3 py-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {appt.patient?.name?.[0] ?? 'م'}
              </div>
              <p className="text-sm font-semibold text-gray-700">{appt.patient?.name ?? 'مريض'}</p>
            </div>
          )}
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-2">
          {(['write', 'review', 'done'] as Step[]).map((s, i) => {
            const labels = { write: 'الملاحظات', review: 'المراجعة', done: 'تم الحفظ' };
            const isDone = step === 'done' || (step === 'review' && s === 'write');
            const isCurrent = step === s;
            return (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`flex items-center gap-2 ${i > 0 ? 'flex-1' : ''}`}>
                  {i > 0 && <div className={`h-0.5 flex-1 ${isDone ? 'bg-teal-500' : 'bg-gray-200'}`} />}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${isDone ? 'bg-teal-500 text-white' : isCurrent ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                </div>
                <span className={`text-xs font-medium hidden sm:block ${isCurrent ? 'text-gray-900' : 'text-gray-400'}`}>{labels[s]}</span>
              </div>
            );
          })}
        </div>

        {/* Step: Write */}
        {step === 'write' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Pencil className="w-4 h-4 text-blue-600" /> ملاحظاتك السريرية
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">اكتب ملاحظاتك ثم سنولّد ملخصاً ذكياً لمراجعته</p>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border-2 border-gray-200 focus:border-blue-500 rounded-xl px-4 py-3 text-sm outline-none transition-colors resize-none leading-relaxed"
              rows={7}
              placeholder="الأعراض، الفحص السريري، التشخيص، خطة العلاج، التوصيات..."
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleGenerateDraft}
                disabled={isGenerating || !notes.trim()}
                className="flex items-center gap-2 bg-gradient-to-l from-purple-600 to-blue-600 hover:opacity-90 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {isGenerating ? 'جارٍ توليد المسودة...' : 'توليد ملخص ذكي'}
              </button>
              <button
                onClick={() => handleSave(notes)}
                disabled={isSaving || !notes.trim()}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                حفظ مباشرة
              </button>
            </div>
          </div>
        )}

        {/* Step: Review AI draft */}
        {step === 'review' && (
          <div className="space-y-4">
            {/* Original notes (collapsed) */}
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4">
              <p className="text-xs font-semibold text-gray-500 mb-2">ملاحظاتك الأصلية</p>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap line-clamp-3">{notes}</p>
              <button onClick={() => setStep('write')} className="text-xs text-blue-600 hover:text-blue-800 mt-2">تعديل</button>
            </div>

            {/* AI Draft */}
            <div className="bg-white rounded-2xl border border-purple-200 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">المسودة الذكية</p>
                  <p className="text-xs text-purple-600">راجع وعدّل قبل الاعتماد</p>
                </div>
              </div>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="w-full border-2 border-purple-100 focus:border-purple-400 rounded-xl px-4 py-3 text-sm outline-none transition-colors resize-none leading-relaxed bg-purple-50/30"
                rows={8}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => handleSave(draft)}
                  disabled={isSaving || !draft.trim()}
                  className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  اعتماد وحفظ
                </button>
                <button onClick={() => { setDraft(''); setStep('write'); }} className="text-sm text-gray-500 hover:text-gray-700 px-3">
                  إعادة الكتابة
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step: Done */}
        {step === 'done' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-teal-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">تم حفظ الملاحظات</h2>
            <p className="text-sm text-gray-500 mt-1">تم حفظ ملاحظات الزيارة في السجل الطبي بنجاح</p>
            <div className="flex gap-3 justify-center mt-6">
              <button onClick={() => router.back()} className="btn-secondary text-sm">العودة للموعد</button>
              <button onClick={() => { setStep('write'); setNotes(''); setDraft(''); }} className="btn-primary text-sm">
                ملاحظة جديدة
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
