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

// Fallback models for popular brands when API is unavailable
const FALLBACK_MODELS: Record<string, Model[]> = {
  // VW - VolksWagen (codigo: 59)
  "59": [
    { codigo: 5940, nome: "Gol 1.0" },
    { codigo: 5941, nome: "Gol 1.6" },
    { codigo: 6756, nome: "Polo 1.0 TSI" },
    { codigo: 6757, nome: "Polo 1.4 TSI" },
    { codigo: 6673, nome: "T-Cross 1.0 TSI" },
    { codigo: 6674, nome: "T-Cross 1.4 TSI" },
    { codigo: 6826, nome: "Nivus 1.0 TSI" },
    { codigo: 6549, nome: "Virtus 1.0 TSI" },
    { codigo: 6550, nome: "Virtus 1.4 TSI" },
    { codigo: 6286, nome: "Jetta 1.4 TSI" },
    { codigo: 6287, nome: "Jetta 2.0 TSI" },
    { codigo: 6680, nome: "Taos 1.4 TSI" },
    { codigo: 6571, nome: "Tiguan 1.4 TSI" },
    { codigo: 6572, nome: "Tiguan 2.0 TSI" },
    { codigo: 6688, nome: "Amarok 2.0 TDI" },
    { codigo: 6689, nome: "Amarok 3.0 V6 TDI" },
    { codigo: 5585, nome: "Fox 1.0" },
    { codigo: 5586, nome: "Fox 1.6" },
    { codigo: 5665, nome: "Saveiro 1.6" },
    { codigo: 5503, nome: "Voyage 1.0" },
    { codigo: 5504, nome: "Voyage 1.6" }
  ],
  // FIAT (codigo: 25)
  "25": [
    { codigo: 5765, nome: "Argo 1.0" },
    { codigo: 5766, nome: "Argo 1.3" },
    { codigo: 5767, nome: "Argo 1.8" },
    { codigo: 7099, nome: "Cronos 1.0" },
    { codigo: 7100, nome: "Cronos 1.3" },
    { codigo: 7101, nome: "Cronos 1.8" },
    { codigo: 7355, nome: "Pulse 1.0 Turbo" },
    { codigo: 7356, nome: "Pulse 1.3 Turbo" },
    { codigo: 7400, nome: "Fastback 1.0 Turbo" },
    { codigo: 7401, nome: "Fastback 1.3 Turbo" },
    { codigo: 5801, nome: "Mobi 1.0" },
    { codigo: 6160, nome: "Strada 1.3" },
    { codigo: 6161, nome: "Strada 1.4" },
    { codigo: 6162, nome: "Strada 1.8" },
    { codigo: 5608, nome: "Toro 1.8" },
    { codigo: 5609, nome: "Toro 2.0 Diesel" },
    { codigo: 5350, nome: "Uno 1.0" },
    { codigo: 5351, nome: "Uno 1.4" }
  ],
  // CHEVROLET (codigo: 22)
  "22": [
    { codigo: 6408, nome: "Onix 1.0" },
    { codigo: 6409, nome: "Onix 1.0 Turbo" },
    { codigo: 6410, nome: "Onix Plus 1.0 Turbo" },
    { codigo: 6705, nome: "Tracker 1.0 Turbo" },
    { codigo: 6706, nome: "Tracker 1.2 Turbo" },
    { codigo: 6140, nome: "S10 2.5" },
    { codigo: 6141, nome: "S10 2.8 Diesel" },
    { codigo: 6142, nome: "Trailblazer 2.8 Diesel" },
    { codigo: 6280, nome: "Spin 1.8" },
    { codigo: 6350, nome: "Cruze 1.4 Turbo" },
    { codigo: 6805, nome: "Montana 1.2 Turbo" },
    { codigo: 5720, nome: "Cobalt 1.4" },
    { codigo: 5721, nome: "Cobalt 1.8" },
    { codigo: 5580, nome: "Prisma 1.0" },
    { codigo: 5581, nome: "Prisma 1.4" }
  ],
  // TOYOTA (codigo: 56)
  "56": [
    { codigo: 6255, nome: "Corolla 1.8" },
    { codigo: 6256, nome: "Corolla 2.0" },
    { codigo: 6257, nome: "Corolla Cross 1.8 Hybrid" },
    { codigo: 6258, nome: "Corolla Cross 2.0" },
    { codigo: 6420, nome: "Yaris 1.3" },
    { codigo: 6421, nome: "Yaris 1.5" },
    { codigo: 6422, nome: "Yaris Sedan 1.5" },
    { codigo: 6130, nome: "Hilux 2.7" },
    { codigo: 6131, nome: "Hilux 2.8 Diesel" },
    { codigo: 6132, nome: "SW4 2.7" },
    { codigo: 6133, nome: "SW4 2.8 Diesel" },
    { codigo: 6650, nome: "RAV4 2.5 Hybrid" },
    { codigo: 5980, nome: "Etios 1.3" },
    { codigo: 5981, nome: "Etios 1.5" }
  ],
  // HONDA (codigo: 29)
  "29": [
    { codigo: 6180, nome: "Civic 1.5 Turbo" },
    { codigo: 6181, nome: "Civic 2.0" },
    { codigo: 6315, nome: "City 1.5" },
    { codigo: 6316, nome: "City Hatch 1.5" },
    { codigo: 6500, nome: "HR-V 1.5 Turbo" },
    { codigo: 6501, nome: "HR-V 1.8" },
    { codigo: 6390, nome: "CR-V 1.5 Turbo" },
    { codigo: 6391, nome: "CR-V 2.0 Hybrid" },
    { codigo: 6600, nome: "ZR-V 2.0 Hybrid" },
    { codigo: 5680, nome: "Fit 1.4" },
    { codigo: 5681, nome: "Fit 1.5" },
    { codigo: 5755, nome: "WR-V 1.5" }
  ],
  // HYUNDAI (codigo: 32)
  "32": [
    { codigo: 6220, nome: "HB20 1.0" },
    { codigo: 6221, nome: "HB20 1.0 Turbo" },
    { codigo: 6222, nome: "HB20 1.6" },
    { codigo: 6223, nome: "HB20S 1.0" },
    { codigo: 6224, nome: "HB20S 1.0 Turbo" },
    { codigo: 6460, nome: "Creta 1.0 Turbo" },
    { codigo: 6461, nome: "Creta 2.0" },
    { codigo: 6580, nome: "Tucson 1.6 Turbo" },
    { codigo: 6581, nome: "Tucson 2.0" },
    { codigo: 6750, nome: "Santa Fe 2.0 Turbo" },
    { codigo: 6751, nome: "Santa Fe 3.5 V6" }
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
