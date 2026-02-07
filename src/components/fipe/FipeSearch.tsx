import { useState, useMemo, useEffect, useRef } from 'react';
import { Car, Bike, Truck, Loader2 } from 'lucide-react';
import { VehicleType, FipeHistoryItem, API_BASE, Brand, Model, Year, FipeResult } from '@/lib/constants';
import { VehicleTypeSelector } from './VehicleTypeSelector';
import { FipeSelect } from './FipeSelect';
import { FipeResultCard } from './FipeResultCard';
import { FipeHistory } from './FipeHistory';
import { PriceComparison } from './PriceComparison';
import { FinancingCalculator } from './FinancingCalculator';
import { toast } from '@/hooks/use-toast';

interface FipeSearchProps {
  onSaveToHistory: (item: FipeHistoryItem) => void;
  history: FipeHistoryItem[];
  onClearHistory: () => void;
  onAddToCompare: (item: FipeHistoryItem) => void;
  compareList: FipeHistoryItem[];
}

export function FipeSearch({ 
  onSaveToHistory, 
  history, 
  onClearHistory,
  onAddToCompare,
  compareList
}: FipeSearchProps) {
  const [vehicleType, setVehicleType] = useState<VehicleType>('carros');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [years, setYears] = useState<Year[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [result, setResult] = useState<FipeResult | null>(null);
  const [loading, setLoading] = useState(false);
  
  const lastSavedRef = useRef<string | null>(null);

  // Fetch brands on mount and vehicle type change
  useEffect(() => {
    async function fetchBrands() {
      setLoading(true);
      setBrands([]);
      setModels([]);
      setYears([]);
      setSelectedBrand('');
      setSelectedModel('');
      setSelectedYear('');
      setResult(null);

      try {
        const res = await fetch(`${API_BASE}/${vehicleType}/marcas`);
        const data = await res.json();
        setBrands(data);
      } catch {
        toast({ title: 'Erro', description: 'Não foi possível carregar as marcas', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    fetchBrands();
  }, [vehicleType]);

  // Fetch models when brand changes
  useEffect(() => {
    if (!selectedBrand) {
      setModels([]);
      setYears([]);
      setSelectedModel('');
      setSelectedYear('');
      setResult(null);
      return;
    }

    async function fetchModels() {
      setLoading(true);
      setModels([]);
      setYears([]);
      setSelectedModel('');
      setSelectedYear('');
      setResult(null);

      try {
        const res = await fetch(`${API_BASE}/${vehicleType}/marcas/${selectedBrand}/modelos`);
        const data = await res.json();
        setModels(data.modelos || []);
      } catch {
        toast({ title: 'Erro', description: 'Não foi possível carregar os modelos', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    fetchModels();
  }, [selectedBrand, vehicleType]);

  // Fetch years when model changes
  useEffect(() => {
    if (!selectedModel) {
      setYears([]);
      setSelectedYear('');
      setResult(null);
      return;
    }

    async function fetchYears() {
      setLoading(true);
      setYears([]);
      setSelectedYear('');
      setResult(null);

      try {
        const res = await fetch(`${API_BASE}/${vehicleType}/marcas/${selectedBrand}/modelos/${selectedModel}/anos`);
        const data = await res.json();
        setYears(data);
      } catch {
        toast({ title: 'Erro', description: 'Não foi possível carregar os anos', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    fetchYears();
  }, [selectedModel, selectedBrand, vehicleType]);

  // Fetch result when year changes
  useEffect(() => {
    if (!selectedYear) {
      setResult(null);
      return;
    }

    async function fetchResult() {
      setLoading(true);

      try {
        const res = await fetch(`${API_BASE}/${vehicleType}/marcas/${selectedBrand}/modelos/${selectedModel}/anos/${selectedYear}`);
        const data = await res.json();
        setResult(data);
      } catch {
        toast({ title: 'Erro', description: 'Não foi possível buscar o valor FIPE', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    fetchResult();
  }, [selectedYear, selectedModel, selectedBrand, vehicleType]);

  // Save to history when result loads
  useEffect(() => {
    if (!result || !selectedBrand || !selectedModel || !selectedYear) return;

    const key = `${result.CodigoFipe}-${selectedYear}`;
    if (lastSavedRef.current === key) return;
    lastSavedRef.current = key;

    const brandName = brands.find(b => b.codigo === selectedBrand)?.nome || '';
    const modelName = models.find(m => String(m.codigo) === selectedModel)?.nome || '';
    const yearName = years.find(y => y.codigo === selectedYear)?.nome || '';

    onSaveToHistory({
      brand: brandName,
      model: modelName,
      year: yearName,
      value: result.Valor,
      codigoFipe: result.CodigoFipe,
      timestamp: Date.now()
    });
  }, [result, selectedBrand, selectedModel, selectedYear, brands, models, years, onSaveToHistory]);

  const isInCompareList = useMemo(() => {
    if (!result) return false;
    return compareList.some(c => c.codigoFipe === result.CodigoFipe);
  }, [result, compareList]);

  const handleAddToCompare = () => {
    if (!result || isInCompareList || compareList.length >= 3) return;

    const brandName = brands.find(b => b.codigo === selectedBrand)?.nome || '';
    const modelName = models.find(m => String(m.codigo) === selectedModel)?.nome || '';
    const yearName = years.find(y => y.codigo === selectedYear)?.nome || '';

    onAddToCompare({
      brand: brandName,
      model: modelName,
      year: yearName,
      value: result.Valor,
      codigoFipe: result.CodigoFipe,
      timestamp: Date.now()
    });

    toast({ title: 'Adicionado!', description: 'Veículo adicionado para comparação' });
  };

  const handleHistorySelect = (item: FipeHistoryItem) => {
    const brand = brands.find(b => b.nome === item.brand);
    if (brand) {
      setSelectedBrand(brand.codigo);
      toast({ title: 'Carregando...', description: `${item.brand} ${item.model}` });
    }
  };

  const brandOptions = useMemo(() => 
    brands.map(b => ({ value: b.codigo, label: b.nome })),
    [brands]
  );

  const modelOptions = useMemo(() => 
    models.map(m => ({ value: String(m.codigo), label: m.nome })),
    [models]
  );

  const yearOptions = useMemo(() => 
    years.map(y => ({ value: y.codigo, label: y.nome })),
    [years]
  );

  return (
    <div className="p-4 space-y-6 animate-fade-in">
      <VehicleTypeSelector value={vehicleType} onChange={setVehicleType} />

      <div className="space-y-4">
        <FipeSelect
          label="Marca"
          placeholder="Selecione a marca"
          options={brandOptions}
          value={selectedBrand}
          onChange={setSelectedBrand}
          loading={loading && !brands.length}
          disabled={!brands.length}
        />

        <FipeSelect
          label="Modelo"
          placeholder="Selecione o modelo"
          options={modelOptions}
          value={selectedModel}
          onChange={setSelectedModel}
          loading={loading && selectedBrand && !models.length}
          disabled={!selectedBrand || !models.length}
        />

        <FipeSelect
          label="Ano"
          placeholder="Selecione o ano"
          options={yearOptions}
          value={selectedYear}
          onChange={setSelectedYear}
          loading={loading && selectedModel && !years.length}
          disabled={!selectedModel || !years.length}
        />
      </div>

      {loading && !result && selectedYear && (
        <div className="py-8 flex justify-center">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      )}

      {result && (
        <>
          <FipeResultCard
            result={result}
            onAddToCompare={handleAddToCompare}
            isInCompareList={isInCompareList}
            compareListFull={compareList.length >= 3}
          />

          <PriceComparison fipeValue={result.Valor} />

          <FinancingCalculator fipeValue={result.Valor} />
        </>
      )}

      {!result && !loading && (
        <>
          <FipeHistory
            history={history}
            onSelect={handleHistorySelect}
            onClear={onClearHistory}
          />

          {history.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Car className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-sm font-medium">
                Selecione marca, modelo e ano para consultar o valor FIPE
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
