import { useState, useCallback } from 'react';
import { PLATE_RANGES } from '@/lib/constants';

export function usePlateDetection() {
  const [plate, setPlate] = useState('');
  const [detectedUf, setDetectedUf] = useState('');

  const handlePlateChange = useCallback((value: string) => {
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
    setPlate(cleaned);

    if (cleaned.length >= 3) {
      const prefix = cleaned.substring(0, 3);
      const match = PLATE_RANGES.find(r => prefix >= r.start && prefix <= r.end);
      if (match) {
        setDetectedUf(match.uf);
      } else {
        setDetectedUf('');
      }
    } else {
      setDetectedUf('');
    }
  }, []);

  const setUf = useCallback((uf: string) => {
    setDetectedUf(uf);
  }, []);

  const reset = useCallback(() => {
    setPlate('');
    setDetectedUf('');
  }, []);

  return {
    plate,
    detectedUf,
    handlePlateChange,
    setUf,
    reset,
    isComplete: plate.length === 7
  };
}
