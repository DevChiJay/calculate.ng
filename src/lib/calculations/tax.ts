/**
 * Nigerian Income Tax Calculator
 * Calculates PAYE tax based on current Nigerian tax laws and brackets
 */

import {
  NIGERIA_TAX_BRACKETS,
  ADDITIONAL_RELIEFS,
  MINIMUM_TAX,
  calculateConsolidatedRelief,
  calculateNHF,
  calculateNHIS,
  calculatePension,
  getTaxBracketInfo
} from '@/lib/data/nigeria-tax-brackets';
import type { TaxInputs, TaxResult, TaxBracketResult, AllowanceBreakdown } from '@/types/calculator';
// Formatting utilities available at '@/lib/utils/format' if needed by consumers.

export interface TaxValidationError {
  field: string;
  message: string;
}

/**
 * Validate tax calculator inputs
 */
export function validateTaxInputs(inputs: Partial<TaxInputs>): string[] {
  const errors: string[] = [];

  if (!inputs.grossIncome || inputs.grossIncome <= 0) {
    errors.push('Gross income must be greater than 0');
  }

  if (inputs.grossIncome && inputs.grossIncome > 1000000000) {
    errors.push('Gross income seems unusually high. Please verify the amount.');
  }

  if (inputs.basicSalary && inputs.basicSalary > inputs.grossIncome!) {
    errors.push('Basic salary cannot be greater than gross income');
  }

  if (inputs.monthlyEmolument && (inputs.monthlyEmolument * 12) > inputs.grossIncome!) {
    errors.push('Monthly emolument appears inconsistent with annual gross income');
  }

  if (inputs.lifeAssurancePremium && inputs.lifeAssurancePremium < 0) {
    errors.push('Life assurance premium cannot be negative');
  }

  if (inputs.additionalReliefs?.dependentRelatives && 
      (inputs.additionalReliefs.dependentRelatives < 0 || inputs.additionalReliefs.dependentRelatives > 10)) {
    errors.push('Number of dependent relatives must be between 0 and 10');
  }

  return errors;
}

/**
 * Calculate allowances and reliefs
 */
export function calculateAllowances(inputs: TaxInputs): AllowanceBreakdown {
  // Retained for backward compatibility; now delegates to applyDeductions for core logic
  return applyDeductions(inputs);
}

/**
 * NEW: Expose personal income tax brackets (abstraction for future dynamic sourcing)
 */
export function getPersonalIncomeTaxBrackets() {
  return [...NIGERIA_TAX_BRACKETS]; // return a shallow copy to avoid accidental mutation
}

/**
 * NEW: Calculate Consolidated Relief Allowance (wrapper for data-layer function)
 */
export function calculateConsolidatedReliefAllowance(gross: number) {
  return calculateConsolidatedRelief(gross);
}

/**
 * NEW: Apply statutory deductions & additional reliefs producing the AllowanceBreakdown
 * This centralizes deduction logic to keep calculateTaxResult lean & testable.
 */
export function applyDeductions(inputs: TaxInputs): AllowanceBreakdown {
  const grossIncome = inputs.grossIncome;
  const basicSalary = inputs.basicSalary || grossIncome * 0.7; // Default heuristic
  const monthlyEmolument = inputs.monthlyEmolument || grossIncome / 12;

  const consolidatedRelief = calculateConsolidatedReliefAllowance(grossIncome);
  const nationalHousingFund = calculateNHF(basicSalary);
  const nhis = calculateNHIS(basicSalary);
  const pension = calculatePension(monthlyEmolument);

  // Life Assurance Premium Relief (15% of premium or 20% of net after other reliefs)
  let lifeAssurance = 0;
  if (inputs.lifeAssurancePremium && inputs.lifeAssurancePremium > 0) {
    const grossLessOtherReliefs = grossIncome - (consolidatedRelief + nationalHousingFund + nhis + pension);
    const twentyPercentOfNet = grossLessOtherReliefs * 0.20;
    const fifteenPercentOfPremium = inputs.lifeAssurancePremium * 0.15;
    lifeAssurance = Math.min(fifteenPercentOfPremium, twentyPercentOfNet);
  }

  // Additional Reliefs
  let additionalReliefs = 0;
  if (inputs.additionalReliefs) {
    const { disability, oldAge, dependentRelatives } = inputs.additionalReliefs;
    if (disability) additionalReliefs += ADDITIONAL_RELIEFS.DISABILITY_RELIEF.amount;
    if (oldAge) additionalReliefs += ADDITIONAL_RELIEFS.OLD_AGE_RELIEF.amount;
    if (dependentRelatives) {
      additionalReliefs += dependentRelatives * ADDITIONAL_RELIEFS.DEPENDENT_RELATIVE_RELIEF.amount;
    }
  }

  const total = consolidatedRelief + nationalHousingFund + nhis + pension + lifeAssurance + additionalReliefs;

  return {
    consolidatedRelief,
    nationalHousingFund,
    nhis,
    pension,
    lifeAssurance,
    additionalReliefs,
    total
  };
}

/**
 * Calculate income tax using progressive tax brackets
 */
export function calculateIncomeTax(taxableIncome: number): { tax: number; brackets: TaxBracketResult[] } {
  let totalTax = 0;
  let remainingIncome = taxableIncome;
  const bracketResults: TaxBracketResult[] = [];

  for (const bracket of NIGERIA_TAX_BRACKETS) {
    if (remainingIncome <= 0) break;

    const bracketMin = bracket.min;
    const bracketMax = bracket.max;
    const bracketSize = bracketMax ? bracketMax - bracketMin : Infinity;
    
    const taxableInThisBracket = Math.min(remainingIncome, bracketSize);
    const taxForThisBracket = (taxableInThisBracket * bracket.rate) / 100;

    if (taxableInThisBracket > 0) {
      bracketResults.push({
        min: bracketMin,
        max: bracketMax,
        rate: bracket.rate,
        taxableAmount: taxableInThisBracket,
        taxAmount: taxForThisBracket,
        description: bracket.description
      });

      totalTax += taxForThisBracket;
      remainingIncome -= taxableInThisBracket;
    }
  }

  return { tax: totalTax, brackets: bracketResults };
}

/**
 * Calculate minimum tax
 */
export function calculateMinimumTax(grossIncome: number): number {
  return grossIncome * (MINIMUM_TAX.rate / 100);
}

/**
 * Calculate complete tax result
 */
export function calculateTaxResult(inputs: TaxInputs): TaxResult {
  const validationErrors = validateTaxInputs(inputs);
  if (validationErrors.length > 0) throw new Error(validationErrors[0]);

  const grossIncome = inputs.grossIncome;
  const allowanceBreakdown = applyDeductions(inputs); // single point for deductions
  const taxableIncome = Math.max(0, grossIncome - allowanceBreakdown.total);
  const { tax: incomeTax, brackets: taxBrackets } = calculateIncomeTax(taxableIncome);
  const minimumTax = inputs.includeMinimumTax ? calculateMinimumTax(grossIncome) : 0;
  const finalTax = Math.max(incomeTax, minimumTax);
  const netIncome = grossIncome - finalTax;
  const effectiveRate = grossIncome > 0 ? (finalTax / grossIncome) * 100 : 0;
  const marginalRate = getTaxBracketInfo(taxableIncome)?.rate ?? 0;

  return {
    grossIncome,
    totalAllowances: allowanceBreakdown.total,
    taxableIncome,
    incomeTax,
    minimumTax,
    finalTax,
    netIncome,
    taxBrackets,
    allowanceBreakdown,
    effectiveRate,
    marginalRate
  };
}

// formatNGN and formatPercentage are now imported from shared utils.

/**
 * Convert annual income to monthly
 */
export function annualToMonthly(annualAmount: number): number {
  return annualAmount / 12;
}

/**
 * Convert monthly income to annual
 */
export function monthlyToAnnual(monthlyAmount: number): number {
  return monthlyAmount * 12;
}

/**
 * Get tax summary for the given income level
 */
export function getTaxSummary(taxableIncome: number): {
  bracket: string;
  rate: number;
  description: string;
} {
  const bracket = getTaxBracketInfo(taxableIncome);
  
  if (!bracket) {
    return {
      bracket: 'No tax bracket applicable',
      rate: 0,
      description: 'Income is below taxable threshold'
    };
  }

  const bracketRange = bracket.max 
    ? `₦${bracket.min.toLocaleString()} - ₦${bracket.max.toLocaleString()}`
    : `Above ₦${bracket.min.toLocaleString()}`;

  return {
    bracket: bracketRange,
    rate: bracket.rate,
    description: bracket.description
  };
}

/**
 * Get tax optimization suggestions
 */
export function getTaxOptimizationSuggestions(inputs: TaxInputs, result: TaxResult): string[] {
  const suggestions: string[] = [];

  // Suggest maximizing allowances
  if (!inputs.lifeAssurancePremium || inputs.lifeAssurancePremium === 0) {
    suggestions.push('Consider purchasing life insurance to claim life assurance premium relief');
  }

  // Suggest pension contributions
  const currentPension = result.allowanceBreakdown.pension;
  const grossIncome = result.grossIncome;
  if (currentPension < grossIncome * 0.08) {
    suggestions.push('Maximize your pension contribution (8% of emolument) for additional tax relief');
  }

  // Suggest additional reliefs
  if (!inputs.additionalReliefs?.disability && !inputs.additionalReliefs?.oldAge) {
    suggestions.push('Check if you qualify for additional reliefs (disability, old age, dependent relatives)');
  }

  // High tax bracket suggestions
  if (result.marginalRate >= 21) {
    suggestions.push('Consider income splitting strategies with spouse if applicable');
    suggestions.push('Explore tax-efficient investment options like bonds and mutual funds');
  }

  // Minimum tax considerations
  if (result.finalTax === result.minimumTax && result.minimumTax > result.incomeTax) {
    suggestions.push('Your minimum tax is higher than calculated income tax. Consider increasing allowable deductions');
  }

  return suggestions;
}
