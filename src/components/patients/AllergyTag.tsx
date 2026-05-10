import { AlertTriangle, X } from 'lucide-react';

interface AllergyTagProps {
  allergy: string;
  onRemove?: (allergy: string) => void;
  size?: 'sm' | 'md';
}

export default function AllergyTag({ allergy, onRemove, size = 'md' }: AllergyTagProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-orange-100 text-orange-800 font-medium
      ${size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'}`}
    >
      <AlertTriangle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {allergy}
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(allergy)}
          className="hover:text-orange-900 ml-0.5"
        >
          <X className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        </button>
      )}
    </span>
  );
}
