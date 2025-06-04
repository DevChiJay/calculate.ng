import { Metadata } from 'next';
import TaxCalculator from '@/components/calculators/TaxCalculator';

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
    <div className="container mx-auto p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Nigerian Income Tax Calculator
          </h1>
          <p className="text-xl text-muted-foreground">
            Calculate your income tax based on current Nigerian tax brackets, allowances, and reliefs.
            Get detailed breakdown and optimization suggestions.
          </p>
        </div>
        
        <TaxCalculator />
      </div>
    </div>
  );
}
