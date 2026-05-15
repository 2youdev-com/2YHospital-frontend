import { Lock, ShieldCheck, Clock, Users } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4 font-sans text-slate-900">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-slate-100"
        style={{
          backgroundImage: "url('/images/login-bg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      {/* Overlay to fade the background slightly */}
      <div className="absolute inset-0 z-0 bg-white/40 backdrop-blur-[2px]" />

      <div className="relative z-10 w-full max-w-md">{children}</div>

      {/* Footer across the bottom */}
      <div className="absolute bottom-8 left-0 right-0 z-10 hidden md:flex justify-center gap-16 text-center text-[#115e6e]">
        <div className="flex flex-col items-center gap-3">
          <Lock className="h-6 w-6 stroke-[1.5]" />
          <span className="text-sm font-bold">آمن وموثوق</span>
        </div>
        <div className="flex flex-col items-center gap-3">
          <ShieldCheck className="h-6 w-6 stroke-[1.5]" />
          <span className="text-sm font-bold">بيانات محمية</span>
        </div>
        <div className="flex flex-col items-center gap-3">
          <Clock className="h-6 w-6 stroke-[1.5]" />
          <span className="text-sm font-bold">خدمة على مدار الساعة</span>
        </div>
        <div className="flex flex-col items-center gap-3">
          <Users className="h-6 w-6 stroke-[1.5]" />
          <span className="text-sm font-bold">رعاية صحية متميزة</span>
        </div>
      </div>
    </div>
  );
}
