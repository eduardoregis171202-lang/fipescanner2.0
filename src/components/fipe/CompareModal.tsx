import { useMemo } from 'react';
import { X, Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import { FipeHistoryItem } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';

interface CompareModalProps {
  items: FipeHistoryItem[];
  onClose: () => void;
}

export function CompareModal({ items, onClose }: CompareModalProps) {
  // Parse values and find the cheapest
  const analysis = useMemo(() => {
    const parsed = items.map(item => {
      const cleaned = item.value.replace(/[^\d,]/g, '').replace(',', '.');
      return {
        ...item,
        numericValue: parseFloat(cleaned) || 0
      };
    });

    const minValue = Math.min(...parsed.map(p => p.numericValue));
    
    return parsed.map(item => ({
      ...item,
      isCheapest: item.numericValue === minValue,
      diffPercent: ((item.numericValue - minValue) / minValue) * 100
    }));
  }, [items]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl animate-fade-in flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-border bg-card">
        <h2 className="text-lg font-black uppercase tracking-wide">Comparativo</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Cards */}
        <div className="grid gap-4">
          {analysis.map((item, idx) => (
            <Card
              key={`${item.codigoFipe}-${idx}`}
              className={`overflow-hidden ${
                item.isCheapest 
                  ? 'ring-2 ring-primary border-primary shadow-xl' 
                  : 'border-border'
              }`}
            >
              <CardContent className="p-5">
                {/* Winner Badge */}
                {item.isCheapest && (
                  <div className="flex items-center gap-2 mb-3 -mt-1">
                    <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full flex items-center gap-1.5">
                      <Trophy size={12} />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        Melhor Valor
                      </span>
                    </div>
                  </div>
                )}

                {/* Vehicle Info */}
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">
                      {item.brand}
                    </p>
                    <p className="text-lg font-bold text-foreground leading-tight">
                      {item.model}
                    </p>
                    <p className="text-sm text-muted-foreground">{item.year}</p>
                  </div>

                  {/* Value */}
                  <div className="flex items-end justify-between pt-3 border-t border-border">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">
                        Valor FIPE
                      </p>
                      <p className={`text-2xl font-black ${
                        item.isCheapest ? 'text-primary' : 'text-foreground'
                      }`}>
                        {item.value}
                      </p>
                    </div>

                    {/* Difference */}
                    {!item.isCheapest && (
                      <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-full">
                        <TrendingUp size={14} />
                        <span className="text-sm font-bold">
                          +{item.diffPercent.toFixed(1)}%
                        </span>
                      </div>
                    )}

                    {item.isCheapest && (
                      <div className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                        <TrendingDown size={14} />
                        <span className="text-sm font-bold">Menor</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase mb-3">
              Resumo da Comparação
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Veículos comparados</span>
                <span className="font-bold">{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Menor valor</span>
                <span className="font-bold text-primary">
                  {formatCurrency(Math.min(...analysis.map(a => a.numericValue)))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Maior valor</span>
                <span className="font-bold">
                  {formatCurrency(Math.max(...analysis.map(a => a.numericValue)))}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="text-muted-foreground">Diferença máxima</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {formatCurrency(
                    Math.max(...analysis.map(a => a.numericValue)) -
                    Math.min(...analysis.map(a => a.numericValue))
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
