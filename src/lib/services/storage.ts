import { BMIResult, InflationResult, TaxResult } from "@/types/calculator";

// Storage versioning for future migrations
const CURRENT_STORAGE_VERSION = 1;
const VERSION_KEY = 'calculator_storage_version';

export interface CalculationRecord {
  id: string;
  type: 'bmi' | 'tax' | 'inflation';
  date: string;
  inputs: Record<string, unknown>;
  result: BMIResult | TaxResult | InflationResult;
  isFavorite?: boolean;
}

export interface StorageService {
  getHistory(): CalculationRecord[];
  addToHistory(record: Omit<CalculationRecord, 'id' | 'date'>): void;
  toggleFavorite(id: string): void;
  clearHistory(): void;
  exportData(format: 'json' | 'csv' | 'pdf'): string | Promise<void>;
  importData(data: string): void;
  migrateData(): void;
}

class LocalStorageService implements StorageService {
  private readonly STORAGE_KEY = 'calculator_history';

  constructor() {
    // Only initialize if we're in browser environment
    if (typeof window !== 'undefined') {
      // Initialize storage if needed and run migrations
      this.migrateData();
      if (!this.getHistory()) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
      }
    }
  }

  getHistory(): CalculationRecord[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }
  addToHistory(record: Omit<CalculationRecord, 'id' | 'date'>): void {
    if (typeof window === 'undefined') return;
    
    const history = this.getHistory();
    const newRecord: CalculationRecord = {
      ...record,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };

    history.unshift(newRecord); // Add to beginning
    if (history.length > 100) { // Keep only last 100 records
      history.pop();
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
  }

  toggleFavorite(id: string): void {
    if (typeof window === 'undefined') return;
    
    const history = this.getHistory();
    const record = history.find(r => r.id === id);
    if (record) {
      record.isFavorite = !record.isFavorite;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    }
  }

  clearHistory(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
  }
  exportData(format: 'json' | 'csv' | 'pdf'): string | Promise<void> {
    const history = this.getHistory();
    
    if (format === 'json') {
      return JSON.stringify(history, null, 2);
    }

    if (format === 'csv') {
      if (history.length === 0) return '';

      const headers = ['Date', 'Type', 'Inputs', 'Result', 'Favorite'];
      const rows = history.map(record => [
        record.date,
        record.type,
        JSON.stringify(record.inputs),
        JSON.stringify(record.result),
        record.isFavorite ? 'Yes' : 'No'
      ]);

      return [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
    }

    if (format === 'pdf') {
      return this.exportToPDF(history);
    }

    return '';
  }

  private async exportToPDF(history: CalculationRecord[]): Promise<void> {
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text('Calculator History Export', 20, 20);
    
    // Current date
    doc.setFontSize(10);
    doc.text(`Exported on: ${new Date().toLocaleDateString()}`, 20, 30);
    
    let yPosition = 50;
    const pageHeight = doc.internal.pageSize.height;
    
    history.forEach((record, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Record header
      doc.setFontSize(12);
      doc.text(`${index + 1}. ${record.type.toUpperCase()} Calculation`, 20, yPosition);
      yPosition += 8;
      
      // Date
      doc.setFontSize(10);
      doc.text(`Date: ${new Date(record.date).toLocaleDateString()}`, 25, yPosition);
      yPosition += 6;
      
      // Inputs (simplified)
      const inputsSummary = Object.entries(record.inputs)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      doc.text(`Inputs: ${inputsSummary.substring(0, 80)}${inputsSummary.length > 80 ? '...' : ''}`, 25, yPosition);
      yPosition += 6;
      
      // Result summary
      const resultSummary = this.getResultSummary(record);
      doc.text(`Result: ${resultSummary}`, 25, yPosition);
      yPosition += 6;
      
      // Favorite indicator
      if (record.isFavorite) {
        doc.text('★ Favorite', 25, yPosition);
        yPosition += 6;
      }
      
      yPosition += 5; // Extra spacing between records
    });
    
    // Save the PDF
    doc.save('calculator-history.pdf');
  }

  private getResultSummary(record: CalculationRecord): string {
    switch (record.type) {
      case 'bmi':
        const bmiResult = record.result as BMIResult;
        return `BMI: ${bmiResult.bmi} (${bmiResult.category})`;
      case 'tax':
        const taxResult = record.result as TaxResult;
        return `Tax: ₦${taxResult.finalTax.toLocaleString()} (${(taxResult.effectiveRate * 100).toFixed(1)}%)`;
      case 'inflation':
        const inflationResult = record.result as InflationResult;
        return `${inflationResult.totalInflation.toFixed(1)}% total inflation`;
      default:
        return 'Unknown calculation';
    }
  }  importData(data: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      const records = JSON.parse(data) as CalculationRecord[];
      if (!Array.isArray(records)) throw new Error('Invalid data format');
      
      // Validate each record
      records.forEach(record => {
        if (!record.id || !record.type || !record.date || !record.inputs || !record.result) {
          throw new Error('Invalid record format');
        }
      });

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records));
      this.setStorageVersion(CURRENT_STORAGE_VERSION);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error('Failed to import data: ' + errorMessage);
    }
  }
  migrateData(): void {
    if (typeof window === 'undefined') return;
    
    const currentVersion = this.getStorageVersion();
    
    if (currentVersion < CURRENT_STORAGE_VERSION) {
      // Run migrations based on version differences
      this.runMigrations(currentVersion, CURRENT_STORAGE_VERSION);
      this.setStorageVersion(CURRENT_STORAGE_VERSION);
    }
  }

  private getStorageVersion(): number {
    if (typeof window === 'undefined') return CURRENT_STORAGE_VERSION;
    const version = localStorage.getItem(VERSION_KEY);
    return version ? parseInt(version, 10) : 0;
  }

  private setStorageVersion(version: number): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(VERSION_KEY, version.toString());
  }

  private runMigrations(fromVersion: number, toVersion: number): void {
    console.log(`Migrating calculator storage from version ${fromVersion} to ${toVersion}`);
    
    // Example migration logic for future versions
    if (fromVersion < 1) {
      // Migration from version 0 to 1
      // Add any necessary data transformations here
      const history = this.getHistory();
      const migratedHistory = history.map(record => ({
        ...record,
        // Add any new fields or transform existing ones
        isFavorite: record.isFavorite ?? false
      }));
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(migratedHistory));
    }
    
    // Future migrations can be added here
    // if (fromVersion < 2) {
    //   // Migration from version 1 to 2
    // }
  }
}

// Create a singleton instance
export const storageService = new LocalStorageService();
