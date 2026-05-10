'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/context/AuthContext';
import { Phone, ShieldCheck, ArrowRight, Hospital } from 'lucide-react';

type Step = 'phone' | 'otp';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setIsLoading(true);
    try {
      await authService.sendOtp(phone);
      toast.success('تم إرسال رمز التحقق');
      setStep('otp');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || 'فشل إرسال رمز التحقق');
    } finally { setIsLoading(false); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setIsLoading(true);
    try {
      const tokens = await authService.verifyOtp(phone, otp);
      login(tokens);
      toast.success('تم تسجيل الدخول بنجاح');
      router.push(tokens.user.role === 'DOCTOR' ? '/portal' : '/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || 'رمز التحقق غير صحيح');
    } finally { setIsLoading(false); }
  };

  return (
    <div className="w-full">
      {/* Glass card */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/50">

        {/* Top brand strip */}
        <div className="relative bg-gradient-to-bl from-blue-700 via-blue-600 to-teal-600 px-8 pt-10 pb-14 text-white overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full bg-white/5" />
          <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute top-4 right-16 w-12 h-12 rounded-full bg-teal-400/20" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                <Hospital className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight">2YHospital</h1>
                <p className="text-blue-200 text-xs mt-0.5">المنصة الرقمية الموحدة</p>
              </div>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all
                ${step === 'phone' ? 'bg-white text-blue-700' : 'bg-white/20 text-white/70'}`}>
                <Phone className="w-3 h-3" /> رقم الجوال
              </div>
              <ArrowRight className="w-4 h-4 text-white/40" />
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all
                ${step === 'otp' ? 'bg-white text-blue-700' : 'bg-white/20 text-white/40'}`}>
                <ShieldCheck className="w-3 h-3" /> رمز التحقق
              </div>
            </div>
          </div>
        </div>

        {/* Form area — pulled up into the gradient */}
        <div className="-mt-6 mx-6 bg-white rounded-2xl shadow-lg border border-gray-100 px-6 py-6 mb-6">
          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">أدخل رقم جوالك</h2>
                <p className="text-xs text-gray-500 mt-0.5">سنرسل لك رمز تحقق مكوّن من 6 أرقام</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">رقم الجوال</label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-mono">+966</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="05XXXXXXXX"
                    className="w-full border-2 border-gray-200 focus:border-blue-500 rounded-xl px-4 py-3 pr-14 text-sm font-mono outline-none transition-colors"
                    dir="ltr"
                    required
                    autoFocus
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading || !phone.trim()}
                className="w-full bg-gradient-to-l from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-blue-200"
              >
                {isLoading ? (
                  <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> جارٍ الإرسال...</>
                ) : 'إرسال رمز التحقق'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">أدخل رمز التحقق</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  أُرسل إلى <span className="font-mono font-semibold text-blue-600" dir="ltr">{phone}</span>
                </p>
              </div>

              {/* OTP boxes */}
              <div dir="ltr" className="flex gap-2 justify-center">
                {[0,1,2,3,4,5].map((i) => (
                  <div
                    key={i}
                    className={`w-11 h-14 border-2 rounded-xl flex items-center justify-center text-xl font-mono font-bold transition-colors
                      ${otp[i] ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-400'}`}
                  >
                    {otp[i] ?? '·'}
                  </div>
                ))}
              </div>

              {/* Hidden real input */}
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="sr-only"
                autoFocus
              />
              <p className="text-xs text-center text-gray-400">اكتب الرمز المكوّن من 6 أرقام</p>

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full bg-gradient-to-l from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-blue-200"
              >
                {isLoading ? (
                  <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> جارٍ التحقق...</>
                ) : <><ShieldCheck className="w-4 h-4" /> تحقق وادخل</>}
              </button>

              <button
                type="button"
                onClick={() => { setStep('phone'); setOtp(''); }}
                className="w-full text-xs text-gray-400 hover:text-gray-600 py-1 flex items-center justify-center gap-1"
              >
                <ArrowRight className="w-3 h-3" /> تغيير رقم الجوال
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 pb-6 px-6">
          بتسجيل الدخول، أنت توافق على سياسة الخصوصية وشروط الاستخدام
        </p>
      </div>
    </div>
  );
}
