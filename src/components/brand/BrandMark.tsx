import { cn } from '@/lib/utils';
import Image from 'next/image';

interface BrandMarkProps {
  compact?: boolean;
  className?: string;
}

export default function BrandMark({ compact = false, className }: BrandMarkProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Image 
        src="/images/logo.png" 
        alt="2YHospital Logo" 
        width={40} 
        height={40} 
        className="flex-shrink-0 object-contain"
        style={{ mixBlendMode: 'multiply' }}
      />
      {!compact && (
        <div className="leading-tight">
          <p className="text-sm font-black tracking-tight text-slate-950">
            <span className="text-[#115e6e]">2Y</span>Hospital
          </p>
          <p className="text-[11px] font-medium text-slate-500">المنصة الرقمية الموحدة</p>
        </div>
      )}
    </div>
  );
}
