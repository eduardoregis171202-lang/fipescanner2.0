import { Loader2 } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface FipeSelectProps {
  label: string;
  placeholder: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  loading?: boolean;
  disabled?: boolean;
}

export function FipeSelect({
  label,
  placeholder,
  options,
  value,
  onChange,
  loading,
  disabled
}: FipeSelectProps) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || loading}
          className="w-full p-4 rounded-xl border border-border bg-card text-foreground text-sm font-semibold outline-none cursor-pointer transition-colors focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
        >
          <option value="">{loading ? 'Carregando...' : placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Loader2 className="animate-spin text-primary" size={16} />
          </div>
        )}
      </div>
    </div>
  );
}
