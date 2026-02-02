import { useState, useMemo } from 'react';
import { Car, Bike, Truck, Loader2, Share2, Copy, Check, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useFipeApi } from '@/hooks/useFipeApi';
import { VehicleType, FipeHistoryItem } from '@/lib/constants';
import { toast } from '@/hooks/use-toast';
import { PriceComparison } from './PriceComparison';
import { FinancingCalculator } from './FinancingCalculator';
import { SearchableSelect } from './SearchableSelect';
import { FipeHistory } from './FipeHistory';

interface FipeEvaluatorProps {
  onSaveToHistory: (item: FipeHistoryItem) => void;
  history: FipeHistoryItem[];
  onClearHistory: () => void;
  onAddToCompare: (item: FipeHistoryItem) => void;
  compareList: FipeHistoryItem[];
}

export function FipeEvaluator({ 
  onSaveToHistory, 
  history, 
  onClearHistory,
  onAddToCompare,
  compareList
}: FipeEvaluatorProps) {
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

  // Convert to searchable format
  const brandOptions = useMemo(() => 
    brands.map(b => ({ codigo: b.codigo, nome: b.nome })),
    [brands]
  );

  const modelOptions = useMemo(() => 
    models.map(m => ({ codigo: String(m.codigo), nome: m.nome })),
    [models]
  );

  const yearOptions = useMemo(() => 
    years.map(y => ({ codigo: y.codigo, nome: y.nome })),
    [years]
  );

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

  // Check if current result is in compare list
  const isInCompareList = useMemo(() => {
    if (!result) return false;
    return compareList.some(c => c.codigoFipe === result.CodigoFipe);
  }, [result, compareList]);

  // Create history item from current result
  const currentHistoryItem = useMemo((): FipeHistoryItem | null => {
    if (!result || !selectedBrand || !selectedModel || !selectedYear) return null;
    const brandName = brands.find(b => b.codigo === selectedBrand)?.nome || '';
    const modelName = models.find(m => String(m.codigo) === selectedModel)?.nome || '';
    const yearName = years.find(y => y.codigo === selectedYear)?.nome || '';
    
    return {
      brand: brandName,
      model: modelName,
      year: yearName,
      value: result.Valor,
      codigoFipe: result.CodigoFipe,
      timestamp: Date.now()
    };
  }, [result, selectedBrand, selectedModel, selectedYear, brands, models, years]);

  // Save to history when result loads
  if (currentHistoryItem && result?.CodigoFipe) {
    onSaveToHistory(currentHistoryItem);
  }

  const handleAddToCompareClick = () => {
    if (currentHistoryItem && !isInCompareList && compareList.length < 3) {
      onAddToCompare(currentHistoryItem);
      toast({ title: 'Adicionado!', description: 'Veículo adicionado para comparação' });
    }
  };

  const handleHistorySelect = (item: FipeHistoryItem) => {
    // Find brand, model, year codes from names
    const brand = brands.find(b => b.nome === item.brand);
    if (brand) {
      setSelectedBrand(brand.codigo);
      // Model and year will be set via useEffect cascade in useFipeApi
      toast({ 
        title: 'Carregando...', 
        description: `${item.brand} ${item.model}` 
      });
    }
  };

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

      {/* Searchable Selects */}
      <div className="space-y-4">
        <SearchableSelect
          options={brandOptions}
          value={selectedBrand}
          onChange={setSelectedBrand}
          placeholder="Selecione a Marca"
          label="Marca"
          loading={loading && !brands.length}
        />

        <SearchableSelect
          options={modelOptions}
          value={selectedModel}
          onChange={setSelectedModel}
          placeholder="Selecione o Modelo"
          label="Modelo"
          disabled={!selectedBrand}
          loading={loading && selectedBrand && !models.length}
        />

        <SearchableSelect
          options={yearOptions}
          value={selectedYear}
          onChange={setSelectedYear}
          placeholder="Selecione o Ano"
          label="Ano"
          disabled={!selectedModel}
          loading={loading && selectedModel && !years.length}
        />
      </div>

      {/* Loading */}
      {loading && !result && selectedYear && (
        <div className="py-8 flex justify-center">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      )}

      {result && (
        <>
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
                <Button
                  onClick={handleAddToCompareClick}
                  variant="secondary"
                  size="sm"
                  disabled={isInCompareList || compareList.length >= 3}
                  className="flex-1 bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-0 disabled:opacity-50"
                >
                  <Scale className="w-4 h-4" />
                  <span className="text-xs">{isInCompareList ? 'Adicionado' : 'Comparar'}</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Price Comparison */}
          <PriceComparison fipeValue={result.Valor} />

          {/* Financing Calculator */}
          <FinancingCalculator fipeValue={result.Valor} />
        </>
      )}

      {/* FIPE History */}
      {!result && (
        <FipeHistory
          history={history}
          onSelect={handleHistorySelect}
          onClear={onClearHistory}
        />
      )}

      {/* Empty State */}
      {!result && !loading && history.length === 0 && (
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
