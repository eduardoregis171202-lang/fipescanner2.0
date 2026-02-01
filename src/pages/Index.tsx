import { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/fipe/Header';
import { Navigation } from '@/components/fipe/Navigation';
import { FipeEvaluator } from '@/components/fipe/FipeEvaluator';
import { DetranHub } from '@/components/fipe/DetranHub';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { HistoryItem, FipeHistoryItem } from '@/lib/constants';

type TabType = 'evaluator' | 'search';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>('evaluator');
  const { isDark, toggle: toggleDark } = useDarkMode();
  const isOnline = useOnlineStatus();

  // Detran History
  const [detranHistory, setDetranHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('detran_history');
    return saved ? JSON.parse(saved) : [];
  });

  // FIPE History
  const [fipeHistory, setFipeHistory] = useState<FipeHistoryItem[]>(() => {
    const saved = localStorage.getItem('fipe_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Track last saved FIPE result to avoid duplicates
  const lastSavedFipe = useRef<string | null>(null);

  // Persist Detran history
  useEffect(() => {
    localStorage.setItem('detran_history', JSON.stringify(detranHistory));
  }, [detranHistory]);

  // Persist FIPE history
  useEffect(() => {
    localStorage.setItem('fipe_history', JSON.stringify(fipeHistory));
  }, [fipeHistory]);

  const handleDetranHistoryUpdate = (items: HistoryItem[]) => {
    setDetranHistory(items);
  };

  const handleFipeSave = (item: FipeHistoryItem) => {
    // Avoid duplicate saves
    const key = `${item.codigoFipe}-${item.year}`;
    if (lastSavedFipe.current === key) return;
    lastSavedFipe.current = key;

    setFipeHistory(prev => {
      const filtered = prev.filter(h => 
        !(h.codigoFipe === item.codigoFipe && h.year === item.year)
      );
      return [item, ...filtered].slice(0, 10);
    });
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background text-foreground shadow-2xl relative overflow-hidden">
      <Header isDark={isDark} toggleDark={toggleDark} isOnline={isOnline} />

      <main className="flex-1 overflow-y-auto pb-24 hide-scrollbar">
        {activeTab === 'evaluator' ? (
          <FipeEvaluator onSaveToHistory={handleFipeSave} />
        ) : (
          <DetranHub
            history={detranHistory}
            onHistoryUpdate={handleDetranHistoryUpdate}
          />
        )}
      </main>

      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default Index;
