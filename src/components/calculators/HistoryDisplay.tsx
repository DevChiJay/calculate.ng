import { CalculationRecord } from '@/lib/services/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, Star, Download, Upload, Trash2, FileDown, FileText } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { useCalculatorHistory } from '@/hooks/useCalculatorHistory';
import { useCallback, useRef, useState } from 'react';
import { BMIResult, TaxResult, InflationResult } from '@/types/calculator';

interface HistoryDisplayProps {
  calculatorType: 'bmi' | 'tax' | 'inflation';
  onSelect?: (record: CalculationRecord) => void;
}

export function HistoryDisplay({ calculatorType, onSelect }: HistoryDisplayProps) {
  const { history, favorites, toggleFavorite, clearHistory, exportData, importData } = useCalculatorHistory();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showFavorites, setShowFavorites] = useState(false);  const filteredHistory = useCallback((showFavorites: boolean) => {
    const records = showFavorites ? favorites : history;
    return records.filter((record: CalculationRecord) => record.type === calculatorType);
  }, [calculatorType, favorites, history]);

  const currentRecords = filteredHistory(showFavorites);
  const favoriteCount = favorites.filter(r => r.type === calculatorType).length;
  const handleExport = async (format: 'json' | 'csv' | 'pdf') => {
    if (format === 'pdf') {
      // PDF export is handled directly by the service
      await exportData(format);
      return;
    }
    
    const data = exportData(format) as string;
    const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calculator-history.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        if (typeof reader.result === 'string') {
          importData(reader.result);
        }
      } catch {
        alert('Failed to import data: Invalid format');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          <History className="inline-block w-4 h-4 mr-2" />
          Calculation History
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            title="Import History"
          >
            <Upload className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleExport('json')}
            title="Export as JSON"
          >
            <Download className="h-4 w-4" />
          </Button>          <Button
            variant="outline"
            size="icon"
            onClick={() => handleExport('csv')}
            title="Export as CSV"
          >
            <FileDown className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleExport('pdf')}
            title="Export as PDF"
          >
            <FileText className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={clearHistory}
            className="text-destructive"
            title="Clear History"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>      <CardContent>
        <div className="mb-4 flex gap-2">
          <Button
            variant={!showFavorites ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFavorites(false)}
          >
            All History ({filteredHistory(false).length})
          </Button>
          <Button
            variant={showFavorites ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFavorites(true)}
          >
            <Star className="h-4 w-4 mr-1" />
            Favorites ({favoriteCount})
          </Button>
        </div>
        
        <div className="space-y-2">
          {currentRecords.map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-accent cursor-pointer"
              onClick={() => onSelect?.(record)}
            >
              <div className="flex-1">
                <div className="text-sm font-medium">
                  {formatDateTime(new Date(record.date))}
                </div>
                <div className="text-xs text-muted-foreground">
                  {getHistoryItemSummary(record)}
                </div>
              </div>              <Button
                variant="ghost"
                size="icon"
                className={record.isFavorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(record.id);
                }}
                title={record.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star className={`h-4 w-4 ${record.isFavorite ? 'fill-current' : ''}`} />
              </Button>
            </div>
          ))}          {currentRecords.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-4">
              {showFavorites 
                ? 'No favorite calculations yet. Click the star icon to bookmark calculations.' 
                : 'No calculation history yet'
              }
            </div>
          )}
        </div>
      </CardContent>
      <input
        type="file"
        accept=".json,.csv"
        className="hidden"
        ref={fileInputRef}
        onChange={handleImport}
      />
    </Card>
  );
}

function getHistoryItemSummary(record: CalculationRecord): string {
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
}

// Remove the duplicate formatDateTime function since it's now in utils.ts
