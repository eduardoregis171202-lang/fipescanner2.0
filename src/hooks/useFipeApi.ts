import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE, Brand, Model, Year, FipeResult, VehicleType } from '@/lib/constants';
import { FALLBACK_BRANDS, FALLBACK_MODELS } from '@/lib/fipeFallbackData';
import { toast } from '@/hooks/use-toast';

const MIN_YEAR = 1980;
const MAX_YEAR = new Date().getFullYear() + 1;

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
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 8000);

      const res = await fetch(url, { signal: controller.signal });
      window.clearTimeout(timeoutId);

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

type ApiProvider = 'v1' | 'v2';

const API_BASE_V2 = "https://fipe.parallelum.com.br/api/v2";

const vehicleTypeToV2 = (vehicleType: VehicleType) => {
  switch (vehicleType) {
    case 'carros':
      return 'cars' as const;
    case 'motos':
      return 'motorcycles' as const;
    case 'caminhoes':
      return 'trucks' as const;
  }
};

type V2Brand = { code: string; name: string };
type V2Model = { code: string; name: string };
type V2Year = { code: string; name: string };
type V2FipeResult = {
  price: string;
  brand: string;
  model: string;
  modelYear: number;
  fuel: string;
  fuelAcronym: string;
  codeFipe: string;
  referenceMonth: string;
  vehicleType: number;
};

async function fetchFromProviders<T>(
  attempts: Array<{ provider: ApiProvider; url: string; parse: (data: any) => T }>,
  retries = 3,
  delayMs = 300
): Promise<{ data: T; provider: ApiProvider }> {
  let lastError: Error | null = null;

  for (const attempt of attempts) {
    const res = await fetchWithRetry(attempt.url, retries, delayMs);

    if (!res) {
      lastError = new Error('no_response');
      continue;
    }

    if (!res.ok) {
      lastError = new Error(`http_${res.status}`);
      continue;
    }

    const json = await res.json();
    return { data: attempt.parse(json), provider: attempt.provider };
  }

  throw lastError ?? new Error('unknown');
}

const mapV2Brand = (b: V2Brand): Brand => ({ codigo: b.code, nome: b.name });
const mapV2Model = (m: V2Model): Model => ({ codigo: Number(m.code), nome: m.name });
const mapV2Year = (y: V2Year): Year => ({ codigo: y.code, nome: y.name });
const mapV2Result = (r: V2FipeResult): FipeResult => ({
  Valor: r.price,
  Marca: r.brand,
  Modelo: r.model,
  AnoModelo: r.modelYear,
  Combustivel: r.fuel,
  CodigoFipe: r.codeFipe,
  MesReferencia: r.referenceMonth,
  TipoVeiculo: r.vehicleType,
  SiglaCombustivel: r.fuelAcronym,
});

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
      const v2Type = vehicleTypeToV2(vehicleType);

      const { data: list } = await fetchFromProviders<Brand[]>(
        [
          {
            provider: 'v1',
            url: `${API_BASE}/${vehicleType}/marcas`,
            parse: (data) => (Array.isArray(data) ? (data as Brand[]) : []),
          },
          {
            provider: 'v2',
            url: `${API_BASE_V2}/${v2Type}/brands`,
            parse: (data) => (Array.isArray(data) ? (data as V2Brand[]).map(mapV2Brand) : []),
          },
        ],
        3,
        300
      );

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
    
    // Sempre gerar anos, mesmo se modelos falharem
    setYears(generateAllYears());
    yearsCache.current = {};
    
    try {
      const v2Type = vehicleTypeToV2(vehicleType);

      const { data: models } = await fetchFromProviders<Model[]>(
        [
          {
            provider: 'v1',
            url: `${API_BASE}/${vehicleType}/marcas/${brandCode}/modelos`,
            parse: (data) => (data?.modelos ? (data.modelos as Model[]) : []),
          },
          {
            provider: 'v2',
            url: `${API_BASE_V2}/${v2Type}/brands/${brandCode}/models`,
            parse: (data) => (Array.isArray(data) ? (data as V2Model[]).map(mapV2Model) : []),
          },
        ],
        3,
        500
      );

      setAllModels(models);
      setFilteredModels(models);
    } catch (e) {
      console.error('fetchModels error:', e);
      // Fallback to popular models when API fails
      const fallbackModels = FALLBACK_MODELS[brandCode];
      if (fallbackModels && fallbackModels.length > 0) {
        setAllModels(fallbackModels);
        setFilteredModels(fallbackModels);
        toast({
          title: 'Aviso',
          description: 'API indisponível. Mostrando modelos principais.',
        });
      } else {
        setAllModels([]);
        setFilteredModels([]);
        const details = e instanceof Error ? e.message : 'unknown';
        const msg = `Erro ao carregar modelos (${details}). Tente novamente.`;
        setError(msg);
        toast({ title: 'Erro', description: msg, variant: 'destructive' });
      }
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
      const v2Type = vehicleTypeToV2(vehicleType);

      const { data: validYears } = await fetchFromProviders<Year[]>(
        [
          {
            provider: 'v1',
            url: `${API_BASE}/${vehicleType}/marcas/${brandCode}/modelos/${modelCode}/anos`,
            parse: (data) => filterValidYears(Array.isArray(data) ? (data as Year[]) : []),
          },
          {
            provider: 'v2',
            url: `${API_BASE_V2}/${v2Type}/brands/${brandCode}/models/${modelCode}/years`,
            parse: (data) => filterValidYears(Array.isArray(data) ? (data as V2Year[]).map(mapV2Year) : []),
          },
        ],
        3,
        300
      );

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
      const v2Type = vehicleTypeToV2(vehicleType);

      const { data } = await fetchFromProviders<FipeResult>(
        [
          {
            provider: 'v1',
            url: `${API_BASE}/${vehicleType}/marcas/${brandCode}/modelos/${modelCode}/anos/${yearCode}`,
            parse: (json) => json as FipeResult,
          },
          {
            provider: 'v2',
            url: `${API_BASE_V2}/${v2Type}/brands/${brandCode}/models/${modelCode}/years/${yearCode}`,
            parse: (json) => mapV2Result(json as V2FipeResult),
          },
        ],
        3,
        300
      );

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
