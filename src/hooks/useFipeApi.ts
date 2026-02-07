import { useState, useEffect, useCallback, useMemo } from 'react';
import { API_BASE, Brand, Model, Year, FipeResult, VehicleType } from '@/lib/constants';
import { toast } from '@/hooks/use-toast';

// Constantes de anos válidos
const MIN_YEAR = 1980;
const MAX_YEAR = new Date().getFullYear() + 1; // Permite veículos do próximo ano

// Filtra anos inválidos (ex: 32000) - mantém apenas anos entre 1980 e ano atual + 1
function filterValidYears(years: Year[]): Year[] {
  return years.filter(year => {
    // Extrai o número do ano do código (ex: "2024-1" -> 2024)
    const yearMatch = year.codigo.match(/^(\d+)/);
    if (!yearMatch) return false;
    
    const yearNumber = parseInt(yearMatch[1], 10);
    
    // Verifica se é um ano válido
    return yearNumber >= MIN_YEAR && yearNumber <= MAX_YEAR;
  });
}

// Gera lista completa de anos para seleção inicial (quando só a marca foi escolhida)
// A API FIPE retorna dados incompletos a nível de marca, então geramos todos os anos possíveis
// Mostra apenas o ano, sem variações de combustível - a variação será determinada pelo modelo
function generateAllYears(): Year[] {
  const years: Year[] = [];
  
  // Gera anos do mais recente ao mais antigo
  for (let year = MAX_YEAR; year >= MIN_YEAR; year--) {
    years.push({ codigo: `${year}`, nome: `${year}` });
  }
  
  return years;
}

export function useFipeApi(vehicleType: VehicleType) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [allModels, setAllModels] = useState<Model[]>([]); // Todos os modelos da marca
  const [filteredModels, setFilteredModels] = useState<Model[]>([]); // Modelos filtrados pelo ano
  const [years, setYears] = useState<Year[]>([]); // Anos gerais da marca
  const [modelYears, setModelYears] = useState<Year[]>([]); // Anos específicos do modelo
  const [result, setResult] = useState<FipeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [filteringModels, setFilteringModels] = useState(false); // Loading para filtragem de modelos
  const [error, setError] = useState<string | null>(null);

  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [yearValidated, setYearValidated] = useState(false); // Flag para validação do ano

  // Reset quando muda tipo de veículo
  const resetSelections = useCallback(() => {
    setSelectedBrand('');
    setSelectedModel('');
    setSelectedYear('');
    setAllModels([]);
    setFilteredModels([]);
    setYears([]);
    setModelYears([]);
    setResult(null);
    setError(null);
  }, []);

  // Fetch marcas
  const fetchBrands = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/${vehicleType}/marcas`);
      if (!res.ok) throw new Error('Erro ao carregar marcas');
      const data = await res.json();
      setBrands(Array.isArray(data) ? data : []);
    } catch (e) {
      const msg = 'Erro ao carregar marcas. Tente novamente.';
      setError(msg);
      toast({ title: 'Erro', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [vehicleType]);

  // Fetch modelos e anos gerais da marca
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
      const res = await fetch(`${API_BASE}/${vehicleType}/marcas/${brandCode}/modelos`);
      if (!res.ok) throw new Error('Erro ao carregar modelos');
      const data = await res.json();
      const models = data.modelos || [];
      setAllModels(models);
      setFilteredModels(models); // Inicialmente mostra todos
      // Usar lista completa de anos - os dados da API a nível de marca são incompletos
      setYears(generateAllYears());
    } catch (e) {
      const msg = 'Erro ao carregar modelos. Tente novamente.';
      setError(msg);
      toast({ title: 'Erro', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [vehicleType]);

  // Filtra modelos que estão disponíveis para o ano selecionado
  const filterModelsByYear = useCallback(async (brandCode: string, yearCode: string, models: Model[]) => {
    if (!brandCode || !yearCode || models.length === 0) {
      setFilteredModels(models);
      return;
    }

    setFilteringModels(true);
    const availableModels: Model[] = [];

    // Verifica cada modelo em paralelo (com limite de concorrência)
    const checkModelYear = async (model: Model): Promise<boolean> => {
      try {
        const res = await fetch(`${API_BASE}/${vehicleType}/marcas/${brandCode}/modelos/${model.codigo}/anos`);
        if (!res.ok) return false;
        const years: Year[] = await res.json();
        
        // Verifica se algum ano começa com o código do ano selecionado
        // Ex: yearCode "2024" deve corresponder a "2024-1", "2024-2", etc.
        return years.some(y => y.codigo.startsWith(yearCode));
      } catch {
        return false;
      }
    };

    // Processar em lotes de 5 para não sobrecarregar a API
    const batchSize = 5;
    for (let i = 0; i < models.length; i += batchSize) {
      const batch = models.slice(i, i + batchSize);
      const results = await Promise.all(batch.map(m => checkModelYear(m)));
      
      batch.forEach((model, index) => {
        if (results[index]) {
          availableModels.push(model);
        }
      });
    }

    setFilteredModels(availableModels);
    setFilteringModels(false);

    if (availableModels.length === 0 && models.length > 0) {
      toast({ 
        title: 'Atenção', 
        description: `Nenhum modelo disponível para o ano ${yearCode}`,
        variant: 'destructive'
      });
    }
  }, [vehicleType]);

  // Fetch anos específicos do modelo selecionado
  const fetchModelYears = useCallback(async (brandCode: string, modelCode: string) => {
    if (!brandCode || !modelCode) {
      setModelYears([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/${vehicleType}/marcas/${brandCode}/modelos/${modelCode}/anos`);
      if (!res.ok) throw new Error('Erro ao carregar anos');
      const data = await res.json();
      const rawYears = Array.isArray(data) ? data : [];
      setModelYears(filterValidYears(rawYears));
    } catch (e) {
      const msg = 'Erro ao carregar anos. Tente novamente.';
      setError(msg);
      toast({ title: 'Erro', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [vehicleType]);

  // Fetch resultado FIPE
  const fetchResult = useCallback(async (brandCode: string, modelCode: string, yearCode: string) => {
    if (!brandCode || !modelCode || !yearCode) {
      setResult(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/${vehicleType}/marcas/${brandCode}/modelos/${modelCode}/anos/${yearCode}`);
      if (!res.ok) throw new Error('Erro ao buscar valor FIPE');
      const data = await res.json();
      setResult(data);
    } catch (e) {
      const msg = 'Erro ao buscar valor FIPE. Tente novamente.';
      setError(msg);
      toast({ title: 'Erro', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [vehicleType]);

  // Carregar marcas ao iniciar ou mudar tipo
  useEffect(() => {
    resetSelections();
    fetchBrands();
  }, [vehicleType, fetchBrands, resetSelections]);

  // Carregar modelos e anos gerais quando selecionar marca
  useEffect(() => {
    if (selectedBrand) {
      setSelectedModel('');
      setSelectedYear('');
      setModelYears([]);
      setResult(null);
      fetchModels(selectedBrand);
    }
  }, [selectedBrand, fetchModels]);

  // Filtrar modelos quando o ano for selecionado (antes do modelo)
  useEffect(() => {
    if (selectedBrand && selectedYear && !selectedModel && allModels.length > 0) {
      filterModelsByYear(selectedBrand, selectedYear, allModels);
    } else if (!selectedYear && allModels.length > 0) {
      // Se o ano for limpo, mostrar todos os modelos novamente
      setFilteredModels(allModels);
    }
  }, [selectedYear, selectedBrand, selectedModel, allModels, filterModelsByYear]);

  // Carregar anos específicos quando selecionar modelo
  useEffect(() => {
    if (selectedModel) {
      setResult(null);
      fetchModelYears(selectedBrand, selectedModel);
    }
  }, [selectedModel, selectedBrand, fetchModelYears]);

  // Resetar validação quando modelo muda
  useEffect(() => {
    setYearValidated(false);
  }, [selectedModel]);

  // Validar ano selecionado quando anos específicos do modelo carregam
  useEffect(() => {
    if (selectedModel && modelYears.length > 0) {
      if (selectedYear) {
        const yearExists = modelYears.some(y => y.codigo === selectedYear);
        if (!yearExists) {
          // Ano pré-selecionado não disponível para este modelo
          setSelectedYear('');
          toast({ 
            title: 'Atenção', 
            description: 'O ano selecionado não está disponível para este modelo. Selecione outro ano.',
            variant: 'destructive'
          });
        } else {
          setYearValidated(true);
        }
      }
      // Se não há ano selecionado, marcar como validado (usuário vai selecionar)
      if (!selectedYear) {
        setYearValidated(true);
      }
    }
  }, [modelYears, selectedYear, selectedModel]);

  // Buscar resultado APENAS quando:
  // 1. Modelo e ano estiverem selecionados
  // 2. Anos do modelo já foram carregados
  // 3. O ano foi validado como disponível para o modelo
  useEffect(() => {
    if (selectedModel && selectedYear && yearValidated && modelYears.length > 0) {
      const yearValid = modelYears.some(y => y.codigo === selectedYear);
      if (yearValid) {
        fetchResult(selectedBrand, selectedModel, selectedYear);
      }
    }
  }, [selectedYear, selectedBrand, selectedModel, modelYears, yearValidated, fetchResult]);

  // Anos disponíveis: se modelo selecionado, usar modelYears; senão, usar years gerais
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
