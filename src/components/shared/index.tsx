import { cn } from '@/lib/utils';
import { LucideIcon, Search, Sparkles, Info, AlertTriangle } from 'lucide-react';
import type { SVGProps } from 'react';

// ─── StatsCard ─────────────────────────────────────────────────────────────
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'teal';
}

const colorMap = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-emerald-50 text-emerald-600',
  yellow: 'bg-amber-50 text-amber-600',
  red: 'bg-rose-50 text-rose-600',
  teal: 'bg-teal-50 text-[#115e6e]',
};

export function StatsCard({ title, value, icon: Icon, trend, color = 'blue' }: StatsCardProps) {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white p-6 shadow-sm shadow-slate-200/50 transition-all hover:shadow-md hover:scale-[1.02] active:scale-95 group">
      <div className="flex items-start gap-4">
        <div className={cn('p-3.5 rounded-2xl flex-shrink-0 transition-transform group-hover:rotate-12', colorMap[color])}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
          <p className="text-2xl font-black text-slate-800 mt-1 tabular-nums tracking-tight">{value}</p>
          {trend && (
            <div className={cn('flex items-center gap-1 mt-2 text-[10px] font-black px-2 py-0.5 rounded-lg w-fit', 
              trend.value >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600')}>
              <span>{trend.value >= 0 ? '▲' : '▼'} {Math.abs(trend.value)}٪</span>
              <span className="opacity-60">{trend.label}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Badge ─────────────────────────────────────────────────────────────────
interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border', className)}>
      {children}
    </span>
  );
}

// ─── EmptyState ─────────────────────────────────────────────────────────────
interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ title, description, icon: Icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-700">
      {Icon && (
        <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 flex items-center justify-center mb-8 border border-white">
          <Icon className="w-10 h-10 text-slate-200" />
        </div>
      )}
      <h3 className="text-xl font-black text-slate-800">{title}</h3>
      {description && <p className="text-sm font-bold text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">{description}</p>}
      {action && (
        <button onClick={action.onClick} className="btn-primary mt-8 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          {action.label}
        </button>
      )}
    </div>
  );
}

// ─── LoadingSpinner ──────────────────────────────────────────────────────────
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-5 h-5 border-2', md: 'w-10 h-10 border-3', lg: 'w-16 h-16 border-4' };
  return (
    <div className="flex items-center justify-center p-12">
      <div className={cn('animate-spin rounded-full border-slate-100 border-t-[#2bbcb3]', sizes[size])} />
    </div>
  );
}

// ─── PageHeader ──────────────────────────────────────────────────────────────
interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-[#115e6e] tracking-tight">{title}</h1>
        {description && <p className="text-sm font-bold text-slate-400 max-w-lg">{description}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

// ─── SearchBar ──────────────────────────────────────────────────────────────
interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'بحث مخصص...' }: SearchBarProps) {
  return (
    <div className="relative group">
      <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#2bbcb3] transition-colors" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field pr-12 w-full"
      />
    </div>
  );
}

// ─── Select ──────────────────────────────────────────────────────────────────
interface SelectOption { value: string; label: string }

interface SelectProps {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

export function Select({ value, onChange, options, placeholder, className }: SelectProps) {
  return (
    <div className="relative group">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn('input-field bg-white appearance-none pr-10', className)}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-300">
        <ChevronDownIcon className="w-4 h-4" />
      </div>
    </div>
  );
}

function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// ─── ConfirmDialog ──────────────────────────────────────────────────────────
interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export function ConfirmDialog({
  isOpen, title, message, confirmLabel = 'تأكيد العملية', cancelLabel = 'تراجع',
  onConfirm, onCancel, danger = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-[#0d1b2a]/60 backdrop-blur-md" onClick={onCancel} />
      <div className="relative bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white p-8 max-w-md w-full animate-in zoom-in-95 duration-300">
        <div className="flex items-center gap-4 mb-6">
          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg", 
            danger ? "bg-rose-50 text-rose-500 shadow-rose-200/50" : "bg-teal-50 text-[#115e6e] shadow-teal-200/50")}>
            {danger ? <AlertTriangle className="w-7 h-7" /> : <Info className="w-7 h-7" />}
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">{title}</h3>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">تأكيد الإجراء</p>
          </div>
        </div>
        <p className="text-sm font-bold text-slate-500 leading-relaxed mb-8">{message}</p>
        <div className="flex gap-4">
          <button onClick={onCancel} className="btn-secondary flex-1">
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className={cn("flex-1 flex items-center justify-center gap-2", danger ? 'btn-danger' : 'btn-primary')}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
