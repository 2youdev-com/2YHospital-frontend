// src/app/(patient)/patient/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { patientsService } from '@/services/patients.service';
import { LoadingSpinner } from '@/components/shared';
import Topbar from '@/components/layout/Topbar';
import {
  User, Phone, Calendar, Droplets, AlertTriangle, Heart,
  Edit3, Save, X, Plus, Trash2,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
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

  useEffect(() => {
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
      toast.success('تم حفظ الملف الشخصي');
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

  if (isLoading) return <><Topbar title="ملفي الشخصي" /><LoadingSpinner /></>;

  return (
    <div className="bg-[#f7f8fc] min-h-screen">
      <Topbar title="ملفي الشخصي" />

      <div className="p-6 max-w-2xl space-y-5">
        {/* Header card */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="h-24 bg-gradient-to-l from-teal-500 to-blue-600" />
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-teal-600 font-black text-3xl">
                {profile?.name?.[0] ?? 'م'}
              </div>
              {!isEditing ? (
                <button
                  onClick={() => { setIsEditing(true); setForm(profile ?? {}); }}
                  className="flex items-center gap-2 text-sm font-medium bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-xl transition-colors border border-gray-200"
                >
                  <Edit3 className="w-4 h-4" /> تعديل الملف
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-1.5 text-sm font-medium bg-gray-50 hover:bg-gray-100 text-gray-600 px-3 py-2 rounded-xl border border-gray-200"
                  >
                    <X className="w-4 h-4" /> إلغاء
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" /> {isSaving ? 'جاري الحفظ...' : 'حفظ'}
                  </button>
                </div>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {profile?.name || <span className="text-gray-400 italic text-base font-normal">لم يُحدد الاسم</span>}
            </h2>
            <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1" dir="ltr">
              <Phone className="w-3.5 h-3.5 text-gray-400" />
              {profile?.phone}
            </p>
            {profile?.mrn && (
              <p className="text-xs text-gray-400 mt-1 font-mono">رقم الملف: {profile.mrn}</p>
            )}
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <User className="w-4 h-4 text-teal-600" /> المعلومات الأساسية
          </h3>

          {isEditing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">الاسم بالعربية</label>
                <input
                  type="text"
                  value={(form as any).nameAr ?? form.name ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, nameAr: e.target.value, name: e.target.value }))}
                  className="input-field"
                  placeholder="الاسم الكامل بالعربية"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">الجنس</label>
                <select
                  value={form.gender ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value as 'MALE' | 'FEMALE' }))}
                  className="input-field bg-white"
                >
                  <option value="">اختر الجنس</option>
                  <option value="MALE">ذكر</option>
                  <option value="FEMALE">أنثى</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">تاريخ الميلاد</label>
                <input
                  type="date"
                  value={form.dateOfBirth ? form.dateOfBirth.split('T')[0] : ''}
                  onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">فصيلة الدم</label>
                <select
                  value={form.bloodType ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, bloodType: e.target.value }))}
                  className="input-field bg-white"
                >
                  <option value="">غير معروف</option>
                  {BLOOD_TYPES.map((bt) => (
                    <option key={bt} value={bt}>{bt}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'الجنس', value: profile?.gender === 'MALE' ? 'ذكر' : profile?.gender === 'FEMALE' ? 'أنثى' : '—', icon: User },
                { label: 'تاريخ الميلاد', value: profile?.dateOfBirth ? formatDate(profile.dateOfBirth) : '—', icon: Calendar },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                  <p className="text-sm font-semibold text-gray-900">{value}</p>
                </div>
              ))}
              {profile?.bloodType && (
                <div className="bg-red-50 rounded-xl p-3 flex items-center gap-2 col-span-1">
                  <Droplets className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-red-400">فصيلة الدم</p>
                    <p className="text-lg font-black text-red-700">{profile.bloodType}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Allergies */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" /> الحساسية
          </h3>

          <div className="flex flex-wrap gap-2">
            {(isEditing ? form.allergies : profile?.allergies)?.map((a) => (
              <span key={a} className="flex items-center gap-1.5 px-3 py-1 text-sm rounded-full bg-orange-100 text-orange-800 font-medium">
                {a}
                {isEditing && (
                  <button onClick={() => removeAllergy(a)} className="text-orange-600 hover:text-orange-900">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
            {((isEditing ? form.allergies : profile?.allergies)?.length ?? 0) === 0 && (
              <span className="text-sm text-gray-400">لا توجد حساسية مسجلة</span>
            )}
          </div>

          {isEditing && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAllergy(newAllergy); } }}
                  placeholder="أضف حساسية..."
                  className="input-field flex-1"
                />
                <button
                  onClick={() => addAllergy(newAllergy)}
                  className="btn-primary flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_ALLERGIES.filter((a) => !(form.allergies ?? []).includes(a)).map((a) => (
                  <button
                    key={a}
                    onClick={() => addAllergy(a)}
                    className="text-xs px-2.5 py-1 rounded-full bg-gray-100 hover:bg-orange-100 text-gray-600 hover:text-orange-700 transition-colors"
                  >
                    + {a}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chronic Diseases */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500" /> الأمراض المزمنة
          </h3>

          <div className="flex flex-wrap gap-2">
            {(isEditing ? form.chronicDiseases : profile?.chronicDiseases)?.map((d) => (
              <span key={d} className="flex items-center gap-1.5 px-3 py-1 text-sm rounded-full bg-red-100 text-red-800 font-medium">
                {d}
                {isEditing && (
                  <button
                    onClick={() => setForm((f) => ({ ...f, chronicDiseases: (f.chronicDiseases ?? []).filter((x) => x !== d) }))}
                    className="text-red-600 hover:text-red-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
            {((isEditing ? form.chronicDiseases : profile?.chronicDiseases)?.length ?? 0) === 0 && (
              <span className="text-sm text-gray-400">لا توجد أمراض مزمنة مسجلة</span>
            )}
          </div>

          {isEditing && (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="أضف مرضاً مزمناً..."
                className="input-field flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (val && !(form.chronicDiseases ?? []).includes(val)) {
                      setForm((f) => ({ ...f, chronicDiseases: [...(f.chronicDiseases ?? []), val] }));
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = (e.currentTarget.previousSibling as HTMLInputElement);
                  const val = input.value.trim();
                  if (val && !(form.chronicDiseases ?? []).includes(val)) {
                    setForm((f) => ({ ...f, chronicDiseases: [...(f.chronicDiseases ?? []), val] }));
                    input.value = '';
                  }
                }}
                className="btn-primary flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}