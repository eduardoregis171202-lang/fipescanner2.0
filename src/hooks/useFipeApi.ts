import { useState, useEffect, useCallback } from 'react';
import { API_BASE, Brand, Model, Year, FipeResult, VehicleType } from '@/lib/constants';
import { toast } from '@/hooks/use-toast';

export function useFipeApi(vehicleType: VehicleType) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [years, setYears] = useState<Year[]>([]);
  const [result, setResult] = useState<FipeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  // Reset quando muda tipo de veículo
  const resetSelections = useCallback(() => {
    setSelectedBrand('');
    setSelectedModel('');
    setSelectedYear('');
    setModels([]);
    setYears([]);
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

  // Fetch modelos
  const fetchModels = useCallback(async (brandCode: string) => {
    if (!brandCode) {
      setModels([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/${vehicleType}/marcas/${brandCode}/modelos`);
      if (!res.ok) throw new Error('Erro ao carregar modelos');
      const data = await res.json();
      setModels(data.modelos || []);
    } catch (e) {
      const msg = 'Erro ao carregar modelos. Tente novamente.';
      setError(msg);
      toast({ title: 'Erro', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [vehicleType]);

  // Fetch anos
  const fetchYears = useCallback(async (brandCode: string, modelCode: string) => {
    if (!brandCode || !modelCode) {
      setYears([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/${vehicleType}/marcas/${brandCode}/modelos/${modelCode}/anos`);
      if (!res.ok) throw new Error('Erro ao carregar anos');
      const data = await res.json();
      setYears(Array.isArray(data) ? data : []);
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

  // Carregar modelos quando selecionar marca
  useEffect(() => {
    if (selectedBrand) {
      setSelectedModel('');
      setSelectedYear('');
      setYears([]);
      setResult(null);
      fetchModels(selectedBrand);
    }
  }, [selectedBrand, fetchModels]);

  // Carregar anos quando selecionar modelo
  useEffect(() => {
    if (selectedModel) {
      setSelectedYear('');
      setResult(null);
      fetchYears(selectedBrand, selectedModel);
    }
  }, [selectedModel, selectedBrand, fetchYears]);

  // Buscar resultado quando selecionar ano
  useEffect(() => {
    if (selectedYear) {
      fetchResult(selectedBrand, selectedModel, selectedYear);
    }
  }, [selectedYear, selectedBrand, selectedModel, fetchResult]);

  return {
    brands,
    models,
    years,
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
