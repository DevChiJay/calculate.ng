import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { ThemedCalculatorPage } from '@/components/layout/themed-calculator-page';
import { ToastProvider } from '@/components/ui/toast';

// Lazy load the calculator component
const EnhancedTaxCalculator = dynamic(
  () => import('@/components/calculators/EnhancedTaxCalculator'),
  { 
    loading: () => (
      <div className="space-y-8 max-w-3xl mx-auto p-6">
        {/* Header Skeleton */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-8 w-56 bg-muted/50 rounded-md animate-pulse mx-auto"></div>
            <div className="h-4 w-96 max-w-full bg-muted/40 rounded-md animate-pulse mx-auto"></div>
          </div>
        </div>
        
        {/* Tax Form Skeleton */}
        <div className="border rounded-lg p-6 bg-card shadow-sm animate-pulse">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="h-5 w-36 bg-muted/50 rounded-md"></div>
              <div className="h-10 w-full bg-muted/40 rounded-md"></div>
            </div>
            
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
            
            <div className="h-40 w-full bg-muted/30 rounded-md"></div>
          </div>
        </div>
      </div>
    )
  }
);

export const metadata: Metadata = {
  title: 'Nigerian Income Tax Calculator | Calculate.ng',
  description: 'Calculate your Nigerian income tax based on current tax brackets and allowances. PAYE calculator with detailed breakdown of tax, allowances, and reliefs for 2024/2025 tax year.',
  keywords: [
    'Nigerian tax calculator',
    'PAYE calculator',
    'income tax Nigeria',
    'tax brackets',
    'tax allowances',
    'FIRS tax calculation',
    'Nigerian tax reliefs'
  ]
};

export default function TaxCalculatorPage() {
  return (
    <ToastProvider>
      <ThemedCalculatorPage
        theme="tax"
        title="Nigerian Income Tax Calculator"
        description="Calculate your income tax based on current Nigerian tax brackets, allowances, and reliefs. Get detailed breakdown and optimization suggestions."
      >
        <EnhancedTaxCalculator />
      </ThemedCalculatorPage>
    </ToastProvider>
  );
}
