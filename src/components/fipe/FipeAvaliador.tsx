import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { VehicleType, API_BASE, Brand, Model, Year, FipeResult, formatCurrencyInput, parseCurrency } from '@/lib/constants';
import { DealGauge } from './DealGauge';
import { toast } from '@/hooks/use-toast';

export function FipeAvaliador() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [years, setYears] = useState<Year[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [fipeValue, setFipeValue] = useState<number | null>(null);
  const [fipeDisplay, setFipeDisplay] = useState('');
  const [askingPrice, setAskingPrice] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [ratio, setRatio] = useState(1);

  // Fetch with failover
  const fetchWithFailover = async (endpoint: string) => {
    const v1Url = `${API_BASE}/${endpoint}`;
    
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      
      const res = await fetch(v1Url, { signal: controller.signal });
      clearTimeout(timeout);
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      // Fallback to v2
      const v2Url = `https://parallelum.com.br/fipe/api/v2/${endpoint}`;
      const res = await fetch(v2Url);
      if (!res.ok) throw new Error(`v2 failed`);
      return await res.json();
    }
  };

  // Fetch brands on mount
  useEffect(() => {
    async function fetchBrands() {
      try {
        const data = await fetchWithFailover('carros/marcas');
        setBrands(Array.isArray(data) ? data : []);
      } catch {
        toast({ title: 'Erro ao carregar marcas', variant: 'destructive' });
      }
    }
    fetchBrands();
  }, []);

  // Fetch models
  useEffect(() => {
    if (!selectedBrand) {
      setModels([]);
      setSelectedModel('');
      return;
    }

    async function fetchModels() {
      setLoading(true);
      try {
        const data = await fetchWithFailover(`carros/marcas/${selectedBrand}/modelos`);
        setModels(Array.isArray(data?.modelos) ? data.modelos : []);
      } catch {
        toast({ title: 'Erro ao carregar modelos', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    fetchModels();
  }, [selectedBrand]);

  // Fetch years
  useEffect(() => {
    if (!selectedModel) {
      setYears([]);
      setSelectedYear('');
      return;
    }

    async function fetchYears() {
      setLoading(true);
      try {
        const data = await fetchWithFailover(
          `carros/marcas/${selectedBrand}/modelos/${selectedModel}/anos`
        );
        setYears(Array.isArray(data) ? data : []);
      } catch {
        toast({ title: 'Erro ao carregar anos', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    fetchYears();
  }, [selectedModel, selectedBrand]);

  // Fetch FIPE value when year is selected
  useEffect(() => {
    if (!selectedYear) {
      setFipeValue(null);
      setFipeDisplay('');
      return;
    }

    async function fetchFipe() {
      setLoading(true);
      try {
        const data = await fetchWithFailover(
          `carros/marcas/${selectedBrand}/modelos/${selectedModel}/anos/${selectedYear}`
        );
        const valor = data.Valor || data.price || '';
        setFipeDisplay(valor);
        setFipeValue(parseCurrency(valor));
      } catch {
        toast({ title: 'Erro ao obter valor FIPE', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    fetchFipe();
  }, [selectedYear, selectedBrand, selectedModel]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    setAskingPrice(formatted);
  };

  const analyzeDeal = useCallback(() => {
    if (!fipeValue || !askingPrice) {
      toast({ title: 'Informe o preço do anúncio', variant: 'destructive' });
      return;
    }

    const price = parseCurrency(askingPrice);
    const dealRatio = price / fipeValue;
    setRatio(dealRatio);
    setShowResult(true);
  }, [fipeValue, askingPrice]);

  const whatsappMessage = () => {
    if (ratio < 0.75) return 'Suspeita%20de%20Golpe';
    if (ratio <= 0.92) return 'Quero%20Avaliar%20Mecanica';
    return 'Ajuda%20Negociacao';
  };

  const isStep2Enabled = fipeValue !== null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-1">Avaliador</h2>
        <p className="text-sm text-muted-foreground">Oportunidade ou Golpe? Analise agora.</p>
      </div>

      {/* Card de Input */}
      <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
        {/* Passo 1 */}
        <div className="space-y-4">
          <p className="text-xs font-bold text-primary uppercase tracking-wide mb-2 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">1</span>
            Veículo de Referência
          </p>
          
          <div className="grid grid-cols-1 gap-3">
            {/* Brand */}
            <div className="relative">
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full p-3 rounded-lg bg-muted/50 border border-border text-sm appearance-none font-medium transition focus:border-primary focus:outline-none"
              >
                <option value="">Selecione a Marca</option>
                {brands.map((b) => (
                  <option key={b.codigo} value={b.codigo}>{b.nome}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
            </div>

            {/* Model */}
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={!selectedBrand || !models.length}
                className="w-full p-3 rounded-lg bg-muted/50 border border-border text-sm appearance-none font-medium transition focus:border-primary focus:outline-none disabled:opacity-50"
              >
                <option value="">
                  {loading && selectedBrand ? 'Carregando...' : 'Selecione o Modelo'}
                </option>
                {models.map((m) => (
                  <option key={m.codigo} value={String(m.codigo)}>{m.nome}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
            </div>

            {/* Year */}
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                disabled={!selectedModel || !years.length}
                className="w-full p-3 rounded-lg bg-muted/50 border border-border text-sm appearance-none font-medium transition focus:border-primary focus:outline-none disabled:opacity-50"
              >
                <option value="">
                  {loading && selectedModel ? 'Carregando...' : 'Selecione o Ano'}
                </option>
                {years.map((y) => (
                  <option key={y.codigo} value={y.codigo}>{y.nome}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        {/* Passo 2 */}
        <div className={`mt-8 pt-6 border-t border-border transition-all duration-300 ${
          isStep2Enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'
        }`}>
          <p className="text-xs font-bold text-primary uppercase tracking-wide mb-4 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">2</span>
            Preço do Anúncio
          </p>
          
          <div className="space-y-4">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">R$</span>
              <input
                type="text"
                inputMode="numeric"
                value={askingPrice}
                onChange={handlePriceChange}
                placeholder="0,00"
                className="w-full pl-10 p-3 rounded-xl bg-muted/50 border border-border font-mono text-lg font-bold transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            
            <button
              onClick={analyzeDeal}
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl shadow-lg transition transform active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin mx-auto" size={20} />
              ) : (
                'Analisar Oportunidade'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Result */}
      {showResult && (
        <div className="bg-card p-8 rounded-2xl shadow-sm border border-border text-center animate-fade-in">
          <DealGauge ratio={ratio} />
          
          <div className="bg-muted/50 p-4 rounded-xl border border-border mb-6">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              Referência Fipe
            </p>
            <p className="text-xl font-bold">{fipeDisplay}</p>
          </div>

          <a
            href={`https://wa.me/5589994171877?text=${whatsappMessage()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2 transform active:scale-95"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Contratar Suporte Técnico
          </a>
        </div>
      )}
    </div>
  );
}
