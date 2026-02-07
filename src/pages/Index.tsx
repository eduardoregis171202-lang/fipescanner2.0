import { useState, useEffect } from 'react';
import { Header } from '@/components/fipe/Header';
import { Navigation } from '@/components/fipe/Navigation';
import { FipeSearch } from '@/components/fipe/FipeSearch';
import { DetranHub } from '@/components/fipe/DetranHub';
import { CompareBar } from '@/components/fipe/CompareBar';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { TabType, FipeHistoryItem, DetranHistoryItem } from '@/lib/constants';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>('evaluator');
  const { isDark, toggle: toggleDark } = useDarkMode();
  const isOnline = useOnlineStatus();

  // FIPE History
  const [fipeHistory, setFipeHistory] = useState<FipeHistoryItem[]>(() => {
    const saved = localStorage.getItem('fipe_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Detran History
  const [detranHistory, setDetranHistory] = useState<DetranHistoryItem[]>(() => {
    const saved = localStorage.getItem('detran_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Compare List
  const [compareList, setCompareList] = useState<FipeHistoryItem[]>(() => {
    const saved = localStorage.getItem('compare_list');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist FIPE history
  useEffect(() => {
    localStorage.setItem('fipe_history', JSON.stringify(fipeHistory));
  }, [fipeHistory]);

  // Persist Detran history
  useEffect(() => {
    localStorage.setItem('detran_history', JSON.stringify(detranHistory));
  }, [detranHistory]);

  // Persist Compare list
  useEffect(() => {
    localStorage.setItem('compare_list', JSON.stringify(compareList));
  }, [compareList]);

  const handleFipeSave = (item: FipeHistoryItem) => {
    setFipeHistory(prev => {
      const filtered = prev.filter(h => 
        !(h.codigoFipe === item.codigoFipe && h.year === item.year)
      );
      return [item, ...filtered].slice(0, 10);
    });
  };

  const handleClearFipeHistory = () => {
    setFipeHistory([]);
  };

  const handleDetranHistoryUpdate = (items: DetranHistoryItem[]) => {
    setDetranHistory(items);
  };

  const handleAddToCompare = (item: FipeHistoryItem) => {
    setCompareList(prev => {
      const exists = prev.some(c => 
        c.codigoFipe === item.codigoFipe && c.year === item.year
      );
      if (exists || prev.length >= 3) return prev;
      return [...prev, item];
    });
  };

  const handleRemoveFromCompare = (index: number) => {
    setCompareList(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearCompare = () => {
    setCompareList([]);
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background text-foreground shadow-2xl relative overflow-hidden">
      <Header isDark={isDark} toggleDark={toggleDark} isOnline={isOnline} />

      <main className="flex-1 overflow-y-auto pb-24 hide-scrollbar">
        {activeTab === 'evaluator' ? (
          <FipeSearch 
            onSaveToHistory={handleFipeSave}
            history={fipeHistory}
            onClearHistory={handleClearFipeHistory}
            onAddToCompare={handleAddToCompare}
            compareList={compareList}
          />
        ) : (
          <DetranHub
            history={detranHistory}
            onHistoryUpdate={handleDetranHistoryUpdate}
          />
        )}
      </main>

      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <CompareBar
        items={compareList}
        onRemove={handleRemoveFromCompare}
        onClear={handleClearCompare}
      />
    </div>
  );
};

export default Index;
