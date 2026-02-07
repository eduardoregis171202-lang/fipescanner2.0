import { useState, useEffect, useCallback } from 'react';
import { API_BASE, Brand, Model, Year, FipeResult, VehicleType } from '@/lib/constants';
import { toast } from '@/hooks/use-toast';

export function useFipeApi(vehicleType: VehicleType) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [years, setYears] = useState<Year[]>([]); // Anos gerais da marca
  const [modelYears, setModelYears] = useState<Year[]>([]); // Anos específicos do modelo
  const [result, setResult] = useState<FipeResult | null>(null);
  const [loading, setLoading] = useState(false);
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
    setModels([]);
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
      setModels([]);
      setYears([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/${vehicleType}/marcas/${brandCode}/modelos`);
      if (!res.ok) throw new Error('Erro ao carregar modelos');
      const data = await res.json();
      setModels(data.modelos || []);
      // A API retorna anos disponíveis para a marca também
      setYears(Array.isArray(data.anos) ? data.anos : []);
    } catch (e) {
      const msg = 'Erro ao carregar modelos. Tente novamente.';
      setError(msg);
      toast({ title: 'Erro', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
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
      setModelYears(Array.isArray(data) ? data : []);
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
    models,
    years: availableYears,
    result,
    loading,
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
