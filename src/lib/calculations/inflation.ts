/**
 * Nigerian Inflation Calculator using Consumer Price Index (CPI) methodology
 * Calculates inflation impact on purchasing power using historical CPI data
 */

import { getCPIForDate, getAvailableDateRange } from '@/lib/data/nigeria-cpi';
// Formatting utilities available via '@/lib/utils/format' for consumers.

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

export interface InflationValidationError {
  field: string;
  message: string;
}

/**
 * Validate inflation calculator inputs
 */
export function validateInflationInputs(inputs: Partial<InflationInputs>): string[] {
  const errors: string[] = [];

  // Validate amount
  if (!inputs.amount || inputs.amount <= 0) {
    errors.push('Amount must be a positive number');
  }

  if (inputs.amount && inputs.amount > 999999999999) {
    errors.push('Amount is too large');
  }

  // Validate dates
  if (!inputs.startDate) {
    errors.push('Start date is required');
  }

  if (!inputs.endDate) {
    errors.push('End date is required');
  }

  if (inputs.startDate && inputs.endDate) {
    const startDate = new Date(inputs.startDate);
    const endDate = new Date(inputs.endDate);

    if (startDate >= endDate) {
      errors.push('End date must be after start date');
    }

    // Validate against available data range
    const availableRange = getAvailableDateRange();
    const minDate = new Date(availableRange.min + '-01');
    const maxDate = new Date(availableRange.max + '-01');

    if (startDate < minDate) {
      errors.push(`Start date must be after ${minDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`);
    }

    if (endDate > maxDate) {
      errors.push(`End date must be before ${maxDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`);
    }

    // Check if the period is too short for meaningful calculation
    const diffInMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                        (endDate.getMonth() - startDate.getMonth());
    
    if (diffInMonths < 1) {
      errors.push('Period must be at least 1 month for meaningful inflation calculation');
    }
  }

  return errors;
}

/**
 * Calculate inflation impact using CPI methodology
 */
export function calculateInflationResult(inputs: InflationInputs): InflationResult {
  const validationErrors = validateInflationInputs(inputs);
  if (validationErrors.length > 0) {
    throw new Error(validationErrors[0]);
  }

  const { amount, startDate, endDate } = inputs;

  // Get CPI values for start and end dates
  const startCPI = getCPIForDate(startDate);
  const endCPI = getCPIForDate(endDate);

  if (startCPI <= 0 || endCPI <= 0) {
    throw new Error('Invalid CPI data for the selected dates');
  }

  // Calculate the period in years
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);
  const periodInMonths = (endDateObj.getFullYear() - startDateObj.getFullYear()) * 12 + 
                        (endDateObj.getMonth() - startDateObj.getMonth());
  const periodInYears = periodInMonths / 12;

  // Calculate cumulative inflation rate
  const totalInflation = ((endCPI - startCPI) / startCPI) * 100;

  // Calculate annualized inflation rate
  const annualizedRate = periodInYears > 0 ? 
    (Math.pow(endCPI / startCPI, 1 / periodInYears) - 1) * 100 : 0;

  // Calculate adjusted amount (what the money would be worth today)
  const adjustedAmount = amount * (endCPI / startCPI);

  // Calculate equivalent purchasing power (what you'd need today to buy what amount could buy then)
  const equivalentValue = amount * (endCPI / startCPI);

  // Calculate purchasing power loss/gain
  const purchasingPowerLoss = ((adjustedAmount - amount) / amount) * 100;

  return {
    inflationRate: totalInflation,
    adjustedAmount,
    totalInflation,
    annualizedRate,
    purchasingPowerLoss,
    equivalentValue,
    periodInYears,
    startCPI,
    endCPI
  };
}

// formatNGN and formatPercentage now sourced from shared utils.

/**
 * Get inflation interpretation based on rate
 */
export function getInflationInterpretation(annualizedRate: number): {
  level: 'low' | 'moderate' | 'high' | 'very-high';
  description: string;
  color: string;
} {
  if (annualizedRate < 3) {
    return {
      level: 'low',
      description: 'Low inflation - Generally considered healthy for economic growth',
      color: 'text-green-600'
    };
  } else if (annualizedRate < 6) {
    return {
      level: 'moderate',
      description: 'Moderate inflation - Within acceptable range for most economies',
      color: 'text-yellow-600'
    };
  } else if (annualizedRate < 15) {
    return {
      level: 'high',
      description: 'High inflation - May impact purchasing power significantly',
      color: 'text-orange-600'
    };
  } else {
    return {
      level: 'very-high',
      description: 'Very high inflation - Serious impact on purchasing power and savings',
      color: 'text-red-600'
    };
  }
}

/**
 * Get recommendations based on inflation rate
 */
export function getInflationRecommendations(annualizedRate: number): string[] {
  if (annualizedRate < 3) {
    return [
      'Consider investing in growth assets for better returns',
      'Fixed deposits and savings accounts may be suitable',
      'Focus on long-term financial planning'
    ];
  } else if (annualizedRate < 6) {
    return [
      'Diversify investments across different asset classes',
      'Consider inflation-linked bonds or securities',
      'Review and adjust financial goals regularly'
    ];
  } else if (annualizedRate < 15) {
    return [
      'Prioritize inflation-beating investments',
      'Consider real estate or commodity investments',
      'Avoid holding too much cash for long periods',
      'Review salary and income adjustments regularly'
    ];
  } else {
    return [
      'Focus on preserving purchasing power',
      'Consider foreign currency or international investments',
      'Invest in tangible assets like real estate',
      'Negotiate regular salary reviews',
      'Avoid long-term fixed-rate loans as a borrower'
    ];
  }
}
