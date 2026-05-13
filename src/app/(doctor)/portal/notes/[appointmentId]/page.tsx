'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { appointmentsService } from '@/services/appointments.service';
import { medicalRecordsService } from '@/services/medical-records.service';
import { aiAssistantService } from '@/services/ai-assistant.service';
import Topbar from '@/components/layout/Topbar';
import { 
  ArrowRight, Bot, CheckCircle2, Loader2, 
  Sparkles, Pencil, Activity, ClipboardList, 
  Save, Eraser, User, ChevronLeft, Zap, Info
} from 'lucide-react';
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
  const fetchLock = useRef(false);

  useEffect(() => {
    let ignore = false;
    if (!appointmentId) return;

    appointmentsService.getMyAppointment(appointmentId)
      .then(res => { if (!ignore) setAppt(res); })
      .catch(() => { if (!ignore) toast.error('فشل تحميل بيانات الموعد'); });

    return () => { ignore = true; };
  }, [appointmentId]);

  const handleGenerateDraft = async () => {
    if (!notes.trim()) { toast.error('أضف ملاحظاتك أولاً'); return; }
    setIsGenerating(true);
    try {
      const patientId = appt?.patient?.id ?? appointmentId;
      const res = await aiAssistantService.draftVisitSummary(patientId, notes);
      setDraft(res.draft ?? res.summary ?? 'تم توليد المسودة، لكن لم يصل نص قابل للعرض.');
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
    <div className="bg-[#f4f7f8] min-h-screen pb-12">
      <Topbar title="التوثيق السريري" subtitle="تسجيل الملاحظات وصياغة التقارير الذكية" />
      
      <div className="px-6 md:px-8 py-8 max-w-4xl mx-auto space-y-8">

        {/* Header & Context */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-sm font-black text-[#115e6e] hover:bg-white px-4 py-2 rounded-xl transition-all w-fit"
          >
            <ArrowRight className="w-4 h-4" /> العودة للتفاصيل
          </button>
          
          {appt && (
            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[1.5rem] px-5 py-3 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#115e6e] text-white flex items-center justify-center font-black text-lg">
                {appt.patient?.name?.[0] ?? 'م'}
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">المريض الحالي</p>
                <p className="text-sm font-black text-slate-800">{appt.patient?.name ?? 'مريض'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Clinical Progress Stepper */}
        <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white shadow-sm flex items-center justify-center gap-2 md:gap-8">
          {[
            { id: 'write', label: 'كتابة الملاحظات', icon: Pencil },
            { id: 'review', label: 'المراجعة الذكية', icon: Sparkles },
            { id: 'done', label: 'الاعتماد النهائي', icon: ShieldCheck }
          ].map((s, idx) => {
            const isDone = step === 'done' || (step === 'review' && s.id === 'write');
            const isCurrent = step === s.id;
            const Icon = s.icon;
            
            return (
              <div key={s.id} className="flex items-center gap-3">
                <div className={`flex flex-col md:flex-row items-center gap-3 ${idx > 0 ? 'ml-2' : ''}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isDone ? 'bg-emerald-500 text-white' : 
                    isCurrent ? 'bg-[#115e6e] text-white shadow-lg' : 
                    'bg-slate-100 text-slate-400'
                  }`}>
                    {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-[11px] font-black uppercase tracking-wider hidden md:block ${
                    isCurrent || isDone ? 'text-slate-800' : 'text-slate-400'
                  }`}>
                    {s.label}
                  </span>
                </div>
                {idx < 2 && <ChevronLeft className="w-4 h-4 text-slate-200 hidden md:block" />}
              </div>
            );
          })}
        </div>

        {/* Main Workspace: Step Write */}
        {step === 'write' && (
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800">ملاحظات الزيارة</h2>
                  <p className="text-xs font-medium text-slate-400 mt-1">سجل تفاصيل الحالة، الفحص، والتشخيص المبدئي.</p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50/50 border-2 border-slate-100 focus:border-[#115e6e]/30 rounded-[1.8rem] px-8 py-6 text-base font-medium text-slate-700 outline-none transition-all min-h-[300px] leading-relaxed placeholder:text-slate-300"
                placeholder="ابدأ بكتابة الأعراض، نتائج الفحص السريري، أو خطة العلاج المقترحة..."
                autoFocus
              />
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={handleGenerateDraft}
                  disabled={isGenerating || !notes.trim()}
                  className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-br from-[#115e6e] to-[#2bbcb3] text-white font-black text-sm px-8 py-4 rounded-2xl shadow-lg shadow-[#115e6e]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                >
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  توليد ملخص ذكي (AI)
                </button>
                <button
                  onClick={() => handleSave(notes)}
                  disabled={isSaving || !notes.trim()}
                  className="flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-600 font-black text-sm px-8 py-4 rounded-2xl hover:bg-slate-50 transition-all disabled:opacity-50 shadow-sm"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  حفظ مباشرة
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Workspace: Step Review AI Draft */}
        {step === 'review' && (
          <div className="space-y-6">
            {/* Original Source Reference (Compact) */}
            <div className="bg-slate-100/50 rounded-[1.8rem] border border-slate-200 p-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Info className="w-3 h-3" /> الملاحظات الأصلية للمرجعية
              </p>
              <p className="text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-wrap line-clamp-3 italic opacity-80">{notes}</p>
              <button 
                onClick={() => setStep('write')} 
                className="mt-3 text-xs font-black text-[#115e6e] hover:underline"
              >
                تعديل النص الأصلي
              </button>
            </div>

            {/* AI Refined Draft */}
            <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] border-2 border-[#115e6e]/20 shadow-xl overflow-hidden">
              <div className="p-8 bg-gradient-to-br from-[#115e6e]/5 to-transparent border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center shadow-md">
                    <Bot className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800">الصياغة السريرية المقترحة</h2>
                    <p className="text-xs font-bold text-indigo-600 mt-1 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> تم تنقيحها بواسطة الذكاء الاصطناعي
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="w-full bg-[#115e6e]/5 border border-[#115e6e]/10 focus:border-[#115e6e]/30 rounded-[1.8rem] px-8 py-6 text-base font-bold text-slate-700 outline-none transition-all min-h-[350px] leading-relaxed shadow-inner"
                  rows={10}
                />
                
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    onClick={() => handleSave(draft)}
                    disabled={isSaving || !draft.trim()}
                    className="flex-1 flex items-center justify-center gap-3 bg-emerald-600 text-white font-black text-sm px-8 py-4 rounded-2xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                    اعتماد وحفظ السجل
                  </button>
                  <button 
                    onClick={() => { setDraft(''); setStep('write'); }} 
                    className="flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-400 font-black text-sm px-8 py-4 rounded-2xl hover:text-slate-600 transition-all shadow-sm"
                  >
                    <Eraser className="w-5 h-5" />
                    إعادة الصياغة يدوياً
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Workspace: Step Done */}
        {step === 'done' && (
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white p-12 text-center shadow-xl">
            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner ring-4 ring-emerald-50/50">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-3">تم الحفظ بنجاح</h2>
            <p className="text-base font-medium text-slate-400 mb-10 max-w-sm mx-auto">
              تمت أرشفة ملاحظات الزيارة وتحديث السجل الطبي للمريض بنجاح وفق المعايير السريرية.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => router.push(`/portal/appointments/${appointmentId}`)} 
                className="w-full sm:w-auto px-10 py-4 bg-[#115e6e] text-white font-black text-sm rounded-2xl hover:bg-[#0d4753] shadow-lg shadow-[#115e6e]/20 transition-all"
              >
                العودة للملف
              </button>
              <button 
                onClick={() => { setStep('write'); setNotes(''); setDraft(''); }} 
                className="w-full sm:w-auto px-10 py-4 bg-white border border-slate-200 text-slate-600 font-black text-sm rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
              >
                إضافة ملاحظة أخرى
              </button>
            </div>
          </div>
        )}

        {/* Footer Guarantee */}
        <div className="flex items-center justify-center gap-3 text-[11px] font-black text-slate-300 uppercase tracking-widest pt-8 border-t border-slate-100">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>التوثيق السريري الآمن - 2YHospital v2.0</span>
        </div>

      </div>
    </div>
  );
}
