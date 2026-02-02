import { History, Trash2, ChevronRight, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FipeHistoryItem } from '@/lib/constants';

interface FipeHistoryProps {
  history: FipeHistoryItem[];
  onSelect: (item: FipeHistoryItem) => void;
  onClear: () => void;
}

export function FipeHistory({ history, onSelect, onClear }: FipeHistoryProps) {
  if (history.length === 0) return null;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const getBrandInitials = (brand: string) => {
    return brand.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase();
  };

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <History size={12} />
          Consultas Recentes
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-6 px-2 text-[10px] text-muted-foreground hover:text-destructive"
        >
          <Trash2 size={10} className="mr-1" />
          Limpar
        </Button>
      </div>

      <div className="space-y-2">
        {history.slice(0, 5).map((item, idx) => (
          <button
            key={`${item.codigoFipe}-${idx}`}
            onClick={() => onSelect(item)}
            className="w-full bg-card p-4 rounded-2xl border border-border flex items-center gap-4 group shadow-sm hover:border-primary/50 hover:shadow-md transition-all"
          >
            {/* Brand Badge */}
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center border border-primary/10 shadow-inner flex-shrink-0">
              <span className="text-primary font-black text-[10px] tracking-tighter">
                {getBrandInitials(item.brand)}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground text-sm truncate">
                  {item.model}
                </span>
                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-medium">
                  {item.year}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-primary font-bold text-sm">
                  {item.value}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {formatDate(item.timestamp)}
                </span>
              </div>
            </div>

            {/* Arrow */}
            <ChevronRight 
              size={18} 
              className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" 
            />
          </button>
        ))}
      </div>
    </div>
  );
}
