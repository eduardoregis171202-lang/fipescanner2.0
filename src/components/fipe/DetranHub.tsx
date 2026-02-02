import { useState, useEffect, useCallback } from 'react';
import { Search, CheckCircle2, Globe, ArrowRight, Loader2, History, Zap, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePlateDetection } from '@/hooks/usePlateDetection';
import { useDebounce } from '@/hooks/useDebounce';
import { DETRAN_URLS, HistoryItem } from '@/lib/constants';
import { DocumentChecklist } from './DocumentChecklist';

interface DetranHubProps {
  history: HistoryItem[];
  onHistoryUpdate: (items: HistoryItem[]) => void;
}

export function DetranHub({ history, onHistoryUpdate }: DetranHubProps) {
  const { plate, detectedUf, handlePlateChange, setUf, isComplete } = usePlateDetection();
  const [autoRedirecting, setAutoRedirecting] = useState(false);
  const [webViewUrl, setWebViewUrl] = useState<string | null>(null);
  
  const debouncedPlate = useDebounce(plate, 300);

  // Auto-redirect quando placa completa
  useEffect(() => {
    if (debouncedPlate.length === 7 && detectedUf) {
      setAutoRedirecting(true);
      const timer = setTimeout(() => {
        executeDetranSearch(debouncedPlate, detectedUf);
        setAutoRedirecting(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [debouncedPlate, detectedUf]);

  const executeDetranSearch = useCallback((targetPlate: string = plate, targetUf: string = detectedUf) => {
    if (!targetUf || targetPlate.length < 7) return;
    
    const newHistory: HistoryItem[] = [
      { plate: targetPlate, uf: targetUf, timestamp: Date.now() },
      ...history.filter(h => h.plate !== targetPlate)
    ].slice(0, 5);
    
    onHistoryUpdate(newHistory);
    setWebViewUrl(DETRAN_URLS[targetUf]);
  }, [plate, detectedUf, history, onHistoryUpdate]);

  const handleHistoryClick = (item: HistoryItem) => {
    handlePlateChange(item.plate);
    setUf(item.uf);
  };

  const allUFs = Object.keys(DETRAN_URLS).sort();

  return (
    <div className="p-4 space-y-6 animate-fade-in">
      <Card className="border-border shadow-xl">
        <CardContent className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Search size={20} className="text-primary" />
              Detran Hub
            </h2>
            {detectedUf && (
              <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
                <CheckCircle2 size={12} className="text-primary" />
                <span className="text-primary text-[11px] font-extrabold tracking-tighter uppercase">
                  {detectedUf} detectado
                </span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={plate}
                onChange={(e) => handlePlateChange(e.target.value)}
                placeholder="ABC1D23"
                maxLength={7}
                className={`plate-input ${isComplete ? 'valid' : ''}`}
              />
              {autoRedirecting && (
                <div className="absolute inset-0 bg-card/70 backdrop-blur-sm rounded-2xl flex items-center justify-center gap-3">
                  <div className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-full shadow-lg">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-xs font-bold uppercase tracking-widest">Aguarde...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <select
                value={detectedUf}
                onChange={(e) => setUf(e.target.value)}
                className="w-full bg-card border border-border rounded-xl px-4 py-4 text-sm font-bold text-foreground shadow-sm outline-none focus:border-primary transition-colors"
              >
                <option value="">Selecione o Estado (UF)...</option>
                {allUFs.map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>

              <Button
                disabled={!isComplete || !detectedUf}
                onClick={() => executeDetranSearch()}
                className="w-full py-6 rounded-2xl font-black text-sm uppercase tracking-widest gap-3"
              >
                <Globe size={20} />
                Consultar {detectedUf || 'UF'}
                <ArrowRight size={20} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History */}
      {history.length > 0 && (
        <div className="space-y-3 animate-fade-in">
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1 flex items-center gap-2">
            <History size={12} />
            Consultas Recentes
          </h3>
          <div className="space-y-2">
            {history.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleHistoryClick(item)}
                className="w-full bg-card p-4 rounded-2xl border border-border flex justify-between items-center group shadow-sm hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-primary font-black text-sm border border-border shadow-inner">
                    {item.uf}
                  </div>
                  <span className="font-mono font-bold text-foreground text-xl tracking-wider uppercase">
                    {item.plate}
                  </span>
                </div>
                <Zap size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Document Checklist */}
      <DocumentChecklist />

      {/* Empty State */}
      {history.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Search className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-sm font-medium">
            Digite a placa do veículo para consultar
          </p>
        </div>
      )}

      {/* WebView Modal */}
      {webViewUrl && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-xl animate-fade-in">
          <div className="px-5 py-6 flex items-center justify-between bg-card border-b border-border">
            <button
              onClick={() => setWebViewUrl(null)}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <X size={28} className="text-foreground" />
            </button>
            <span className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2 text-accent">
              <ShieldCheck size={16} />
              Ligação Segura Detran
            </span>
            <div className="w-10"></div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <Card className="shadow-2xl max-w-xs w-full">
              <CardContent className="p-10 space-y-8">
                <div className="w-24 h-24 bg-primary text-primary-foreground rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl">
                  <Globe size={48} />
                </div>
                <div className="space-y-3 text-center">
                  <h3 className="font-black text-foreground text-2xl tracking-tight uppercase">
                    Detran {detectedUf}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                    Abrindo o portal oficial para a placa{' '}
                    <strong className="text-primary">{plate}</strong>.
                  </p>
                </div>
                <div className="space-y-4">
                  <a
                    href={webViewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-primary text-primary-foreground py-5 rounded-2xl font-black text-sm uppercase text-center tracking-widest hover:opacity-90 transition-opacity"
                  >
                    Entrar no Portal
                  </a>
                  <Button
                    onClick={() => setWebViewUrl(null)}
                    variant="ghost"
                    className="w-full text-[11px] font-black text-muted-foreground uppercase tracking-widest"
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
