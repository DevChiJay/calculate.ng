import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { ThemedCalculatorPage } from '@/components/layout/themed-calculator-page';
import { ToastProvider } from '@/components/ui/toast';

// Lazy load the calculator component
const EnhancedInflationCalculator = dynamic(
  () => import('@/components/calculators/EnhancedInflationCalculator'),
  { 
    loading: () => (
      <div className="space-y-8 max-w-3xl mx-auto p-6">
        {/* Header Skeleton */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-8 w-64 bg-muted/50 rounded-md animate-pulse mx-auto"></div>
            <div className="h-4 w-96 max-w-full bg-muted/40 rounded-md animate-pulse mx-auto"></div>
          </div>
        </div>
        
        {/* Chart Skeleton */}
        <div className="border rounded-lg p-6 bg-card shadow-sm animate-pulse">
          <div className="space-y-6">
            <div className="h-60 w-full bg-muted/30 rounded-md"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="h-5 w-24 bg-muted/50 rounded-md"></div>
                <div className="h-10 w-full bg-muted/40 rounded-md"></div>
              </div>
              <div className="space-y-2">
                <div className="h-5 w-24 bg-muted/50 rounded-md"></div>
                <div className="h-10 w-full bg-muted/40 rounded-md"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
);

export const metadata: Metadata = {
  title: 'Nigerian Inflation Calculator | Calculate.ng',
  description: 'Calculate the impact of inflation on your money using Consumer Price Index (CPI) data from the Nigerian Bureau of Statistics. See how inflation affects purchasing power over time.',
  keywords: ['inflation calculator', 'Nigeria CPI', 'purchasing power', 'consumer price index', 'economic indicators', 'financial planning']
};

export default function InflationCalculatorPage() {
  return (
    <ToastProvider>
      <ThemedCalculatorPage
        theme="inflation"
        title="Nigerian Inflation Calculator"
        description="Understand how inflation impacts your purchasing power using official Consumer Price Index (CPI) data. Calculate what your money would be worth today and make informed financial decisions."
      >
        <EnhancedInflationCalculator />
      </ThemedCalculatorPage>
    </ToastProvider>
  );
}
