import { useState, useMemo } from 'react';
import { TrendingDown, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PriceComparisonProps {
  fipeValue: string; // "R$ 48.500,00"
}

type EvaluationType = 'muito_abaixo' | 'justo' | 'acima' | 'muito_acima';

interface Evaluation {
  type: EvaluationType;
  label: string;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
}

// Parse "R$ 48.500,00" or "48500" to number
function parsePrice(value: string): number {
  const cleaned = value.replace(/[^\d]/g, '');
  return parseInt(cleaned, 10) / 100 || 0;
}

// Format number to "R$ 48.500,00"
function formatPrice(value: string): string {
  const numbers = value.replace(/\D/g, '');
  if (!numbers) return '';
  
  const amount = parseInt(numbers, 10) / 100;
  return amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function getEvaluation(difference: number): Evaluation {
  if (difference <= -10) {
    return {
      type: 'muito_abaixo',
      label: 'Muito Abaixo da FIPE',
      description: 'Ótimo negócio! Preço bem abaixo do mercado.',
      icon: <TrendingDown className="w-6 h-6" />,
      bgColor: 'bg-green-500',
      textColor: 'text-green-500'
    };
  } else if (difference <= 5) {
    return {
      type: 'justo',
      label: 'Preço Justo',
      description: 'Valor compatível com a tabela FIPE.',
      icon: <CheckCircle className="w-6 h-6" />,
      bgColor: 'bg-blue-500',
      textColor: 'text-blue-500'
    };
  } else if (difference <= 15) {
    return {
      type: 'acima',
      label: 'Acima da FIPE',
      description: 'Preço um pouco elevado. Tente negociar.',
      icon: <TrendingUp className="w-6 h-6" />,
      bgColor: 'bg-yellow-500',
      textColor: 'text-yellow-500'
    };
  } else {
    return {
      type: 'muito_acima',
      label: 'Muito Acima da FIPE',
      description: 'Preço muito elevado. Evite ou negocie bastante.',
      icon: <AlertTriangle className="w-6 h-6" />,
      bgColor: 'bg-red-500',
      textColor: 'text-red-500'
    };
  }
}

export function PriceComparison({ fipeValue }: PriceComparisonProps) {
  const [inputValue, setInputValue] = useState('');

  const fipeNumeric = useMemo(() => parsePrice(fipeValue), [fipeValue]);
  const announcedNumeric = useMemo(() => parsePrice(inputValue), [inputValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPrice(e.target.value);
    setInputValue(formatted);
  };

  const comparison = useMemo(() => {
    if (!announcedNumeric || !fipeNumeric) return null;

    const difference = ((announcedNumeric - fipeNumeric) / fipeNumeric) * 100;
    const absoluteDiff = announcedNumeric - fipeNumeric;
    const evaluation = getEvaluation(difference);

    return {
      difference,
      absoluteDiff,
      evaluation
    };
  }, [announcedNumeric, fipeNumeric]);

  const formatDifference = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <Card className="mt-4 border-border bg-card">
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Preço do Anúncio
          </Label>
          <Input
            type="text"
            inputMode="numeric"
            placeholder="R$ 0,00"
            value={inputValue}
            onChange={handleInputChange}
            className="text-lg font-semibold h-12 bg-background"
          />
        </div>

        {comparison && (
          <div 
            className={`${comparison.evaluation.bgColor} rounded-xl p-4 text-white animate-fade-in`}
          >
            <div className="flex items-center gap-3 mb-2">
              {comparison.evaluation.icon}
              <span className="font-bold text-lg">
                {comparison.evaluation.label}
              </span>
            </div>
            
            <p className="text-sm opacity-90 mb-3">
              {comparison.evaluation.description}
            </p>

            <div className="bg-white/20 rounded-lg p-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span>Diferença</span>
                <span className="font-bold">
                  {comparison.absoluteDiff >= 0 ? '+' : ''}
                  {formatDifference(comparison.absoluteDiff)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Percentual</span>
                <span className="font-bold">
                  {comparison.difference >= 0 ? '+' : ''}
                  {comparison.difference.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {!comparison && inputValue && (
          <p className="text-xs text-muted-foreground text-center">
            Continue digitando o valor do anúncio...
          </p>
        )}
      </CardContent>
    </Card>
  );
}
