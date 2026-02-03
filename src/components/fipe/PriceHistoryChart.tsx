import { useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface PriceHistoryChartProps {
  currentValue: string; // e.g., "R$ 55.478,00"
  modelName: string;
  yearModel: number;
}

// Parse Brazilian currency to number
function parseCurrency(value: string): number {
  return parseFloat(
    value
      .replace('R$', '')
      .replace(/\./g, '')
      .replace(',', '.')
      .trim()
  );
}

// Format number to Brazilian currency
function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

// Simple seeded random number generator for consistent results per vehicle
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Generate a hash from string for seeding
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Generate realistic price history (simulated but unique per vehicle)
function generatePriceHistory(currentValue: number, modelName: string, yearModel: number, months: number = 12) {
  const data = [];
  const now = new Date();
  
  // Create a unique seed based on model and year
  const baseSeed = hashString(`${modelName}-${yearModel}`);
  
  // Work backwards from current value
  const prices: number[] = new Array(months);
  prices[months - 1] = currentValue; // Last month = current value
  
  // Generate prices going backwards in time
  for (let i = months - 2; i >= 0; i--) {
    const seed = baseSeed + i * 7919; // Use prime number for better distribution
    const random = seededRandom(seed);
    
    // Variation between -1.5% and +2% per month (slight upward trend going forward = depreciation going back)
    const variation = 1 + (random * 0.035 - 0.015);
    prices[i] = prices[i + 1] * variation;
  }
  
  // Build data array
  for (let i = 0; i < months; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
    const year = date.getFullYear();
    
    data.push({
      month: `${monthName}/${year.toString().slice(-2)}`,
      fullDate: date,
      value: Math.round(prices[i]),
      formatted: formatCurrency(Math.round(prices[i])),
    });
  }
  
  return data;
}

export function PriceHistoryChart({ currentValue, modelName, yearModel }: PriceHistoryChartProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const numericValue = useMemo(() => parseCurrency(currentValue), [currentValue]);
  
  const priceData = useMemo(() => 
    generatePriceHistory(numericValue, modelName, yearModel, 12),
    [numericValue, modelName, yearModel]
  );
  
  // Calculate trend
  const trend = useMemo(() => {
    if (priceData.length < 2) return { direction: 'stable', percentage: 0 };
    
    const firstValue = priceData[0].value;
    const lastValue = priceData[priceData.length - 1].value;
    const change = ((lastValue - firstValue) / firstValue) * 100;
    
    if (change > 1) return { direction: 'up', percentage: change };
    if (change < -1) return { direction: 'down', percentage: Math.abs(change) };
    return { direction: 'stable', percentage: Math.abs(change) };
  }, [priceData]);
  
  // Min and max for chart domain
  const { minValue, maxValue } = useMemo(() => {
    const values = priceData.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1;
    return {
      minValue: Math.floor((min - padding) / 1000) * 1000,
      maxValue: Math.ceil((max + padding) / 1000) * 1000,
    };
  }, [priceData]);
  
  const chartConfig = {
    value: {
      label: 'Valor FIPE',
      color: 'hsl(var(--primary))',
    },
  };
  
  const TrendIcon = trend.direction === 'up' 
    ? TrendingUp 
    : trend.direction === 'down' 
      ? TrendingDown 
      : Minus;
  
  const trendColor = trend.direction === 'up' 
    ? 'text-green-500' 
    : trend.direction === 'down' 
      ? 'text-red-500' 
      : 'text-muted-foreground';

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            📈 Evolução do Preço
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {/* Trend Summary */}
        <div className="flex items-center gap-2 text-xs">
          <TrendIcon className={`w-4 h-4 ${trendColor}`} />
          <span className={`font-semibold ${trendColor}`}>
            {trend.direction === 'up' && '+'}
            {trend.direction === 'down' && '-'}
            {trend.percentage.toFixed(1)}%
          </span>
          <span className="text-muted-foreground">
            nos últimos 12 meses
          </span>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-2 pb-4">
          {/* Chart */}
          <div className="h-48 w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <AreaChart
                data={priceData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--border))" 
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[minValue, maxValue]}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  width={40}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => [formatCurrency(value as number), 'Valor']}
                      labelFormatter={(label) => `Referência: ${label}`}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#colorValue)"
                  dot={false}
                  activeDot={{ r: 4, fill: 'hsl(var(--primary))' }}
                />
              </AreaChart>
            </ChartContainer>
          </div>
          
          {/* Disclaimer */}
          <div className="flex items-start gap-2 mt-4 p-3 bg-muted/50 rounded-lg">
            <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              <strong>Simulação ilustrativa.</strong> A API FIPE não fornece histórico real de preços. 
              Os valores passados são estimativas baseadas em variações típicas de mercado. 
              Consulte a tabela FIPE oficial para dados precisos.
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
