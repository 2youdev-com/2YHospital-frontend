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
      <div className="absolute bottom-4 sm:bottom-8 left-0 right-0 z-10 flex justify-center gap-4 sm:gap-16 px-4 text-center text-[#115e6e]">
        <div className="flex flex-col items-center gap-1.5 sm:gap-3">
          <Lock className="h-4 w-4 sm:h-6 sm:w-6 stroke-[1.5]" />
          <span className="text-[9px] sm:text-sm font-bold whitespace-nowrap">آمن وموثوق</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 sm:gap-3">
          <ShieldCheck className="h-4 w-4 sm:h-6 sm:w-6 stroke-[1.5]" />
          <span className="text-[9px] sm:text-sm font-bold whitespace-nowrap">بيانات محمية</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 sm:gap-3">
          <Clock className="h-4 w-4 sm:h-6 sm:w-6 stroke-[1.5]" />
          <span className="text-[9px] sm:text-sm font-bold whitespace-nowrap">خدمة 24/7</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 sm:gap-3">
          <Users className="h-4 w-4 sm:h-6 sm:w-6 stroke-[1.5]" />
          <span className="text-[9px] sm:text-sm font-bold whitespace-nowrap">رعاية مميزة</span>
        </div>
      </div>
    </div>
  );
}
