import { Metadata } from 'next';
import EnhancedTaxCalculator from '@/components/calculators/EnhancedTaxCalculator';
import { ThemedCalculatorPage } from '@/components/layout/themed-calculator-page';
import { ToastProvider } from '@/components/ui/toast';

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
