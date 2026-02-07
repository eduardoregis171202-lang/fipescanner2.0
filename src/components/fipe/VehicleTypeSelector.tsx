import { Car, Bike, Truck } from 'lucide-react';
import { VehicleType } from '@/lib/constants';

interface VehicleTypeSelectorProps {
  value: VehicleType;
  onChange: (type: VehicleType) => void;
}

export function VehicleTypeSelector({ value, onChange }: VehicleTypeSelectorProps) {
  const types: { type: VehicleType; label: string; icon: React.ReactNode }[] = [
    { type: 'carros', label: 'Carros', icon: <Car size={16} /> },
    { type: 'motos', label: 'Motos', icon: <Bike size={16} /> },
    { type: 'caminhoes', label: 'Caminhões', icon: <Truck size={16} /> }
  ];

  return (
    <div className="flex gap-2">
      {types.map(({ type, label, icon }) => (
        <button
          key={type}
          onClick={() => onChange(type)}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold transition-all ${
            value === type
              ? 'bg-primary text-primary-foreground border-primary shadow-lg'
              : 'bg-card text-muted-foreground border-border hover:border-primary/50'
          }`}
        >
          {icon}
          {label}
        </button>
      ))}
    </div>
  );
}
