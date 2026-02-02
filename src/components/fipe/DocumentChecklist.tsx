import { useState, useEffect } from 'react';
import { ClipboardCheck, Check, Info, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  link?: string;
  linkText?: string;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'crlv',
    title: 'Documento do veículo (CRLV)',
    description: 'Verifique se o CRV/CRLV está em nome do vendedor e sem rasuras',
  },
  {
    id: 'debitos',
    title: 'Verificar débitos (IPVA/Multas)',
    description: 'Consulte se há IPVA atrasado, multas pendentes ou licenciamento em aberto',
  },
  {
    id: 'restricoes',
    title: 'Consultar restrições',
    description: 'Verifique se o veículo possui alienação fiduciária, roubo/furto ou recall pendente',
  },
  {
    id: 'cnh',
    title: 'CNH do comprador e vendedor',
    description: 'Ambas devem estar válidas e com foto recente',
  },
  {
    id: 'cartorio',
    title: 'Reconhecer firma no cartório',
    description: 'Assinaturas do CRV devem ser reconhecidas em cartório',
  },
  {
    id: 'transferencia',
    title: 'Transferência no DETRAN',
    description: 'Realize a transferência em até 30 dias para evitar multas',
  }
];

const STORAGE_KEY = 'document_checklist';

export function DocumentChecklist() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...checkedItems]));
  }, [checkedItems]);

  const toggleItem = (id: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const progress = (checkedItems.size / CHECKLIST_ITEMS.length) * 100;
  const completedCount = checkedItems.size;

  return (
    <Card className="border-border shadow-xl">
      <CardContent className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <ClipboardCheck size={20} className="text-primary" />
            Checklist de Compra
          </h2>
          <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
            <Check size={12} className="text-primary" />
            <span className="text-primary text-[11px] font-extrabold tracking-tighter">
              {completedCount}/{CHECKLIST_ITEMS.length}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-[10px] text-muted-foreground text-center">
            {completedCount === CHECKLIST_ITEMS.length 
              ? '✅ Tudo pronto para a transferência!' 
              : `${CHECKLIST_ITEMS.length - completedCount} item(s) pendente(s)`
            }
          </p>
        </div>

        {/* Checklist Items */}
        <div className="space-y-2">
          {CHECKLIST_ITEMS.map((item) => {
            const isChecked = checkedItems.has(item.id);
            const isExpanded = expandedItem === item.id;

            return (
              <div
                key={item.id}
                className={cn(
                  "rounded-xl border transition-all overflow-hidden",
                  isChecked 
                    ? "bg-primary/5 border-primary/20" 
                    : "bg-card border-border hover:border-primary/30"
                )}
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full flex items-center gap-3 p-4 text-left"
                >
                  {/* Checkbox */}
                  <div className={cn(
                    "w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all",
                    isChecked 
                      ? "bg-primary border-primary" 
                      : "border-muted-foreground/30 hover:border-primary/50"
                  )}>
                    {isChecked && <Check size={14} className="text-primary-foreground" />}
                  </div>

                  {/* Title */}
                  <span className={cn(
                    "font-semibold text-sm flex-1",
                    isChecked ? "text-primary line-through opacity-70" : "text-foreground"
                  )}>
                    {item.title}
                  </span>

                  {/* Info Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedItem(isExpanded ? null : item.id);
                    }}
                    className={cn(
                      "p-1.5 rounded-full transition-colors",
                      isExpanded ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <Info size={14} />
                  </button>
                </button>

                {/* Expanded Info */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 ml-9 animate-fade-in">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-xs text-primary font-medium hover:underline"
                      >
                        {item.linkText || 'Saiba mais'}
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
