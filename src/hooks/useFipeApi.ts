import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  API_BASE,
  Brand,
  FipeResult,
  Model,
  VehicleType,
  Year,
} from "@/lib/constants";
import { toast } from "@/hooks/use-toast";
import { readCache, writeCache } from "@/lib/fipe/storage";
import { fetchJsonWithRetry, FetchJsonError } from "@/lib/fipe/http";
import { FALLBACK_BRANDS } from "@/lib/fipe/fallbackBrands";

const MIN_YEAR = 1980;
const MAX_YEAR = new Date().getFullYear() + 1;

function filterValidYears(years: Year[]): Year[] {
  return years.filter((year) => {
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

function getErrorCode(e: unknown) {
  if (e instanceof FetchJsonError) return e.code;
  if (e instanceof Error) return e.message;
  return "unknown";
}

export function useFipeApi(vehicleType: VehicleType) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [years, setYears] = useState<Year[]>([]);
  const [modelYears, setModelYears] = useState<Year[]>([]);
  const [result, setResult] = useState<FipeResult | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loadingCount, setLoadingCount] = useState(0);

  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [preSelectedYear, setPreSelectedYear] = useState("");

  const brandsCacheKey = useMemo(() => `fipe_cache:brands:${vehicleType}`, [vehicleType]);
  const modelsCacheKey = useCallback(
    (brandCode: string) => `fipe_cache:models:${vehicleType}:${brandCode}`,
    [vehicleType]
  );
  const modelYearsCacheKey = useCallback(
    (brandCode: string, modelCode: string) =>
      `fipe_cache:modelYears:${vehicleType}:${brandCode}:${modelCode}`,
    [vehicleType]
  );
  const resultCacheKey = useCallback(
    (brandCode: string, modelCode: string, yearCode: string) =>
      `fipe_cache:result:${vehicleType}:${brandCode}:${modelCode}:${yearCode}`,
    [vehicleType]
  );

  const startLoading = useCallback(() => setLoadingCount((c) => c + 1), []);
  const stopLoading = useCallback(
    () => setLoadingCount((c) => Math.max(0, c - 1)),
    []
  );

  const brandsReqId = useRef(0);
  const modelsReqId = useRef(0);
  const yearsReqId = useRef(0);
  const resultReqId = useRef(0);

  const resetSelections = useCallback(() => {
    setSelectedBrand("");
    setSelectedModel("");
    setSelectedYear("");
    setPreSelectedYear("");
    setModels([]);
    setYears([]);
    setModelYears([]);
    setResult(null);
    setError(null);
  }, []);

  const fetchBrands = useCallback(async () => {
    const reqId = ++brandsReqId.current;
    startLoading();
    setError(null);

    try {
      const url = `${API_BASE}/${vehicleType}/marcas`;
      const list = await fetchJsonWithRetry<Brand[]>(url, {
        retries: 3,
        baseDelayMs: 350,
        timeoutMs: 10_000,
      });

      if (reqId !== brandsReqId.current) return;

      const safeList = Array.isArray(list) ? list : [];
      setBrands(safeList);
      writeCache(brandsCacheKey, safeList);
    } catch (e) {
      if (reqId !== brandsReqId.current) return;

      const cached = readCache<Brand[]>(brandsCacheKey);
      if (cached && cached.length > 0) {
        setBrands(cached);
        toast({
          title: "Aviso",
          description: "API indisponível. Mostrando marcas em cache.",
        });
        return;
      }

      const fallback = FALLBACK_BRANDS[vehicleType];
      if (fallback && fallback.length > 0) {
        setBrands(fallback);
        toast({
          title: "Aviso",
          description: "API indisponível. Mostrando marcas principais.",
        });
        return;
      }

      const code = getErrorCode(e);
      const msg = `Erro ao carregar marcas (${code}). Tente novamente.`;
      setError(msg);
      toast({ title: "Erro", description: msg, variant: "destructive" });
    } finally {
      stopLoading();
    }
  }, [brandsCacheKey, startLoading, stopLoading, vehicleType]);

  const fetchModels = useCallback(
    async (brandCode: string) => {
      const reqId = ++modelsReqId.current;

      if (!brandCode) {
        setModels([]);
        setYears([]);
        setModelYears([]);
        setResult(null);
        return;
      }

      // Sempre gerar anos (não depende do endpoint de modelos)
      setYears(generateAllYears());

      // Primeiro: tenta cache para não deixar a UI vazia
      const cachedModels = readCache<Model[]>(modelsCacheKey(brandCode));
      if (cachedModels && cachedModels.length > 0) {
        setModels(cachedModels);
      } else {
        setModels([]);
      }

      startLoading();
      setError(null);

      try {
        const url = `${API_BASE}/${vehicleType}/marcas/${brandCode}/modelos`;
        const data = await fetchJsonWithRetry<{ modelos?: Model[] }>(url, {
          retries: 3,
          baseDelayMs: 500,
          timeoutMs: 12_000,
        });

        if (reqId !== modelsReqId.current) return;

        const list = Array.isArray(data?.modelos) ? data.modelos : [];
        setModels(list);
        writeCache(modelsCacheKey(brandCode), list);
      } catch (e) {
        if (reqId !== modelsReqId.current) return;

        const cached = readCache<Model[]>(modelsCacheKey(brandCode));
        if (cached && cached.length > 0) {
          toast({
            title: "Aviso",
            description: `API instável. Mantendo modelos em cache (${getErrorCode(e)}).`,
          });
          return;
        }

        const msg = `Erro ao carregar modelos (${getErrorCode(e)}). Tente novamente.`;
        setError(msg);
        toast({ title: "Erro", description: msg, variant: "destructive" });
      } finally {
        stopLoading();
      }
    },
    [modelsCacheKey, startLoading, stopLoading, vehicleType]
  );

  const fetchModelYears = useCallback(
    async (brandCode: string, modelCode: string) => {
      const reqId = ++yearsReqId.current;

      if (!brandCode || !modelCode) {
        setModelYears([]);
        return;
      }

      const cacheKey = modelYearsCacheKey(brandCode, modelCode);
      const cached = readCache<Year[]>(cacheKey);
      if (cached && cached.length > 0) {
        setModelYears(cached);
      } else {
        setModelYears([]);
      }

      startLoading();
      setError(null);

      try {
        const url = `${API_BASE}/${vehicleType}/marcas/${brandCode}/modelos/${modelCode}/anos`;
        const list = await fetchJsonWithRetry<Year[]>(url, {
          retries: 3,
          baseDelayMs: 350,
          timeoutMs: 12_000,
        });

        if (reqId !== yearsReqId.current) return;

        const valid = filterValidYears(Array.isArray(list) ? list : []);
        setModelYears(valid);
        writeCache(cacheKey, valid);
      } catch (e) {
        if (reqId !== yearsReqId.current) return;

        const cachedAgain = readCache<Year[]>(cacheKey);
        if (cachedAgain && cachedAgain.length > 0) {
          toast({
            title: "Aviso",
            description: `API instável. Mantendo anos em cache (${getErrorCode(e)}).`,
          });
          return;
        }

        const msg = `Erro ao carregar anos (${getErrorCode(e)}). Tente novamente.`;
        setError(msg);
        toast({ title: "Erro", description: msg, variant: "destructive" });
      } finally {
        stopLoading();
      }
    },
    [modelYearsCacheKey, startLoading, stopLoading, vehicleType]
  );

  const fetchResult = useCallback(
    async (brandCode: string, modelCode: string, yearCode: string) => {
      const reqId = ++resultReqId.current;

      if (!brandCode || !modelCode || !yearCode) {
        setResult(null);
        return;
      }

      const cacheKey = resultCacheKey(brandCode, modelCode, yearCode);
      const cached = readCache<FipeResult>(cacheKey);
      if (cached) setResult(cached);

      startLoading();
      setError(null);

      try {
        const url = `${API_BASE}/${vehicleType}/marcas/${brandCode}/modelos/${modelCode}/anos/${yearCode}`;
        const data = await fetchJsonWithRetry<FipeResult>(url, {
          retries: 3,
          baseDelayMs: 350,
          timeoutMs: 12_000,
        });

        if (reqId !== resultReqId.current) return;

        setResult(data);
        writeCache(cacheKey, data);
      } catch (e) {
        if (reqId !== resultReqId.current) return;

        const cachedAgain = readCache<FipeResult>(cacheKey);
        if (cachedAgain) {
          toast({
            title: "Aviso",
            description: `API instável. Mostrando resultado em cache (${getErrorCode(e)}).`,
          });
          return;
        }

        const msg = `Erro ao buscar valor FIPE (${getErrorCode(e)}). Tente novamente.`;
        setError(msg);
        toast({ title: "Erro", description: msg, variant: "destructive" });
      } finally {
        stopLoading();
      }
    },
    [resultCacheKey, startLoading, stopLoading, vehicleType]
  );

  useEffect(() => {
    resetSelections();
    setBrands([]);
    fetchBrands();
  }, [vehicleType, fetchBrands, resetSelections]);

  useEffect(() => {
    if (!selectedBrand) {
      setModels([]);
      setYears([]);
      setModelYears([]);
      setResult(null);
      return;
    }

    setSelectedModel("");
    setSelectedYear("");
    setPreSelectedYear("");
    setModelYears([]);
    setResult(null);
    fetchModels(selectedBrand);
  }, [selectedBrand, fetchModels]);

  // Ano pode ser escolhido antes do modelo: guardamos e validamos depois
  useEffect(() => {
    if (selectedBrand && selectedYear && !selectedModel) {
      setPreSelectedYear(selectedYear);
    }

    if (!selectedYear && !selectedModel) {
      setPreSelectedYear("");
    }
  }, [selectedBrand, selectedYear, selectedModel]);

  useEffect(() => {
    if (selectedModel) {
      setResult(null);
      fetchModelYears(selectedBrand, selectedModel);
    } else {
      setModelYears([]);
    }
  }, [selectedModel, selectedBrand, fetchModelYears]);

  // Se o usuário escolheu ano antes, tenta aplicar o ano compatível do modelo
  useEffect(() => {
    if (!selectedModel || modelYears.length === 0) return;
    if (!preSelectedYear) return;

    const matchingYear = modelYears.find(
      (y) => y.codigo.startsWith(preSelectedYear + "-") || y.codigo === preSelectedYear
    );

    if (matchingYear) {
      setSelectedYear(matchingYear.codigo);
    } else {
      setSelectedYear("");
      toast({
        title: "Atenção",
        description: "O ano selecionado não está disponível para este modelo.",
        variant: "destructive",
      });
    }

    setPreSelectedYear("");
  }, [modelYears, selectedModel, preSelectedYear]);

  useEffect(() => {
    if (!selectedModel || !selectedYear) return;

    // Só busca resultado quando o ano vem da lista do modelo (formato esperado)
    const yearValid = modelYears.some((y) => y.codigo === selectedYear);
    const isValidFormat = selectedYear.includes("-");

    // Se ainda não carregou modelYears, aguarda.
    if (modelYears.length === 0) return;

    if (isValidFormat && yearValid) {
      fetchResult(selectedBrand, selectedModel, selectedYear);
    }
  }, [selectedBrand, selectedModel, selectedYear, modelYears, fetchResult]);

  const availableYears = selectedModel && modelYears.length > 0 ? modelYears : years;

  return {
    brands,
    models,
    years: availableYears,
    result,
    loading: loadingCount > 0,
    error,
    selectedBrand,
    selectedModel,
    selectedYear,
    setSelectedBrand,
    setSelectedModel,
    setSelectedYear,
    resetSelections,
  };
}
