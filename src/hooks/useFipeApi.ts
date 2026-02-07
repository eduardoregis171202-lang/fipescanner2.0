import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE, Brand, Model, Year, FipeResult, VehicleType } from '@/lib/constants';
import { toast } from '@/hooks/use-toast';

const MIN_YEAR = 1980;
const MAX_YEAR = new Date().getFullYear() + 1;

// Fallback brands when API is unavailable
const FALLBACK_BRANDS: Record<VehicleType, Brand[]> = {
  carros: [
    { codigo: "59", nome: "VW - VolksWagen" },
    { codigo: "25", nome: "FIAT" },
    { codigo: "22", nome: "CHEVROLET" },
    { codigo: "56", nome: "TOYOTA" },
    { codigo: "26", nome: "FORD" },
    { codigo: "29", nome: "HONDA" },
    { codigo: "32", nome: "HYUNDAI" },
    { codigo: "43", nome: "RENAULT" },
    { codigo: "36", nome: "JEEP" },
    { codigo: "40", nome: "NISSAN" },
    { codigo: "39", nome: "MITSUBISHI" },
    { codigo: "6", nome: "AUDI" },
    { codigo: "7", nome: "BMW" },
    { codigo: "38", nome: "MERCEDES-BENZ" },
    { codigo: "41", nome: "PEUGEOT" },
    { codigo: "21", nome: "CITROEN" },
    { codigo: "37", nome: "KIA" },
    { codigo: "48", nome: "SUZUKI" },
    { codigo: "18", nome: "CHERY" },
    { codigo: "102", nome: "BYD" },
    { codigo: "171", nome: "RAM" },
    { codigo: "51", nome: "TROLLER" }
  ],
  motos: [
    { codigo: "60", nome: "HONDA" },
    { codigo: "119", nome: "YAMAHA" },
    { codigo: "109", nome: "SUZUKI" },
    { codigo: "67", nome: "KAWASAKI" },
    { codigo: "50", nome: "DAFRA" },
    { codigo: "101", nome: "SHINERAY" },
    { codigo: "27", nome: "BMW" },
    { codigo: "73", nome: "TRIUMPH" },
    { codigo: "59", nome: "HARLEY-DAVIDSON" },
    { codigo: "53", nome: "DUCATI" }
  ],
  caminhoes: [
    { codigo: "114", nome: "VOLVO" },
    { codigo: "103", nome: "SCANIA" },
    { codigo: "102", nome: "MERCEDES-BENZ" },
    { codigo: "111", nome: "VW - VOLKSWAGEN" },
    { codigo: "101", nome: "IVECO" },
    { codigo: "116", nome: "DAF" },
    { codigo: "104", nome: "FORD" }
  ]
};

function filterValidYears(years: Year[]): Year[] {
  return years.filter(year => {
    const yearMatch = year.codigo.match(/^(\d+)/);
    if (!yearMatch) return false;
    const yearNumber = parseInt(yearMatch[1], 10);
    return yearNumber >= MIN_YEAR && yearNumber <= MAX_YEAR;
  });
}

function generateAllYears(): Year[] {
  const years: Year[] = [];
  for (let year = MAX_YEAR; year >= MIN_YEAR; year--) {
    years.push({ codigo: `${year}`, nome: `${year}` });
  }
  return years;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url: string, retries = 3, delayMs = 300): Promise<Response | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res;

      // Retry em rate limit e falhas temporárias
      const retryable = res.status === 429 || res.status === 408 || res.status === 502 || res.status === 503 || res.status === 504;
      if (retryable) {
        await delay(delayMs * (i + 2));
        continue;
      }

      return res;
    } catch (e) {
      console.error(`Fetch attempt ${i + 1} failed:`, e);
      if (i < retries - 1) await delay(delayMs * (i + 1));
    }
  }
  return null;
}

export function useFipeApi(vehicleType: VehicleType) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [allModels, setAllModels] = useState<Model[]>([]);
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);
  const [years, setYears] = useState<Year[]>([]);
  const [modelYears, setModelYears] = useState<Year[]>([]);
  const [result, setResult] = useState<FipeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [filteringModels, setFilteringModels] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [preSelectedYear, setPreSelectedYear] = useState('');

  const yearsCache = useRef<Record<string, Year[]>>({});

  const canUseLocalStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  const readCache = <T,>(key: string): T | null => {
    if (!canUseLocalStorage()) return null;
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  };
  const writeCache = (key: string, value: unknown) => {
    if (!canUseLocalStorage()) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore quota/private mode
    }
  };

  const brandsCacheKey = `fipe_cache:brands:${vehicleType}`;

  const resetSelections = useCallback(() => {
    setSelectedBrand('');
    setSelectedModel('');
    setSelectedYear('');
    setPreSelectedYear('');
    setAllModels([]);
    setFilteredModels([]);
    setYears([]);
    setModelYears([]);
    setResult(null);
    setError(null);
    yearsCache.current = {};
  }, []);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const url = `${API_BASE}/${vehicleType}/marcas`;
      const res = await fetchWithRetry(url);

      if (!res) {
        throw new Error('no_response');
      }
      if (!res.ok) {
        throw new Error(`http_${res.status}`);
      }

      const data = await res.json();
      const list = Array.isArray(data) ? (data as Brand[]) : [];
      setBrands(list);
      writeCache(brandsCacheKey, list);
    } catch (e) {
      console.error('fetchBrands error:', e);
      // Fallback 1: cache local
      const cached = readCache<Brand[]>(brandsCacheKey);
      if (cached && cached.length > 0) {
        setBrands(cached);
        toast({
          title: 'Aviso',
          description: 'API indisponível. Mostrando marcas em cache.',
        });
      } else {
        // Fallback 2: lista embutida no código
        const fallback = FALLBACK_BRANDS[vehicleType];
        if (fallback && fallback.length > 0) {
          setBrands(fallback);
          toast({
            title: 'Aviso',
            description: 'API indisponível. Mostrando marcas principais.',
          });
        } else {
          const details = e instanceof Error ? e.message : 'unknown';
          const msg = `Erro ao carregar marcas (${details}). Tente novamente.`;
          setError(msg);
          toast({ title: 'Erro', description: msg, variant: 'destructive' });
        }
      }
    } finally {
      setLoading(false);
    }
  }, [vehicleType, brandsCacheKey]);

  const fetchModels = useCallback(async (brandCode: string) => {
    if (!brandCode) {
      setAllModels([]);
      setFilteredModels([]);
      setYears([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithRetry(`${API_BASE}/${vehicleType}/marcas/${brandCode}/modelos`);
      if (!res || !res.ok) throw new Error('Erro ao carregar modelos');
      const data = await res.json();
      const models = data.modelos || [];
      setAllModels(models);
      setFilteredModels(models);
      setYears(generateAllYears());
      yearsCache.current = {};
    } catch (e) {
      console.error('fetchModels error:', e);
      const msg = 'Erro ao carregar modelos. Tente novamente.';
      setError(msg);
      toast({ title: 'Erro', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [vehicleType]);

  const fetchModelYearsData = useCallback(async (brandCode: string, modelCode: string): Promise<Year[]> => {
    const cacheKey = `${brandCode}-${modelCode}`;
    if (yearsCache.current[cacheKey]) {
      return yearsCache.current[cacheKey];
    }

    try {
      const res = await fetchWithRetry(
        `${API_BASE}/${vehicleType}/marcas/${brandCode}/modelos/${modelCode}/anos`,
        3, 300
      );
      if (!res || !res.ok) return [];
      const data = await res.json();
      const validYears = filterValidYears(Array.isArray(data) ? data : []);
      yearsCache.current[cacheKey] = validYears;
      return validYears;
    } catch {
      return [];
    }
  }, [vehicleType]);

  const filterModelsByYear = useCallback(async (brandCode: string, yearCode: string, models: Model[]) => {
    if (!brandCode || !yearCode || models.length === 0) {
      setFilteredModels(models);
      return;
    }

    setFilteringModels(true);
    const availableModels: Model[] = [];
    const unknownModels: Model[] = [];

    for (let i = 0; i < models.length; i++) {
      const model = models[i];
      const modelYearsData = await fetchModelYearsData(brandCode, String(model.codigo));
      
      if (modelYearsData.length === 0) {
        unknownModels.push(model);
      } else {
        const hasYear = modelYearsData.some(y => 
          y.codigo.startsWith(yearCode + '-') || y.codigo.startsWith(yearCode)
        );
        if (hasYear) availableModels.push(model);
      }

      if (i < models.length - 1) await delay(30);
      if ((i + 1) % 10 === 0) {
        setFilteredModels([...availableModels, ...unknownModels]);
      }
    }

    const finalModels = availableModels.length > 0 
      ? [...availableModels, ...unknownModels]
      : unknownModels.length > 0 ? unknownModels : [];

    setFilteredModels(finalModels);
    setFilteringModels(false);

    if (finalModels.length === 0 && models.length > 0) {
      toast({ 
        title: 'Atenção', 
        description: `Nenhum modelo encontrado para ${yearCode}.`,
        variant: 'destructive'
      });
    }
  }, [fetchModelYearsData]);

  const fetchModelYears = useCallback(async (brandCode: string, modelCode: string) => {
    if (!brandCode || !modelCode) {
      setModelYears([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const years = await fetchModelYearsData(brandCode, modelCode);
      if (years.length === 0) throw new Error('Erro ao carregar anos');
      setModelYears(years);
    } catch (e) {
      console.error('fetchModelYears error:', e);
      const msg = 'Erro ao carregar anos. Tente novamente.';
      setError(msg);
      toast({ title: 'Erro', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [fetchModelYearsData]);

  const fetchResult = useCallback(async (brandCode: string, modelCode: string, yearCode: string) => {
    if (!brandCode || !modelCode || !yearCode) {
      setResult(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithRetry(
        `${API_BASE}/${vehicleType}/marcas/${brandCode}/modelos/${modelCode}/anos/${yearCode}`,
        3, 300
      );
      if (!res || !res.ok) throw new Error('Erro ao buscar valor FIPE');
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error('fetchResult error:', e);
      const msg = 'Erro ao buscar valor FIPE. Tente novamente.';
      setError(msg);
      toast({ title: 'Erro', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [vehicleType]);

  useEffect(() => {
    resetSelections();
    fetchBrands();
  }, [vehicleType, fetchBrands, resetSelections]);

  useEffect(() => {
    if (selectedBrand) {
      setSelectedModel('');
      setSelectedYear('');
      setPreSelectedYear('');
      setModelYears([]);
      setResult(null);
      fetchModels(selectedBrand);
    }
  }, [selectedBrand, fetchModels]);

  useEffect(() => {
    if (selectedBrand && selectedYear && !selectedModel && allModels.length > 0) {
      setPreSelectedYear(selectedYear);
      filterModelsByYear(selectedBrand, selectedYear, allModels);
    } else if (!selectedYear && !selectedModel && allModels.length > 0) {
      setPreSelectedYear('');
      setFilteredModels(allModels);
    }
  }, [selectedYear, selectedBrand, selectedModel, allModels, filterModelsByYear]);

  useEffect(() => {
    if (selectedModel) {
      setResult(null);
      fetchModelYears(selectedBrand, selectedModel);
    }
  }, [selectedModel, selectedBrand, fetchModelYears]);

  useEffect(() => {
    if (!selectedModel || modelYears.length === 0) return;

    if (preSelectedYear) {
      const matchingYear = modelYears.find(y => 
        y.codigo.startsWith(preSelectedYear + '-') || y.codigo === preSelectedYear
      );
      
      if (matchingYear) {
        setSelectedYear(matchingYear.codigo);
      } else {
        setSelectedYear('');
        toast({ 
          title: 'Atenção', 
          description: 'O ano selecionado não está disponível para este modelo.',
          variant: 'destructive'
        });
      }
      setPreSelectedYear('');
    }
  }, [modelYears, selectedModel, preSelectedYear]);

  useEffect(() => {
    if (selectedModel && selectedYear && modelYears.length > 0) {
      const isValidFormat = selectedYear.includes('-');
      const yearValid = modelYears.some(y => y.codigo === selectedYear);
      if (isValidFormat && yearValid) {
        fetchResult(selectedBrand, selectedModel, selectedYear);
      }
    }
  }, [selectedYear, selectedBrand, selectedModel, modelYears, fetchResult]);

  const availableYears = selectedModel && modelYears.length > 0 ? modelYears : years;

  return {
    brands,
    models: filteredModels,
    years: availableYears,
    result,
    loading: loading || filteringModels,
    error,
    selectedBrand,
    selectedModel,
    selectedYear,
    setSelectedBrand,
    setSelectedModel,
    setSelectedYear,
    resetSelections
  };
}
