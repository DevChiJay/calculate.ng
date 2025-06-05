import { Metadata } from 'next';
import EnhancedBMICalculator from '@/components/calculators/EnhancedBMICalculator';
import { ThemedCalculatorPage } from '@/components/layout/themed-calculator-page';
import { ToastProvider } from '@/components/ui/toast';

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
    <ToastProvider>
      <ThemedCalculatorPage
        theme="bmi"
        title="BMI Calculator"
        description="Calculate your Body Mass Index and get personalized health insights with support for both metric and imperial units."
      >
        <EnhancedBMICalculator />
      </ThemedCalculatorPage>
    </ToastProvider>
  );
}
