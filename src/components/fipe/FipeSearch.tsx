import { useState } from 'react';
import { Search, Gauge } from 'lucide-react';
import { FipeConsulta } from './FipeConsulta';
import { FipeAvaliador } from './FipeAvaliador';
import { FipeHistoryItem } from '@/lib/constants';

type FipeTab = 'consulta' | 'avaliador';

interface FipeSearchProps {
  onSaveToHistory?: (item: FipeHistoryItem) => void;
  history?: FipeHistoryItem[];
  onClearHistory?: () => void;
  onAddToCompare?: (item: FipeHistoryItem) => void;
  compareList?: FipeHistoryItem[];
}

export function FipeSearch({
  onSaveToHistory,
  history,
  onClearHistory,
  onAddToCompare,
  compareList
}: FipeSearchProps) {
  const [activeTab, setActiveTab] = useState<FipeTab>('consulta');

  const tabs: { id: FipeTab; label: string; icon: React.ReactNode }[] = [
    { id: 'consulta', label: 'Consulta', icon: <Search size={18} /> },
    { id: 'avaliador', label: 'Avaliador', icon: <Gauge size={18} /> }
  ];

  return (
    <div className="p-4">
      {/* Internal Navigation */}
      <div className="flex gap-2 mb-6">
        {tabs.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
              activeTab === id
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'bg-card text-muted-foreground border border-border hover:border-primary/50'
            }`}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'consulta' ? (
        <FipeConsulta />
      ) : (
        <FipeAvaliador />
      )}
    </div>
  );
}
