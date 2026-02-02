import { useState } from 'react';
import { Scale, Plus, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FipeHistoryItem } from '@/lib/constants';
import { CompareModal } from './CompareModal';

interface CompareListProps {
  items: FipeHistoryItem[];
  onRemove: (index: number) => void;
  onClear: () => void;
}

export function CompareList({ items, onRemove, onClear }: CompareListProps) {
  const [showModal, setShowModal] = useState(false);

  if (items.length === 0) return null;

  return (
    <>
      {/* Floating Compare Bar */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-md animate-fade-in">
        <div className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Scale size={16} className="text-primary" />
              <span className="text-xs font-bold text-foreground uppercase tracking-wide">
                Comparar ({items.length}/3)
              </span>
            </div>
            <button
              onClick={onClear}
              className="text-[10px] text-muted-foreground hover:text-destructive font-medium"
            >
              Limpar
            </button>
          </div>

          {/* Items */}
          <div className="flex gap-2 mb-3">
            {items.map((item, idx) => (
              <div
                key={`${item.codigoFipe}-${idx}`}
                className="flex-1 bg-muted rounded-xl p-2.5 relative group"
              >
                <button
                  onClick={() => onRemove(idx)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
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

            {/* Empty Slots */}
            {Array.from({ length: 3 - items.length }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="flex-1 bg-muted/50 rounded-xl p-2.5 border-2 border-dashed border-border flex items-center justify-center"
              >
                <Plus size={16} className="text-muted-foreground/50" />
              </div>
            ))}
          </div>

          {/* Compare Button */}
          <Button
            onClick={() => setShowModal(true)}
            disabled={items.length < 2}
            className="w-full gap-2"
          >
            <Scale size={16} />
            Comparar Veículos
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>

      {/* Compare Modal */}
      {showModal && (
        <CompareModal
          items={items}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
