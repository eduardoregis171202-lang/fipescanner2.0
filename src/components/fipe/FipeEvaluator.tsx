import { useState } from 'react';
import { Car, Bike, Truck, Loader2, Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useFipeApi } from '@/hooks/useFipeApi';
import { VehicleType, FipeHistoryItem } from '@/lib/constants';
import { toast } from '@/hooks/use-toast';

interface FipeEvaluatorProps {
  onSaveToHistory: (item: FipeHistoryItem) => void;
}

export function FipeEvaluator({ onSaveToHistory }: FipeEvaluatorProps) {
  const [vehicleType, setVehicleType] = useState<VehicleType>('carros');
  const [copied, setCopied] = useState(false);

  const {
    brands,
    models,
    years,
    result,
    loading,
    selectedBrand,
    selectedModel,
    selectedYear,
    setSelectedBrand,
    setSelectedModel,
    setSelectedYear
  } = useFipeApi(vehicleType);

  const handleVehicleTypeChange = (type: VehicleType) => {
    setVehicleType(type);
  };

  const handleCopyValue = async () => {
    if (!result) return;
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
    if (!result) return;
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

  // Salvar no histórico quando resultado carrega
  if (result && selectedBrand && selectedModel && selectedYear) {
    const brandName = brands.find(b => b.codigo === selectedBrand)?.nome || '';
    const modelName = models.find(m => String(m.codigo) === selectedModel)?.nome || '';
    const yearName = years.find(y => y.codigo === selectedYear)?.nome || '';
    
    // Evita salvar duplicados
    const historyItem: FipeHistoryItem = {
      brand: brandName,
      model: modelName,
      year: yearName,
      value: result.Valor,
      codigoFipe: result.CodigoFipe,
      timestamp: Date.now()
    };
    
    // Salva apenas uma vez por resultado
    if (result.CodigoFipe) {
      onSaveToHistory(historyItem);
    }
  }

  const vehicleTypes: { type: VehicleType; label: string; icon: React.ReactNode }[] = [
    { type: 'carros', label: 'Carros', icon: <Car className="w-4 h-4" /> },
    { type: 'motos', label: 'Motos', icon: <Bike className="w-4 h-4" /> },
    { type: 'caminhoes', label: 'Caminhões', icon: <Truck className="w-4 h-4" /> }
  ];

  return (
    <div className="p-4 space-y-6 animate-fade-in">
      {/* Vehicle Type Selector */}
      <div className="flex gap-2">
        {vehicleTypes.map(({ type, label, icon }) => (
          <Button
            key={type}
            onClick={() => handleVehicleTypeChange(type)}
            variant={vehicleType === type ? 'default' : 'outline'}
            className={`flex-1 gap-2 ${
              vehicleType === type 
                ? 'bg-primary text-primary-foreground shadow-md' 
                : 'bg-card text-muted-foreground'
            }`}
          >
            {icon}
            <span className="text-xs font-bold">{label}</span>
          </Button>
        ))}
      </div>

      {/* Selects */}
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">
            Marca
          </label>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
          >
            <option value="">Selecione a Marca</option>
            {brands.map(b => (
              <option key={b.codigo} value={b.codigo}>{b.nome}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">
            Modelo
          </label>
          <select
            disabled={!selectedBrand}
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm disabled:opacity-50 focus:border-primary outline-none transition-colors"
          >
            <option value="">Selecione o Modelo</option>
            {models.map(m => (
              <option key={m.codigo} value={String(m.codigo)}>{m.nome}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">
            Ano
          </label>
          <select
            disabled={!selectedModel}
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm disabled:opacity-50 focus:border-primary outline-none transition-colors"
          >
            <option value="">Selecione o Ano</option>
            {years.map(y => (
              <option key={y.codigo} value={y.codigo}>{y.nome}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading && !result && (
        <div className="py-8 flex justify-center">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      )}

      {/* Result Card */}
      {result && (
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0 shadow-2xl animate-fade-in overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="bg-accent/20 text-accent text-[10px] font-bold px-2 py-1 rounded uppercase mb-2 inline-block tracking-widest">
                  Valor FIPE
                </span>
                <h3 className="text-3xl font-black">{result.Valor}</h3>
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

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-primary-foreground/10">
              <Button
                onClick={handleCopyValue}
                variant="secondary"
                size="sm"
                className="flex-1 bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span className="text-xs">{copied ? 'Copiado!' : 'Copiar'}</span>
              </Button>
              <Button
                onClick={handleShare}
                variant="secondary"
                size="sm"
                className="flex-1 bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-0"
              >
                <Share2 className="w-4 h-4" />
                <span className="text-xs">Compartilhar</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!result && !loading && (
        <div className="text-center py-8 text-muted-foreground">
          <Car className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-sm font-medium">
            Selecione marca, modelo e ano para consultar o valor FIPE
          </p>
        </div>
      )}
    </div>
  );
}
