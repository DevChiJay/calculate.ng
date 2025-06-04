/**
 * BMI calculation utilities for the BMI Calculator
 * Supports both metric and imperial units with proper validation
 */

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

/**
 * Convert imperial units to metric
 */
export function convertImperialToMetric(weightLbs: number, heightFeet: number, heightInches: number) {
  const weightKg = weightLbs * 0.453592;
  const heightCm = (heightFeet * 12 + heightInches) * 2.54;
  return { weightKg, heightCm };
}

/**
 * Calculate BMI from weight (kg) and height (cm)
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
  if (weightKg <= 0 || heightCm <= 0) {
    throw new Error('Weight and height must be positive numbers');
  }
  
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

/**
 * Get BMI category based on BMI value
 */
export function getBMICategory(bmi: number): BMICategory {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  if (bmi < 35) return 'Obese Class I';
  if (bmi < 40) return 'Obese Class II';
  return 'Obese Class III';
}

/**
 * Get category color for UI display
 */
export function getCategoryColor(category: BMICategory): string {
  switch (category) {
    case 'Underweight':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'Normal weight':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'Overweight':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'Obese Class I':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'Obese Class II':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'Obese Class III':
      return 'text-red-800 bg-red-100 border-red-300';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

/**
 * Get health risk description
 */
export function getHealthRisk(category: BMICategory): string {
  switch (category) {
    case 'Underweight':
      return 'May indicate malnutrition, eating disorder, or other health issues';
    case 'Normal weight':
      return 'Associated with lowest risk of heart disease and diabetes';
    case 'Overweight':
      return 'Increased risk of cardiovascular disease and diabetes';
    case 'Obese Class I':
      return 'Moderate risk of cardiovascular disease, diabetes, and other health issues';
    case 'Obese Class II':
      return 'High risk of cardiovascular disease, diabetes, and other health issues';
    case 'Obese Class III':
      return 'Very high risk of cardiovascular disease, diabetes, and other serious health issues';
    default:
      return '';
  }
}

/**
 * Get health recommendations based on BMI category
 */
export function getHealthRecommendations(category: BMICategory): string[] {
  switch (category) {
    case 'Underweight':
      return [
        'Consult with a healthcare provider about healthy weight gain',
        'Focus on nutrient-dense foods and regular meals',
        'Consider strength training to build muscle mass',
        'Monitor for underlying health conditions'
      ];
    case 'Normal weight':
      return [
        'Maintain current healthy lifestyle habits',
        'Continue regular physical activity (150+ minutes/week)',
        'Follow a balanced, nutritious diet',
        'Regular health check-ups for preventive care'
      ];
    case 'Overweight':
      return [
        'Aim for gradual weight loss of 1-2 pounds per week',
        'Increase physical activity to 250+ minutes per week',
        'Focus on portion control and balanced nutrition',
        'Consider consulting a nutritionist or healthcare provider'
      ];
    case 'Obese Class I':
      return [
        'Consult healthcare provider for personalized weight loss plan',
        'Target 5-10% weight loss as initial goal',
        'Combine regular exercise with dietary changes',
        'Monitor blood pressure, cholesterol, and blood sugar regularly'
      ];
    case 'Obese Class II':
      return [
        'Seek medical supervision for weight management',
        'Consider structured weight loss programs',
        'Regular monitoring of cardiovascular risk factors',
        'Evaluate for sleep apnea and other obesity-related conditions'
      ];
    case 'Obese Class III':
      return [
        'Immediate medical consultation recommended',
        'Consider medically supervised weight loss programs',
        'Evaluate for bariatric surgery if appropriate',
        'Comprehensive management of obesity-related health conditions'
      ];
    default:
      return [];
  }
}

/**
 * Main BMI calculation function
 */
export function calculateBMIResult(inputs: BMIInputs): BMIResult {
  let weightKg: number;
  let heightCm: number;

  if (inputs.unit === 'imperial') {
    if (!inputs.heightFeet && inputs.heightFeet !== 0) {
      throw new Error('Height in feet is required for imperial units');
    }
    if (!inputs.heightInches && inputs.heightInches !== 0) {
      throw new Error('Height in inches is required for imperial units');
    }
    
    const converted = convertImperialToMetric(inputs.weight, inputs.heightFeet, inputs.heightInches);
    weightKg = converted.weightKg;
    heightCm = converted.heightCm;
  } else {
    weightKg = inputs.weight;
    heightCm = inputs.height;
  }

  const bmi = calculateBMI(weightKg, heightCm);
  const category = getBMICategory(bmi);
  const categoryColor = getCategoryColor(category);
  const healthRisk = getHealthRisk(category);
  const recommendations = getHealthRecommendations(category);

  return {
    bmi: Math.round(bmi * 10) / 10, // Round to 1 decimal place
    category,
    categoryColor,
    healthRisk,
    recommendations
  };
}

/**
 * Validate BMI inputs
 */
export function validateBMIInputs(inputs: Partial<BMIInputs>): string[] {
  const errors: string[] = [];

  if (!inputs.weight || inputs.weight <= 0) {
    errors.push('Weight must be a positive number');
  }

  if (inputs.unit === 'metric') {
    if (!inputs.height || inputs.height <= 0) {
      errors.push('Height must be a positive number');
    }
    if (inputs.weight && inputs.weight > 1000) {
      errors.push('Weight seems unrealistic (max 1000 kg)');
    }
    if (inputs.height && inputs.height > 300) {
      errors.push('Height seems unrealistic (max 300 cm)');
    }
  } else if (inputs.unit === 'imperial') {
    if (inputs.heightFeet === undefined || inputs.heightFeet < 0) {
      errors.push('Height in feet must be a non-negative number');
    }
    if (inputs.heightInches === undefined || inputs.heightInches < 0 || inputs.heightInches >= 12) {
      errors.push('Height in inches must be between 0 and 11');
    }
    if (inputs.weight && inputs.weight > 2200) {
      errors.push('Weight seems unrealistic (max 2200 lbs)');
    }
    if (inputs.heightFeet && inputs.heightFeet > 10) {
      errors.push('Height seems unrealistic (max 10 feet)');
    }
  }

  return errors;
}
