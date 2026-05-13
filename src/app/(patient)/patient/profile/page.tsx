// src/app/(patient)/patient/profile/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { patientsService } from '@/services/patients.service';
import Topbar from '@/components/layout/Topbar';
import {
  User, Phone, Calendar, Droplets, AlertTriangle, Heart,
  Edit3, Save, X, Plus, Trash2, ShieldCheck, 
  Sparkles, Zap, Lock, Fingerprint, Camera,
  Contact, Activity, MapPin, Mail, ChevronLeft,
  Loader2, Download
} from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Patient } from '@/types';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const COMMON_ALLERGIES = ['البنسلين', 'الأسبرين', 'المضادات الحيوية', 'اللاتكس', 'الغلوتين', 'المكسرات', 'الحليب', 'البيض'];

export default function PatientProfilePage() {
  const [profile, setProfile] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<Partial<Patient>>({});
  const [newAllergy, setNewAllergy] = useState('');
  const fetchLock = useRef(false);

  useEffect(() => {
    if (fetchLock.current) return;
    fetchLock.current = true;

    patientsService.getProfile()
      .then((p) => {
        setProfile(p);
        setForm(p);
      })
      .catch(() => toast.error('فشل تحميل الملف الشخصي'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await patientsService.updateProfile({
        nameAr: form.nameAr ?? form.name,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        bloodType: form.bloodType,
        allergies: form.allergies,
        chronicDiseases: form.chronicDiseases,
      } as any);
      setProfile({ ...profile, ...updated, name: updated.nameAr ?? updated.nameEn ?? profile?.name ?? '' });
      setIsEditing(false);
      toast.success('تم تحديث بياناتك بنجاح');
    } catch {
      toast.error('فشل حفظ التغييرات');
    } finally {
      setIsSaving(false);
    }
  };

  const addAllergy = (allergy: string) => {
    if (!allergy.trim()) return;
    const current = form.allergies ?? [];
    if (current.includes(allergy)) return;
    setForm((f) => ({ ...f, allergies: [...current, allergy] }));
    setNewAllergy('');
  };

  const removeAllergy = (allergy: string) => {
    setForm((f) => ({ ...f, allergies: (f.allergies ?? []).filter((a) => a !== allergy) }));
  };

  if (isLoading) return (
    <div className="bg-[#f4f7f8] min-h-screen">
      <Topbar title="ملفي الشخصي" />
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div className="h-64 rounded-[3rem] bg-white/50 animate-pulse border border-slate-100" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48 rounded-3xl bg-white/50 animate-pulse" />
          <div className="h-48 rounded-3xl bg-white/50 animate-pulse" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#f4f7f8] min-h-screen pb-12">
      <Topbar title="الهوية الرقمية الصحية" subtitle="إدارة بياناتك الشخصية وسجلك الحيوي" />

      <div className="px-6 md:px-8 py-8 max-w-4xl mx-auto space-y-8">
        
        {/* Profile Header Hero */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#115e6e] to-blue-900 rounded-[3rem] shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[100px] -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] -ml-32 -mb-32" />
          </div>

          <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-[2.5rem] bg-white/10 backdrop-blur-xl border-4 border-white/20 p-1 shadow-2xl group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-[2rem] bg-white flex items-center justify-center text-[#115e6e] font-black text-5xl">
                  {profile?.name?.[0] ?? 'م'}
                </div>
              </div>
              <button className="absolute bottom-1 right-1 w-10 h-10 rounded-2xl bg-white text-[#115e6e] shadow-lg flex items-center justify-center hover:bg-teal-50 transition-all border-4 border-[#115e6e]/20">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 text-center md:text-right text-white">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h2 className="text-3xl font-black tracking-tight">{profile?.name || 'مريض غير مسجل'}</h2>
                <ShieldCheck className="w-6 h-6 text-teal-400" />
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <span className="flex items-center gap-2 text-teal-100/70 text-sm font-bold bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                  <Fingerprint className="w-4 h-4" /> MRN: {profile?.mrn || '—'}
                </span>
                <span className="flex items-center gap-2 text-teal-100/70 text-sm font-bold bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                  <Phone className="w-4 h-4" /> {profile?.phone}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {!isEditing ? (
                <button
                  onClick={() => { setIsEditing(true); setForm(profile ?? {}); }}
                  className="bg-white text-[#115e6e] px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-black/10 hover:bg-teal-50 transition-all flex items-center gap-3"
                >
                  <Edit3 className="w-4 h-4" /> تعديل البيانات
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-white/10 text-white border border-white/20 px-6 py-3.5 rounded-2xl font-black text-sm hover:bg-white/20 transition-all"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-white text-[#115e6e] px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl hover:bg-teal-50 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    حفظ التغييرات
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Info Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white p-8 shadow-sm space-y-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800">البيانات السريرية</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">المعلومات الشخصية والطبية</p>
                  </div>
                </div>
                <Lock className="w-4 h-4 text-slate-200" />
              </div>

              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">الاسم بالكامل</label>
                    <input
                      type="text"
                      value={(form as any).nameAr ?? form.name ?? ''}
                      onChange={(e) => setForm((f) => ({ ...f, nameAr: e.target.value, name: e.target.value }))}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-teal-500/10 focus:bg-white rounded-2xl px-5 py-3.5 text-sm font-black text-slate-700 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">الجنس</label>
                    <select
                      value={form.gender ?? ''}
                      onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value as 'MALE' | 'FEMALE' }))}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-teal-500/10 focus:bg-white rounded-2xl px-5 py-3.5 text-sm font-black text-slate-700 transition-all outline-none appearance-none"
                    >
                      <option value="MALE">ذكر</option>
                      <option value="FEMALE">أنثى</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">تاريخ الميلاد</label>
                    <input
                      type="date"
                      value={form.dateOfBirth ? form.dateOfBirth.split('T')[0] : ''}
                      onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-teal-500/10 focus:bg-white rounded-2xl px-5 py-3.5 text-sm font-black text-slate-700 transition-all outline-none"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">فصيلة الدم</label>
                    <select
                      value={form.bloodType ?? ''}
                      onChange={(e) => setForm((f) => ({ ...f, bloodType: e.target.value }))}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-teal-500/10 focus:bg-white rounded-2xl px-5 py-3.5 text-sm font-black text-slate-700 transition-all outline-none appearance-none"
                    >
                      <option value="">غير محدد</option>
                      {BLOOD_TYPES.map((bt) => (
                        <option key={bt} value={bt}>{bt}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <InfoItem label="تاريخ الميلاد" value={profile?.dateOfBirth ? formatDate(profile.dateOfBirth) : '—'} icon={Calendar} />
                  <InfoItem label="الجنس" value={profile?.gender === 'MALE' ? 'ذكر' : 'أنثى'} icon={User} />
                  <div className="bg-rose-50/50 rounded-3xl p-5 border border-rose-100 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/20">
                      <Droplets className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-rose-300 uppercase tracking-widest">فصيلة الدم</p>
                      <p className="text-xl font-black text-rose-600">{profile?.bloodType || '—'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Medical Alerts Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">التنبيهات الطبية</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">الحساسية والحالات المزمنة</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">الحساسية المسجلة</p>
                  <div className="flex flex-wrap gap-2">
                    {(isEditing ? form.allergies : profile?.allergies)?.map((a) => (
                      <span key={a} className="flex items-center gap-2 px-4 py-2 text-sm rounded-2xl bg-orange-50 text-orange-700 font-black border border-orange-100 group">
                        {a}
                        {isEditing && (
                          <button onClick={() => removeAllergy(a)} className="text-orange-400 hover:text-orange-600">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </span>
                    )) || <span className="text-sm font-bold text-slate-300">لا توجد سجلات</span>}
                  </div>
                </div>

                {isEditing && (
                  <div className="pt-4 border-t border-slate-50 space-y-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newAllergy}
                        onChange={(e) => setNewAllergy(e.target.value)}
                        placeholder="أضف حساسية جديدة..."
                        className="flex-1 bg-slate-50 border-2 border-transparent focus:border-teal-500/10 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 outline-none"
                      />
                      <button onClick={() => addAllergy(newAllergy)} className="w-12 h-12 bg-[#115e6e] text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all">
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {COMMON_ALLERGIES.filter((a) => !(form.allergies ?? []).includes(a)).map((a) => (
                        <button key={a} onClick={() => addAllergy(a)} className="text-[10px] font-black px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-orange-50 hover:text-orange-600 transition-all border border-transparent hover:border-orange-100">
                          + {a}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            {/* Trust & Security Card */}
            <div className="bg-gradient-to-br from-slate-900 to-[#115e6e] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16" />
              <div className="relative z-10 space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-teal-300">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-xl font-black mb-2">بياناتك في أمان</h4>
                  <p className="text-teal-100/70 text-xs font-medium leading-relaxed">
                    نحن نستخدم تقنيات تشفير عسكرية لحماية ملفك الطبي. لا يمكن لأحد الوصول لبياناتك سوى الأطباء المصرح لهم فقط.
                  </p>
                </div>
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-teal-200">HIPAA Compliant</span>
                  <Lock className="w-4 h-4 text-teal-300" />
                </div>
              </div>
            </div>

            {/* Health Card Preview */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white p-8 shadow-sm space-y-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">معاينة بطاقة المستشفى</p>
              <div className="bg-gradient-to-l from-teal-600 to-blue-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden aspect-[1.6/1] flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <Sparkles className="w-6 h-6 text-white/30" />
                  <span className="text-[10px] font-black tracking-tighter bg-white/20 px-2 py-1 rounded-md">2Y HOSPITAL</span>
                </div>
                <div>
                  <p className="text-lg font-black truncate">{profile?.name || 'مريض افتراضي'}</p>
                  <p className="text-[10px] font-mono opacity-60">ID: {profile?.mrn?.toUpperCase() || 'MRN-PENDING'}</p>
                </div>
              </div>
              <button className="w-full py-4 rounded-2xl bg-slate-50 text-slate-500 font-black text-xs hover:bg-slate-100 transition-all border border-slate-100 flex items-center justify-center gap-3">
                <Download className="w-4 h-4" />
                تحميل البطاقة الرقمية
              </button>
            </div>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="flex items-center justify-center gap-6 text-[10px] font-black text-slate-300 uppercase tracking-widest pt-8 border-t border-slate-100">
          <Activity className="w-4 h-4 text-teal-400" />
          <span>تحديث تلقائي للملف عبر كافة الأنظمة الطبية</span>
        </div>

      </div>
    </div>
  );
}

function InfoItem({ label, value, icon: Icon }: any) {
  return (
    <div className="bg-slate-50/50 rounded-3xl p-5 border border-slate-100 group hover:bg-white hover:shadow-lg transition-all">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-blue-500 transition-all">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <p className="text-sm font-black text-slate-700">{value}</p>
        </div>
      </div>
    </div>
  );
}