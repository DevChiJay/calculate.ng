/**
 * Nigerian Income Tax Brackets and Allowances (2024/2025 Tax Year)
 * Sources: Federal Inland Revenue Service (FIRS) and Finance Act 2024
 * 
 * Updated: June 2025
 * Base: Current PAYE (Pay As You Earn) tax structure
 */

export interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
  description: string;
}

export interface TaxAllowance {
  name: string;
  description: string;
  calculation: 'percentage' | 'fixed' | 'higher_of';
  value: number;
  percentage?: number; // For percentage-based allowances
  minimum?: number;    // For minimum values in "higher of" calculations
  maximum?: number;    // For maximum caps
}

/**
 * Nigerian Personal Income Tax Brackets (2024/2025)
 * Progressive tax system with rates from 7% to 24%
 */
export const NIGERIA_TAX_BRACKETS: TaxBracket[] = [
  {
    min: 0,
    max: 300000,
    rate: 7,
    description: 'First ₦300,000'
  },
  {
    min: 300000,
    max: 600000,
    rate: 11,
    description: 'Next ₦300,000 (₦300,001 - ₦600,000)'
  },
  {
    min: 600000,
    max: 1100000,
    rate: 15,
    description: 'Next ₦500,000 (₦600,001 - ₦1,100,000)'
  },
  {
    min: 1100000,
    max: 1600000,
    rate: 19,
    description: 'Next ₦500,000 (₦1,100,001 - ₦1,600,000)'
  },
  {
    min: 1600000,
    max: 3200000,
    rate: 21,
    description: 'Next ₦1,600,000 (₦1,600,001 - ₦3,200,000)'
  },
  {
    min: 3200000,
    max: null,
    rate: 24,
    description: 'Above ₦3,200,000'
  }
];

/**
 * Nigerian Tax Allowances and Reliefs (2024/2025)
 * These reduce the taxable income before applying tax rates
 */
export const NIGERIA_TAX_ALLOWANCES: TaxAllowance[] = [
  {
    name: 'Consolidated Relief Allowance',
    description: 'Basic relief allowance for all taxpayers',
    calculation: 'higher_of',
    value: 200000, // Fixed amount
    percentage: 1,  // 1% of gross income
    minimum: 200000 // Minimum ₦200,000 or 1% of gross income, whichever is higher
  },
  {
    name: 'National Housing Fund',
    description: 'Mandatory contribution to National Housing Fund (2.5% of basic salary)',
    calculation: 'percentage',
    value: 2.5,
    maximum: 100000 // Capped at ₦100,000 annually
  },
  {
    name: 'National Health Insurance Scheme (NHIS)',
    description: 'Health insurance contribution (1.75% of basic salary)',
    calculation: 'percentage',
    value: 1.75,
    maximum: 80000 // Capped at ₦80,000 annually
  },
  {
    name: 'Life Assurance Premium',
    description: 'Life insurance premium payments',
    calculation: 'percentage',
    value: 15, // 15% of premium or 20% of net income, whichever is lower
    maximum: 0 // Will be calculated based on net income
  },
  {
    name: 'Pension Contribution',
    description: 'Contributory pension scheme (8% of monthly emolument)',
    calculation: 'percentage',
    value: 8,
    maximum: 0 // No cap specified
  }
];

/**
 * Additional Tax Relief Items
 */
export const ADDITIONAL_RELIEFS = {
  // Disability relief
  DISABILITY_RELIEF: {
    name: 'Disability Relief',
    amount: 25000,
    description: 'Additional relief for persons with disability'
  },
  
  // Old age relief (65 years and above)
  OLD_AGE_RELIEF: {
    name: 'Old Age Relief',
    amount: 20000,
    description: 'Additional relief for persons 65 years and above'
  },

  // Dependent relative relief
  DEPENDENT_RELATIVE_RELIEF: {
    name: 'Dependent Relative Relief',
    amount: 20000,
    description: 'Relief for maintaining dependent relatives'
  }
};

/**
 * Minimum Tax Provisions
 */
export const MINIMUM_TAX = {
  rate: 0.5, // 0.5% of gross income
  description: 'Minimum tax payable (0.5% of gross income)',
  applicableWhen: 'When calculated tax is less than minimum tax'
};

/**
 * Calculate Consolidated Relief Allowance
 */
export function calculateConsolidatedRelief(grossIncome: number): number {
  const onePercent = grossIncome * 0.01;
  return Math.max(200000, onePercent);
}

/**
 * Calculate National Housing Fund contribution
 */
export function calculateNHF(basicSalary: number): number {
  const contribution = basicSalary * 0.025;
  return Math.min(contribution, 100000);
}

/**
 * Calculate NHIS contribution
 */
export function calculateNHIS(basicSalary: number): number {
  const contribution = basicSalary * 0.0175;
  return Math.min(contribution, 80000);
}

/**
 * Calculate pension contribution
 */
export function calculatePension(monthlyEmolument: number): number {
  return monthlyEmolument * 12 * 0.08; // 8% of annual emolument
}

/**
 * Get tax bracket information for a given income level
 */
export function getTaxBracketInfo(taxableIncome: number): TaxBracket | undefined {
  return NIGERIA_TAX_BRACKETS.find(bracket => {
    if (bracket.max === null) {
      return taxableIncome >= bracket.min;
    }
    return taxableIncome >= bracket.min && taxableIncome <= bracket.max;
  });
}

/**
 * Data Source Information
 * 
 * Primary Sources:
 * - Federal Inland Revenue Service (FIRS) - Personal Income Tax Act
 * - Finance Act 2024 - Latest amendments to tax rates and allowances
 * - Companies Income Tax Act (CITA) for corporate rates
 * 
 * Important Notes:
 * - Tax rates apply to Federal Capital Territory (FCT) Abuja
 * - State governments may have different rates (typically lower)
 * - This implementation focuses on PAYE for employed individuals
 * - For self-employed individuals, different rules may apply
 * 
 * Updates:
 * - June 2025: Updated brackets and allowances per Finance Act 2024
 * - Includes all current relief allowances and deductions
 */
