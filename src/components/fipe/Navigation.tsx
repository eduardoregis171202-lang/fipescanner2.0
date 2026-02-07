import { Car, Search } from 'lucide-react';
import { TabType } from '@/lib/constants';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'evaluator', label: 'FIPE', icon: <Car size={20} /> },
    { id: 'detran', label: 'DETRAN', icon: <Search size={20} /> }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-card/95 backdrop-blur-md border-t border-border px-4 py-3 flex gap-2 z-40 shadow-2xl">
      {tabs.map(({ id, label, icon }) => (
        <button
          key={id}
          onClick={() => setActiveTab(id)}
          className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl transition-all text-[10px] font-bold uppercase tracking-wide ${
            activeTab === id 
              ? 'bg-primary text-primary-foreground shadow-lg' 
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          {icon}
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
