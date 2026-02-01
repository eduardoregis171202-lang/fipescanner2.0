import { Car, Navigation as NavIcon } from 'lucide-react';

type TabType = 'evaluator' | 'search';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'evaluator', label: 'Avaliador', icon: <Car size={24} /> },
    { id: 'search', label: 'Consultas', icon: <NavIcon size={24} /> }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-card/95 backdrop-blur-md border-t border-border h-22 flex items-center justify-around z-30 shadow-2xl pb-4">
      {tabs.map(({ id, label, icon }) => (
        <button
          key={id}
          onClick={() => setActiveTab(id)}
          className={`flex flex-col items-center gap-1.5 transition-all ${
            activeTab === id ? 'text-primary scale-105' : 'text-muted-foreground'
          }`}
        >
          <div className={`p-2.5 rounded-2xl ${
            activeTab === id ? 'bg-primary/10 shadow-sm' : ''
          }`}>
            {icon}
          </div>
          <span className="text-[10px] font-black uppercase tracking-tighter">
            {label}
          </span>
        </button>
      ))}
    </nav>
  );
}
