import { useState } from 'react';
import { Car, Copy, Check, Share2, Scale } from 'lucide-react';
import { FipeResult } from '@/lib/constants';
import { toast } from '@/hooks/use-toast';

interface FipeResultCardProps {
  result: FipeResult;
  onAddToCompare: () => void;
  isInCompareList: boolean;
  compareListFull: boolean;
}

export function FipeResultCard({ 
  result, 
  onAddToCompare, 
  isInCompareList, 
  compareListFull 
}: FipeResultCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.Valor);
      setCopied(true);
      toast({ title: 'Copiado!', description: 'Valor copiado para a área de transferência' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível copiar', variant: 'destructive' });
    }
  };

  const handleShare = async () => {
    const text = `${result.Marca} ${result.Modelo} (${result.AnoModelo})\nValor FIPE: ${result.Valor}\nCódigo: ${result.CodigoFipe}\nRef: ${result.MesReferencia}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Valor FIPE', text });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Copiado!', description: 'Informações copiadas para compartilhar' });
    }
  };

  return (
    <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl p-6 shadow-2xl animate-fade-in">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="bg-accent/20 text-accent text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest inline-block mb-2">
            Valor FIPE
          </span>
          <h2 className="text-3xl font-black">{result.Valor}</h2>
        </div>
        <Car size={40} className="opacity-20" />
      </div>

      <div className="space-y-3 border-t border-primary-foreground/10 pt-4 text-sm opacity-90 font-medium">
        <div className="flex justify-between items-center">
          <span>Modelo</span>
          <span className="text-right ml-4 font-bold max-w-[200px] truncate">
            {result.Modelo}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span>Ano</span>
          <span className="font-bold">{result.AnoModelo}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Combustível</span>
          <span className="font-bold">{result.Combustivel}</span>
        </div>
        <div className="flex justify-between items-center border-t border-primary-foreground/5 pt-2 text-xs opacity-80">
          <span>Código FIPE</span>
          <span className="font-mono">{result.CodigoFipe}</span>
        </div>
        <div className="flex justify-between items-center text-xs opacity-80">
          <span>Referência</span>
          <span>{result.MesReferencia}</span>
        </div>
      </div>

      <div className="flex gap-2 mt-4 pt-4 border-t border-primary-foreground/10">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground text-xs font-semibold transition-colors"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copiado!' : 'Copiar'}
        </button>
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground text-xs font-semibold transition-colors"
        >
          <Share2 size={14} />
          Compartilhar
        </button>
        <button
          onClick={onAddToCompare}
          disabled={isInCompareList || compareListFull}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Scale size={14} />
          {isInCompareList ? 'Adicionado' : 'Comparar'}
        </button>
      </div>
    </div>
  );
}
