import { useState, useMemo } from 'react';
import { Calculator, AlertTriangle, TrendingUp, Percent, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';

interface FinancingCalculatorProps {
  fipeValue: string;
}

const MONTHLY_RATE = 0.0199; // 1.99% ao mês (média de mercado)
const INSTALLMENT_OPTIONS = [12, 24, 36, 48, 60];

export function FinancingCalculator({ fipeValue }: FinancingCalculatorProps) {
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [installments, setInstallments] = useState(48);

  // Parse FIPE value (e.g., "R$ 45.800,00" -> 45800)
  const vehiclePrice = useMemo(() => {
    const cleaned = fipeValue.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  }, [fipeValue]);

  // Calculations
  const calculations = useMemo(() => {
    const downPayment = (vehiclePrice * downPaymentPercent) / 100;
    const financedAmount = vehiclePrice - downPayment;
    
    if (financedAmount <= 0) {
      return {
        downPayment,
        financedAmount: 0,
        monthlyPayment: 0,
        totalAmount: downPayment,
        totalInterest: 0
      };
    }

    // Tabela Price: PMT = PV * [i(1+i)^n / ((1+i)^n - 1)]
    const i = MONTHLY_RATE;
    const n = installments;
    const factor = (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
    const monthlyPayment = financedAmount * factor;
    const totalAmount = downPayment + (monthlyPayment * n);
    const totalInterest = totalAmount - vehiclePrice;

    return {
      downPayment,
      financedAmount,
      monthlyPayment,
      totalAmount,
      totalInterest
    };
  }, [vehiclePrice, downPaymentPercent, installments]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    });
  };

  return (
    <Card className="border-border shadow-xl overflow-hidden">
      <CardContent className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Calculator size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Simulador de Financiamento</h2>
            <p className="text-[10px] text-muted-foreground">Tabela Price • Taxa: 1,99% a.m.</p>
          </div>
        </div>

        {/* Down Payment Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
              <Percent size={12} />
              Entrada
            </label>
            <div className="text-right">
              <span className="text-lg font-black text-foreground">{downPaymentPercent}%</span>
              <span className="text-xs text-muted-foreground ml-2">
                {formatCurrency(calculations.downPayment)}
              </span>
            </div>
          </div>
          <Slider
            value={[downPaymentPercent]}
            onValueChange={(v) => setDownPaymentPercent(v[0])}
            min={0}
            max={90}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>0%</span>
            <span>90%</span>
          </div>
        </div>

        {/* Installments Selector */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
            <Calendar size={12} />
            Parcelas
          </label>
          <div className="flex gap-2">
            {INSTALLMENT_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => setInstallments(option)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  installments === option
                    ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {option}x
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-5 text-primary-foreground space-y-4">
          <div className="text-center">
            <p className="text-xs opacity-80 uppercase tracking-widest mb-1">Parcela Mensal</p>
            <p className="text-3xl font-black">
              {installments}x de {formatCurrency(calculations.monthlyPayment)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary-foreground/20">
            <div>
              <p className="text-[10px] opacity-70 uppercase">Total Financiado</p>
              <p className="font-bold">{formatCurrency(calculations.financedAmount)}</p>
            </div>
            <div>
              <p className="text-[10px] opacity-70 uppercase">Total a Pagar</p>
              <p className="font-bold">{formatCurrency(calculations.totalAmount)}</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-primary-foreground/20">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="opacity-70" />
              <span className="text-xs opacity-80">Juros Totais</span>
            </div>
            <span className="font-bold text-accent">
              + {formatCurrency(calculations.totalInterest)}
            </span>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-relaxed">
            <strong>Simulação aproximada.</strong> Os valores são apenas para referência e podem variar de acordo com a instituição financeira, análise de crédito e condições do mercado.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
