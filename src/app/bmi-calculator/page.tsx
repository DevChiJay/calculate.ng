import { Metadata } from 'next';
import BMICalculator from '@/components/calculators/BMICalculator';
import { ThemedCalculatorPage } from '@/components/layout/themed-calculator-page';

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
    <ThemedCalculatorPage
      theme="bmi"
      title="BMI Calculator"
      description="Calculate your Body Mass Index and get personalized health insights with support for both metric and imperial units."
    >
      <BMICalculator />
    </ThemedCalculatorPage>
  );
}
