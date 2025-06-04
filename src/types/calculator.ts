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
  result: TaxResult | BMIResult | InflationResult | null;
  errors: FormValidationError[];
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

// Tax Calculator Types
export interface TaxInputs {
  grossIncome: number;
  basicSalary?: number; // For NHF and NHIS calculations
  monthlyEmolument?: number; // For pension calculations
  lifeAssurancePremium?: number;
  additionalReliefs?: {
    disability?: boolean;
    oldAge?: boolean; // 65 years and above
    dependentRelatives?: number; // Number of dependent relatives
  };
  paymentFrequency: 'monthly' | 'annual';
  includeMinimumTax?: boolean;
}

export interface TaxResult {
  grossIncome: number;
  totalAllowances: number;
  taxableIncome: number;
  incomeTax: number;
  minimumTax: number;
  finalTax: number; // Higher of income tax or minimum tax
  netIncome: number;
  taxBrackets: TaxBracketResult[];
  allowanceBreakdown: AllowanceBreakdown;
  effectiveRate: number; // Final tax / gross income
  marginalRate: number; // Tax rate for highest bracket
}

export interface TaxBracketResult {
  min: number;
  max: number | null;
  rate: number;
  taxableAmount: number;
  taxAmount: number;
  description: string;
}

export interface AllowanceBreakdown {
  consolidatedRelief: number;
  nationalHousingFund: number;
  nhis: number;
  pension: number;
  lifeAssurance: number;
  additionalReliefs: number;
  total: number;
}
