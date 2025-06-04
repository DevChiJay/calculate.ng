import { Metadata } from 'next';
import BMICalculator from '@/components/calculators/BMICalculator';

export const metadata: Metadata = {
  title: 'BMI Calculator - Body Mass Index Calculator | Calculate.ng',
  description:
    'Calculate your Body Mass Index (BMI) with our free online calculator. Supports metric and imperial units with instant results and personalized health recommendations.',
  keywords: [
    'BMI calculator',
    'body mass index',
    'health calculator',
    'weight calculator',
    'fitness calculator',
    'Nigeria',
  ],
  openGraph: {
    title: 'Free BMI Calculator - Calculate Your Body Mass Index',
    description:
      'Calculate your BMI instantly with our easy-to-use calculator. Get personalized health recommendations based on your results.',
    type: 'website',
  },
};

export default function BMICalculatorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          BMI Calculator
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Calculate your Body Mass Index and get personalized health insights
          with support for both metric and imperial units.
        </p>
      </div>
      <BMICalculator />
    </div>
  );
}
