import InflationCalculator from '@/components/calculators/InflationCalculator';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nigerian Inflation Calculator | Calculate.ng',
  description: 'Calculate the impact of inflation on your money using Consumer Price Index (CPI) data from the Nigerian Bureau of Statistics. See how inflation affects purchasing power over time.',
  keywords: ['inflation calculator', 'Nigeria CPI', 'purchasing power', 'consumer price index', 'economic indicators', 'financial planning']
};

export default function InflationCalculatorPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Nigerian Inflation Calculator</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Understand how inflation impacts your purchasing power using official Consumer Price Index (CPI) data. 
            Calculate what your money would be worth today and make informed financial decisions.
          </p>
        </div>
        
        <InflationCalculator />
      </div>
    </div>
  );
}
