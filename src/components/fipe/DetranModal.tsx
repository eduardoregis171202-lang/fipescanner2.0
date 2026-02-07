import { Globe, X } from 'lucide-react';
import { DETRAN_URLS } from '@/lib/constants';

interface DetranModalProps {
  plate: string;
  uf: string;
  onClose: () => void;
}

export function DetranModal({ plate, uf, onClose }: DetranModalProps) {
  const portalUrl = DETRAN_URLS[uf];

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-md z-50 flex flex-col animate-fade-in">
      <header className="p-6 flex items-center justify-between bg-card border-b border-border">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full flex items-center justify-center text-foreground hover:bg-muted transition-colors"
        >
          <X size={24} />
        </button>
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent flex items-center gap-2">
          🛡️ Ligação Segura Detran
        </span>
        <div className="w-10" />
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-primary text-primary-foreground rounded-3xl flex items-center justify-center text-5xl mb-6 shadow-2xl">
          <Globe size={48} />
        </div>

        <h2 className="text-2xl font-black text-foreground uppercase mb-2">
          Detran {uf}
        </h2>

        <p className="text-sm text-muted-foreground mb-8">
          Abrindo o portal oficial para a placa{' '}
          <strong className="text-primary">{plate}</strong>.
        </p>

        <a
          href={portalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full max-w-xs py-5 rounded-2xl bg-primary text-primary-foreground font-extrabold text-sm uppercase tracking-widest text-center block mb-4 hover:opacity-90 transition-opacity"
        >
          Entrar no Portal
        </a>

        <button
          onClick={onClose}
          className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
