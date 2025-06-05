import InflationCalculator from '@/components/calculators/InflationCalculator';
import { ThemedCalculatorPage } from '@/components/layout/themed-calculator-page';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nigerian Inflation Calculator | Calculate.ng',
  description: 'Calculate the impact of inflation on your money using Consumer Price Index (CPI) data from the Nigerian Bureau of Statistics. See how inflation affects purchasing power over time.',
  keywords: ['inflation calculator', 'Nigeria CPI', 'purchasing power', 'consumer price index', 'economic indicators', 'financial planning']
};

export default function InflationCalculatorPage() {
  return (
    <ThemedCalculatorPage
      theme="inflation"
      title="Nigerian Inflation Calculator"
      description="Understand how inflation impacts your purchasing power using official Consumer Price Index (CPI) data. Calculate what your money would be worth today and make informed financial decisions."
    >
      <InflationCalculator />
    </ThemedCalculatorPage>
  );
}
