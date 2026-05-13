import * as React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Alert({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="alert"
      className={cn('flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700', className)}
      {...props}
    />
  );
}

export function AlertIcon({ className }: { className?: string }) {
  return <AlertCircle className={cn('mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500', className)} />;
}

export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('font-semibold text-slate-950', className)} {...props} />;
}

export function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('mt-1 text-xs leading-5 text-slate-500', className)} {...props} />;
}
