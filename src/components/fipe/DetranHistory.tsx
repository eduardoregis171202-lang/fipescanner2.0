import { Clock, Zap } from 'lucide-react';
import { DetranHistoryItem } from '@/lib/constants';

interface DetranHistoryProps {
  history: DetranHistoryItem[];
  onSelect: (item: DetranHistoryItem) => void;
}

export function DetranHistory({ history, onSelect }: DetranHistoryProps) {
  if (history.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
        <Clock size={12} />
        Consultas Recentes
      </h3>

      <div className="space-y-2">
        {history.map((item, index) => (
          <button
            key={`${item.plate}-${index}`}
            onClick={() => onSelect(item)}
            className="w-full bg-card p-4 rounded-2xl border border-border flex items-center gap-4 text-left hover:border-primary/50 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center text-[10px] font-black text-primary border border-primary/10 flex-shrink-0">
              {item.uf}
            </div>
            <span className="font-mono text-xl font-bold tracking-widest flex-1">
              {item.plate}
            </span>
            <Zap size={16} className="text-primary" />
          </button>
        ))}
      </div>
    </div>
  );
}
