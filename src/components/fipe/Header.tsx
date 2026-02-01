import { Smartphone, Moon, Sun, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  isDark: boolean;
  toggleDark: () => void;
  isOnline: boolean;
}

export function Header({ isDark, toggleDark, isOnline }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border px-4 py-4 flex items-center justify-between z-10">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg">
          <Smartphone size={18} className="text-primary-foreground" />
        </div>
        <h1 className="font-bold text-xl text-foreground tracking-tight">
          Fipe<span className="text-primary underline decoration-accent">Scanner</span>
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Online Status */}
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${
          isOnline 
            ? 'bg-accent/10 text-accent' 
            : 'bg-destructive/10 text-destructive'
        }`}>
          {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
          <span className="uppercase">{isOnline ? 'Online' : 'Offline'}</span>
        </div>

        {/* Dark Mode Toggle */}
        <Button
          onClick={toggleDark}
          variant="ghost"
          size="icon"
          className="rounded-full"
        >
          {isDark ? (
            <Sun size={20} className="text-accent" />
          ) : (
            <Moon size={20} className="text-muted-foreground" />
          )}
        </Button>
      </div>
    </header>
  );
}
