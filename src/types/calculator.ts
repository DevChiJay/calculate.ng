/**
 * TypeScript type definitions for the calculator applications
 */

// BMI Calculator Types
export interface BMIInputs {
  weight: number;
  height: number;
  unit: 'metric' | 'imperial';
  heightFeet?: number;
  heightInches?: number;
}

export interface BMIResult {
  bmi: number;
  category: BMICategory;
  categoryColor: string;
  healthRisk: string;
  recommendations: string[];
}

export type BMICategory = 
  | 'Underweight' 
  | 'Normal weight' 
  | 'Overweight' 
  | 'Obese Class I' 
  | 'Obese Class II' 
  | 'Obese Class III';

// Common Form Types
export interface FormValidationError {
  field: string;
  message: string;
}

export interface CalculatorState<T> {
  data: T;
  result: any;
  errors: FormValidationError[];
  isCalculating: boolean;
}

// Future Types for other calculators

// Inflation Calculator Types
export interface InflationInputs {
  amount: number;
  startDate: string;
  endDate: string;
  currency: 'NGN';
}

export interface InflationResult {
  inflationRate: number;
  adjustedAmount: number;
  totalInflation: number;
  annualizedRate: number;
  purchasingPowerLoss: number;
  equivalentValue: number;
  periodInYears: number;
  startCPI: number;
  endCPI: number;
}

// Tax Calculator Types (placeholder)
export interface TaxInputs {
  annualIncome: number;
  allowances: number;
  reliefs: number;
  paymentFrequency: 'monthly' | 'annual';
}

export interface TaxResult {
  grossIncome: number;
  taxableIncome: number;
  incomeTax: number;
  netIncome: number;
  taxBrackets: TaxBracket[];
}

export interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
  taxAmount: number;
}
