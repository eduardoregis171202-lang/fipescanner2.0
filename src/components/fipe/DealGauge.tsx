import { useMemo } from 'react';

interface DealGaugeProps {
  ratio: number; // price / fipe value
}

type VerdictType = 'scam' | 'opportunity' | 'fair' | 'expensive';

interface Verdict {
  type: VerdictType;
  title: string;
  text: string;
  color: string;
}

export function DealGauge({ ratio }: DealGaugeProps) {
  const verdict = useMemo((): Verdict => {
    if (ratio < 0.75) {
      return {
        type: 'scam',
        title: 'ALERTA: MUITO BARATO',
        text: 'Preço muito abaixo da Fipe. Cuidado com golpes ou leilão.',
        color: 'text-red-500'
      };
    } else if (ratio >= 0.75 && ratio <= 0.92) {
      return {
        type: 'opportunity',
        title: 'SUPER OPORTUNIDADE',
        text: 'Preço excelente! Vale conferir a mecânica.',
        color: 'text-green-600'
      };
    } else if (ratio > 0.92 && ratio <= 1.08) {
      return {
        type: 'fair',
        title: 'PREÇO DE MERCADO',
        text: 'Valor justo. Tente negociar IPVA ou transferência.',
        color: 'text-yellow-600'
      };
    } else {
      return {
        type: 'expensive',
        title: 'ACIMA DA FIPE',
        text: 'Valor alto. Só vale se for raridade.',
        color: 'text-red-500'
      };
    }
  }, [ratio]);

  // Gauge rotation: -90 (left) to +90 (right)
  const needleAngle = useMemo(() => {
    let angle = (ratio - 1) * 180;
    return Math.max(-90, Math.min(90, angle));
  }, [ratio]);

  return (
    <div className="text-center">
      {/* Gauge Container */}
      <div className="relative w-[280px] h-[140px] mx-auto mb-6 overflow-hidden">
        {/* Gauge Background with colored sections */}
        <div 
          className="w-full h-full opacity-90"
          style={{
            background: `conic-gradient(from 270deg at 50% 100%, 
              #ef4444 0deg 40deg,
              transparent 40deg 42deg,
              #22c55e 42deg 100deg,
              transparent 100deg 102deg,
              #fbbf24 102deg 138deg,
              transparent 138deg 140deg,
              #ef4444 140deg 180deg
            )`,
            borderTopLeftRadius: '280px',
            borderTopRightRadius: '280px',
            maskImage: 'radial-gradient(circle at 50% 100%, transparent 60%, black 61%)',
            WebkitMaskImage: 'radial-gradient(circle at 50% 100%, transparent 60%, black 61%)'
          }}
        />
        
        {/* Needle */}
        <div 
          className="absolute bottom-0 left-1/2 z-10"
          style={{
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderBottom: '120px solid #4c1d95',
            transformOrigin: 'bottom center',
            transform: `translateX(-50%) rotate(${needleAngle}deg)`,
            transition: 'transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))'
          }}
        />
        
        {/* Pivot */}
        <div 
          className="absolute left-1/2 z-20"
          style={{
            bottom: '-15px',
            transform: 'translateX(-50%)',
            width: '30px',
            height: '30px',
            background: '#4c1d95',
            borderRadius: '50%',
            boxShadow: '0 0 10px rgba(0,0,0,0.2)',
            border: '4px solid white'
          }}
        />
      </div>

      {/* Verdict */}
      <h3 className={`text-2xl font-bold mb-2 ${verdict.color}`}>
        {verdict.title}
      </h3>
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
        {verdict.text}
      </p>
    </div>
  );
}
