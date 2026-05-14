'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/context/AuthContext';
import { Phone, ShieldCheck, ArrowRight, ArrowLeft, Lock, Send, Smartphone, ChevronDown } from 'lucide-react';
import Image from 'next/image';

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
      if (tokens.user.role === 'DOCTOR') router.push('/portal');
      else if (tokens.user.role === 'PATIENT') router.push('/patient');
      else router.push('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || 'رمز التحقق غير صحيح');
    } finally { setIsLoading(false); }
  };

  return (
    <div className="w-full">
      <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden border border-white/50 p-6 sm:p-10">

        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/images/logo.png"
            alt="2YHospital"
            width={140}
            height={140}
            className="object-contain"
            style={{ mixBlendMode: 'multiply' }}
            priority
          />
          <h1 className="text-[22px] font-black tracking-wide mt-2">
            <span className="text-[#115e6e]">2Y</span><span className="text-slate-800">Hospital</span>
          </h1>
          <p className="text-[13px] font-bold text-[#115e6e] mt-0.5">المنصة الرقمية الموحدة</p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center justify-center mb-10">
          <div className="flex items-center gap-3 text-sm font-semibold">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all border ${step === 'otp' ? 'border-[#115e6e] text-[#115e6e] bg-[#f2f9fa]' : 'border-transparent text-slate-400 bg-slate-50'
              }`}>
              <Lock className="w-4 h-4" /> <span className="pt-0.5">رمز التحقق</span>
            </div>
            <div className="text-slate-300">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all border ${step === 'phone' ? 'border-[#115e6e] text-[#115e6e] bg-[#f2f9fa]' : 'border-transparent text-slate-400 bg-slate-50'
              }`}>
              <Phone className="w-4 h-4" /> <span className="pt-0.5">رقم الجوال</span>
            </div>
          </div>
        </div>

        {/* Form area */}
        <div>
          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-[17px] font-black text-slate-900 mb-1.5">أدخل رقم جوالك</h2>
                <p className="text-xs text-slate-500 font-medium">سُترسل لك رمز تحقق مكوّن من 6 أرقام</p>
              </div>

              <div className="text-right">
                <label className="block text-xs font-bold text-slate-700 mb-2">رقم الجوال</label>
                <div className="relative flex items-center border border-slate-200 rounded-xl overflow-hidden focus-within:border-[#115e6e] focus-within:ring-1 focus-within:ring-[#115e6e] transition-all bg-white h-[52px]">
                  <div className="absolute right-4 text-slate-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^\d+]/g, '');
                      if (val.startsWith('+966')) val = val.substring(4);
                      else if (val.startsWith('00966')) val = val.substring(5);
                      else if (val.startsWith('0')) val = val.substring(1);
                      setPhone(val);
                    }}
                    placeholder="5XXXXXXXX"
                    className="w-full pl-[90px] pr-12 h-full text-sm font-mono outline-none text-right placeholder-slate-300"
                    dir="ltr"
                    required
                    autoFocus
                  />
                  <div className="absolute left-0 top-0 bottom-0 flex items-center gap-1.5 bg-slate-50 px-4 border-r border-slate-200 text-slate-700 font-mono text-sm">
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    +966
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !phone.trim()}
                className="w-full bg-[#115e6e] hover:bg-[#0c4a57] text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
              >
                {isLoading ? (
                  <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> جارٍ الإرسال...</>
                ) : (
                  <><span className="pt-0.5">إرسال رمز التحقق</span> <Send className="w-4 h-4 rotate-180" /></>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-[17px] font-black text-slate-900 mb-1.5">أدخل رمز التحقق</h2>
                <p className="text-xs text-slate-500 font-medium">
                  أُرسل إلى <span className="font-mono font-bold text-[#115e6e]" dir="ltr">{phone}</span>
                </p>
              </div>

              {/* OTP boxes */}
              <div dir="ltr" className="flex gap-2 justify-center">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`w-11 h-14 border-2 rounded-xl flex items-center justify-center text-xl font-mono font-bold transition-colors
                      ${otp[i] ? 'border-[#115e6e] bg-[#f2f9fa] text-[#115e6e]' : 'border-slate-200 text-slate-400'}`}
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

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full bg-[#115e6e] hover:bg-[#0c4a57] text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
              >
                {isLoading ? (
                  <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> جارٍ التحقق...</>
                ) : <><ShieldCheck className="w-4 h-4" /> <span className="pt-0.5">تحقق وادخل</span></>}
              </button>

              <button
                type="button"
                onClick={() => { setStep('phone'); setOtp(''); }}
                className="w-full text-xs font-semibold text-slate-400 hover:text-[#115e6e] transition-colors py-1 flex items-center justify-center gap-1.5"
              >
                <ArrowRight className="w-3.5 h-3.5" /> <span className="pt-0.5">تغيير رقم الجوال</span>
              </button>
            </form>
          )}
        </div>

        <div className="mt-8 pt-6 bg-slate-50/50 -mx-6 sm:-mx-10 -mb-6 sm:-mb-10 px-6 py-5 border-t border-slate-100 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 text-center">
          <ShieldCheck className="w-4 h-4 text-[#115e6e]" /> <span className="pt-0.5">بتسجيل الدخول، أنت توافق على سياسة الخصوصية وشروط الاستخدام</span>
        </div>
      </div>
    </div>
  );
}
