import { useState } from 'react';
import { Scale, X, Plus } from 'lucide-react';
import { FipeHistoryItem } from '@/lib/constants';
import { CompareModal } from './CompareModal';

interface CompareBarProps {
  items: FipeHistoryItem[];
  onRemove: (index: number) => void;
  onClear: () => void;
}

export function CompareBar({ items, onRemove, onClear }: CompareBarProps) {
  const [showModal, setShowModal] = useState(false);

  if (items.length === 0) return null;

  const emptySlots = 3 - items.length;

  return (
    <>
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[416px] bg-card/95 backdrop-blur-md border border-border rounded-2xl p-4 shadow-2xl z-30 animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <span className="flex items-center gap-2 text-xs font-bold text-foreground uppercase">
            <Scale size={14} />
            Comparar ({items.length}/3)
          </span>
          <button
            onClick={onClear}
            className="text-[10px] text-muted-foreground hover:text-destructive transition-colors"
          >
            Limpar
          </button>
        </div>

        <div className="flex gap-2 mb-3">
          {items.map((item, index) => (
            <div
              key={`${item.codigoFipe}-${index}`}
              className="flex-1 bg-muted rounded-xl p-2.5 relative group"
            >
              <button
                onClick={() => onRemove(index)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-white text-[10px] items-center justify-center hidden group-hover:flex"
              >
                <X size={10} />
              </button>
              <p className="text-[10px] font-bold text-foreground truncate">
                {item.model.split(' ').slice(0, 2).join(' ')}
              </p>
              <p className="text-[10px] text-muted-foreground">{item.year}</p>
              <p className="text-xs font-bold text-primary mt-1">{item.value}</p>
            </div>
          ))}

          {Array.from({ length: emptySlots }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="flex-1 bg-muted/50 rounded-xl p-2.5 border-2 border-dashed border-border flex items-center justify-center"
            >
              <Plus size={16} className="text-muted-foreground/50" />
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowModal(true)}
          disabled={items.length < 2}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          <Scale size={14} />
          Comparar Veículos →
        </button>
      </div>

      {showModal && (
        <CompareModal items={items} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
