import { useCallback, useEffect, useState } from 'react';
import { storageService, CalculationRecord } from '@/lib/services/storage';

export function useCalculatorHistory() {
  const [history, setHistory] = useState<CalculationRecord[]>([]);
  const [favorites, setFavorites] = useState<CalculationRecord[]>([]);

  // Load history from storage
  useEffect(() => {
    const loadHistory = () => {
      const records = storageService.getHistory();
      setHistory(records);
      setFavorites(records.filter(r => r.isFavorite));
    };

    loadHistory();
    // Listen for storage changes from other tabs
    window.addEventListener('storage', loadHistory);
    return () => window.removeEventListener('storage', loadHistory);
  }, []);
  const addRecord = useCallback(<T extends BMIResult | TaxResult | InflationResult>(
    type: 'bmi' | 'tax' | 'inflation',
    inputs: Record<string, unknown>,
    result: T
  ) => {
    storageService.addToHistory({ type, inputs, result });
    setHistory(storageService.getHistory());
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    storageService.toggleFavorite(id);
    const records = storageService.getHistory();
    setHistory(records);
    setFavorites(records.filter(r => r.isFavorite));
  }, []);

  const clearHistory = useCallback(() => {
    storageService.clearHistory();
    setHistory([]);
    setFavorites([]);
  }, []);
  const exportData = useCallback((format: 'json' | 'csv' | 'pdf') => {
    return storageService.exportData(format);
  }, []);

  const importData = useCallback((data: string) => {
    try {
      storageService.importData(data);
      const records = storageService.getHistory();
      setHistory(records);
      setFavorites(records.filter(r => r.isFavorite));
    } catch (error) {
      throw error;
    }
  }, []);

  return {
    history,
    favorites,
    addRecord,
    toggleFavorite,
    clearHistory,
    exportData,
    importData
  };
}

import { BMIResult, InflationResult, TaxResult } from '@/types/calculator';
