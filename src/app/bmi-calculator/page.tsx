import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { ThemedCalculatorPage } from '@/components/layout/themed-calculator-page';
import { ToastProvider } from '@/components/ui/toast';

// Lazy load the calculator component
const EnhancedBMICalculator = dynamic(
  () => import('@/components/calculators/EnhancedBMICalculator'),
  { 
    loading: () => (
      <div className="space-y-8 max-w-3xl mx-auto p-6">
        {/* Header Skeleton */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted/50 rounded-md animate-pulse mx-auto"></div>
            <div className="h-4 w-96 max-w-full bg-muted/40 rounded-md animate-pulse mx-auto"></div>
          </div>
        </div>
        
        {/* Form Skeleton */}
        <div className="border rounded-lg p-6 bg-card shadow-sm animate-pulse">
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-5 w-5 rounded-full bg-muted/60"></div>
              <div className="h-5 w-40 bg-muted/60 rounded-md"></div>
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
            
            <div className="h-60 w-full bg-muted/30 rounded-md"></div>
          </div>
        </div>
      </div>
    )
  }
);

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
