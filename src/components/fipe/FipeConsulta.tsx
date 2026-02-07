import { useState, useEffect, useCallback } from 'react';
import { Loader2, Car, ChevronDown, WifiOff } from 'lucide-react';
import { VehicleType, API_BASE, Brand, Model, Year, FipeResult } from '@/lib/constants';
import { FALLBACK_BRANDS, FALLBACK_MODELS } from '@/lib/fipeFallbackData';
import { VehicleTypeSelector } from './VehicleTypeSelector';
import { toast } from '@/hooks/use-toast';

interface FipeConsultaProps {
  onResult?: (result: FipeResult | null) => void;
}

export function FipeConsulta({ onResult }: FipeConsultaProps) {
  const [vehicleType, setVehicleType] = useState<VehicleType>('carros');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [years, setYears] = useState<Year[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [result, setResult] = useState<FipeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  // Fetch with failover and fallback support
  const fetchWithFailover = useCallback(async (endpoint: string, fallbackKey?: string) => {
    const v1Url = `${API_BASE}/${endpoint}`;
    const v2Url = `https://parallelum.com.br/fipe/api/v2/${endpoint}`;
    
    // Try v1 first
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      
      const res = await fetch(v1Url, { signal: controller.signal });
      clearTimeout(timeout);
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setUsingFallback(false);
      return await res.json();
    } catch (e) {
      console.log('v1 failed, trying v2...', e);
    }
    
    // Try v2
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      
      const res = await fetch(v2Url, { signal: controller.signal });
      clearTimeout(timeout);
      
      if (!res.ok) throw new Error(`v2 HTTP ${res.status}`);
      setUsingFallback(false);
      return await res.json();
    } catch (e) {
      console.log('v2 failed, using fallback...', e);
    }
    
    // Return null to indicate API failure
    return null;
  }, []);

  // Fetch brands with fallback
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

      const data = await fetchWithFailover(`${vehicleType}/marcas`);
      
      if (Array.isArray(data) && data.length > 0) {
        setBrands(data);
        setUsingFallback(false);
      } else {
        // Use fallback
        const fallback = FALLBACK_BRANDS[vehicleType] || FALLBACK_BRANDS['carros'];
        setBrands(fallback);
        setUsingFallback(true);
        toast({ 
          title: 'Modo offline', 
          description: 'Usando dados locais. Alguns recursos limitados.',
        });
      }
      
      setLoading(false);
    }
    fetchBrands();
  }, [vehicleType, fetchWithFailover]);

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

      const data = await fetchWithFailover(`${vehicleType}/marcas/${selectedBrand}/modelos`);
      const modelos = data?.modelos;
      
      if (Array.isArray(modelos) && modelos.length > 0) {
        setModels(modelos);
      } else {
        // Use fallback models
        const fallback = FALLBACK_MODELS[selectedBrand] || [];
        if (fallback.length > 0) {
          setModels(fallback);
          setUsingFallback(true);
        } else {
          toast({ 
            title: 'Modelos indisponíveis', 
            description: 'Não há modelos offline para esta marca',
            variant: 'destructive' 
          });
        }
      }
      
      setLoading(false);
    }
    fetchModels();
  }, [selectedBrand, vehicleType, fetchWithFailover]);

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

      const data = await fetchWithFailover(
        `${vehicleType}/marcas/${selectedBrand}/modelos/${selectedModel}/anos`
      );
      
      if (Array.isArray(data) && data.length > 0) {
        setYears(data);
      } else {
        // Generate common years as fallback
        const currentYear = new Date().getFullYear();
        const fallbackYears: Year[] = [];
        for (let year = currentYear + 1; year >= currentYear - 15; year--) {
          fallbackYears.push({ codigo: `${year}-1`, nome: `${year} Gasolina` });
          fallbackYears.push({ codigo: `${year}-3`, nome: `${year} Diesel` });
        }
        fallbackYears.push({ codigo: '32000-1', nome: '0 KM' });
        setYears(fallbackYears);
        setUsingFallback(true);
      }
      
      setLoading(false);
    }
    fetchYears();
  }, [selectedModel, selectedBrand, vehicleType, fetchWithFailover]);

  // Fetch FIPE result when year changes
  useEffect(() => {
    if (!selectedYear) {
      setResult(null);
      onResult?.(null);
      return;
    }

    async function fetchResult() {
      setLoading(true);

      const data = await fetchWithFailover(
        `${vehicleType}/marcas/${selectedBrand}/modelos/${selectedModel}/anos/${selectedYear}`
      );
      
      if (data && (data.Valor || data.price)) {
        // Normalize response
        const normalized: FipeResult = {
          Valor: data.Valor || data.price || data.valor,
          Marca: data.Marca || data.brand || '',
          Modelo: data.Modelo || data.model || '',
          AnoModelo: data.AnoModelo || data.modelYear || 0,
          Combustivel: data.Combustivel || data.fuel || '',
          CodigoFipe: data.CodigoFipe || data.codeFipe || '',
          MesReferencia: data.MesReferencia || data.referenceMonth || '',
          TipoVeiculo: data.TipoVeiculo || 1,
          SiglaCombustivel: data.SiglaCombustivel || ''
        };
        
        setResult(normalized);
        onResult?.(normalized);
      } else {
        toast({ 
          title: 'Valor indisponível', 
          description: 'Não foi possível obter o preço FIPE',
          variant: 'destructive' 
        });
        setResult(null);
        onResult?.(null);
      }
      
      setLoading(false);
    }
    fetchResult();
  }, [selectedYear, selectedModel, selectedBrand, vehicleType, onResult, fetchWithFailover]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-1">Tabela Fipe</h2>
        <p className="text-sm text-muted-foreground">Consulte o preço oficial de mercado.</p>
      </div>

      {/* Offline indicator */}
      {usingFallback && (
        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-lg text-sm">
          <WifiOff size={16} />
          <span>Modo offline - dados limitados</span>
        </div>
      )}

      <VehicleTypeSelector value={vehicleType} onChange={setVehicleType} />

      {/* Card de Input */}
      <div className="bg-card p-6 rounded-2xl shadow-sm border border-border space-y-5">
        {/* Marca */}
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-2 ml-1">
            Marca
          </label>
          <div className="relative">
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              disabled={loading && !brands.length}
              className="w-full p-4 rounded-xl bg-muted/50 border border-border appearance-none font-medium transition focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            >
              <option value="">
                {loading && !brands.length ? 'Carregando...' : 'Selecione a Marca'}
              </option>
              {brands.map((b) => (
                <option key={b.codigo} value={b.codigo}>{b.nome}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={18} />
          </div>
        </div>

        {/* Modelo */}
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-2 ml-1">
            Modelo
          </label>
          <div className="relative">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={!selectedBrand || (loading && !models.length)}
              className="w-full p-4 rounded-xl bg-muted/50 border border-border appearance-none font-medium transition focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:bg-muted/30"
            >
              <option value="">
                {!selectedBrand 
                  ? 'Selecione a Marca primeiro' 
                  : loading && !models.length 
                    ? 'Carregando...' 
                    : 'Selecione o Modelo'}
              </option>
              {models.map((m) => (
                <option key={m.codigo} value={String(m.codigo)}>{m.nome}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={18} />
          </div>
        </div>

        {/* Ano */}
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-2 ml-1">
            Ano Modelo
          </label>
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              disabled={!selectedModel || (loading && !years.length)}
              className="w-full p-4 rounded-xl bg-muted/50 border border-border appearance-none font-medium transition focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:bg-muted/30"
            >
              <option value="">
                {!selectedModel 
                  ? 'Selecione o Modelo primeiro' 
                  : loading && !years.length 
                    ? 'Carregando...' 
                    : 'Selecione o Ano'}
              </option>
              {years.map((y) => (
                <option key={y.codigo} value={y.codigo}>{y.nome}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={18} />
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && !result && selectedYear && (
        <div className="py-8 flex justify-center">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div className="bg-primary text-primary-foreground p-6 rounded-2xl shadow-lg relative overflow-hidden animate-fade-in">
          <div className="absolute -right-10 -top-10 bg-white/10 w-32 h-32 rounded-full blur-2xl" />
          
          <p className="text-primary-foreground/70 text-xs font-bold uppercase tracking-widest mb-2">
            Preço Médio
          </p>
          
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold opacity-60">R$</span>
            <h2 className="text-4xl font-extrabold tracking-tight">
              {result.Valor?.replace('R$ ', '') || '--'}
            </h2>
          </div>
          
          <p className="text-sm text-primary-foreground/80 mt-2 font-medium truncate">
            {result.Modelo} ({result.AnoModelo})
          </p>
          
          <div className="mt-6 flex gap-3">
            <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">
              <p className="text-[10px] text-primary-foreground/70 uppercase font-bold">Cód. Fipe</p>
              <p className="text-xs font-mono font-bold">{result.CodigoFipe}</p>
            </div>
            <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">
              <p className="text-[10px] text-primary-foreground/70 uppercase font-bold">Ref.</p>
              <p className="text-xs font-bold">{result.MesReferencia}</p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!result && !loading && !selectedYear && (
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
