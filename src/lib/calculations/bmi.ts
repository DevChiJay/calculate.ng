/**
 * BMI (body mass index) for adults, using WHO cut-offs. Pure functions, no UI concerns.
 * BMI is a screening measure only: it does not distinguish muscle from fat and is not valid for
 * children, pregnancy, or elite athletes.
 */

export type Unit = "metric" | "imperial";

/** Blank fields are NaN. Metric uses `height` (cm); imperial uses `heightFeet` and `heightInches`. */
export interface BMIInputs {
  unit: Unit;
  /** kg (metric) or lb (imperial). */
  weight: number;
  height: number;
  heightFeet: number;
  heightInches: number;
}

export type BMICategoryId = "underweight" | "normal" | "overweight" | "obese1" | "obese2" | "obese3";

export interface BMICategory {
  id: BMICategoryId;
  label: string;
  /** Inclusive lower bound of the range (on the 1-decimal BMI). */
  min: number;
  /** Exclusive upper bound; null for the top category. */
  max: number | null;
  tone: "info" | "success" | "warning" | "highlight" | "destructive";
  risk: string;
  advice: string[];
}

export const BMI_CATEGORIES: BMICategory[] = [
  {
    id: "underweight",
    label: "Underweight",
    min: 0,
    max: 18.5,
    tone: "info",
    risk: "A low BMI can go with poor nutrition, an eating disorder, or an underlying health condition.",
    advice: [
      "Speak to a healthcare provider about a healthy way to gain weight.",
      "Focus on regular meals with enough protein and energy.",
      "Ask whether any underlying condition could be involved.",
    ],
  },
  {
    id: "normal",
    label: "Healthy weight",
    min: 18.5,
    max: 25,
    tone: "success",
    risk: "This range is linked with the lowest risk of heart disease and type 2 diabetes.",
    advice: [
      "Keep up regular physical activity, about 150 minutes a week.",
      "Keep eating a varied, balanced diet.",
      "Have routine health check-ups.",
    ],
  },
  {
    id: "overweight",
    label: "Overweight",
    min: 25,
    max: 30,
    tone: "warning",
    risk: "A higher BMI raises the risk of heart disease and type 2 diabetes.",
    advice: [
      "Small, steady changes in food and activity work better than crash diets.",
      "Aim to be active most days of the week.",
      "A nutritionist or doctor can help you set a realistic target.",
    ],
  },
  {
    id: "obese1",
    label: "Obese (class 1)",
    min: 30,
    max: 35,
    tone: "highlight",
    risk: "A moderately raised risk of heart disease, type 2 diabetes and high blood pressure.",
    advice: [
      "Ask a healthcare provider for a personal weight-management plan.",
      "Losing even 5 to 10% of your weight can improve health markers.",
      "Have blood pressure, cholesterol and blood sugar checked regularly.",
    ],
  },
  {
    id: "obese2",
    label: "Obese (class 2)",
    min: 35,
    max: 40,
    tone: "destructive",
    risk: "A high risk of heart disease, type 2 diabetes, sleep apnoea and other conditions.",
    advice: [
      "Seek medical supervision for weight management.",
      "Ask about structured programmes and screening for related conditions.",
      "Have cardiovascular risk factors monitored.",
    ],
  },
  {
    id: "obese3",
    label: "Obese (class 3)",
    min: 40,
    max: null,
    tone: "destructive",
    risk: "A very high risk of serious health conditions.",
    advice: [
      "See a healthcare provider soon to discuss a management plan.",
      "Ask about medically supervised programmes and other treatment options.",
      "Have related conditions assessed and managed together.",
    ],
  },
];

/** Category for a BMI that has already been rounded to 1 decimal (the value the user sees). */
export function categoryForBMI(bmi: number): BMICategory {
  return (
    BMI_CATEGORIES.find((c) => bmi >= c.min && (c.max === null || bmi < c.max)) ??
    BMI_CATEGORIES[BMI_CATEGORIES.length - 1]
  );
}

const LB_TO_KG = 0.45359237;
const IN_TO_CM = 2.54;

// Adult plausibility limits. Outside these the result would be meaningless or a typo.
const LIMITS = { weightKg: [20, 500], heightCm: [100, 250] } as const;

function inchesOrZero(inputs: BMIInputs) {
  return Number.isNaN(inputs.heightInches) ? 0 : inputs.heightInches;
}

export function toMetric(inputs: BMIInputs): { weightKg: number; heightCm: number } {
  if (inputs.unit === "imperial") {
    return {
      weightKg: inputs.weight * LB_TO_KG,
      heightCm: (inputs.heightFeet * 12 + inchesOrZero(inputs)) * IN_TO_CM,
    };
  }
  return { weightKg: inputs.weight, heightCm: inputs.height };
}

export interface BMIFieldError {
  field: "weight" | "height" | "heightFeet" | "heightInches";
  message: string;
}
export type BMIValidation = { ok: true } | { ok: false; errors: BMIFieldError[] };

export function validateBMIInputs(inputs: BMIInputs): BMIValidation {
  const errors: BMIFieldError[] = [];
  const imperial = inputs.unit === "imperial";
  const weightUnit = imperial ? "lb" : "kg";
  const [minKg, maxKg] = LIMITS.weightKg;
  const [minCm, maxCm] = LIMITS.heightCm;
  const lb = (kg: number) => Math.round(kg / LB_TO_KG);

  if (!Number.isFinite(inputs.weight)) {
    errors.push({ field: "weight", message: `Enter your weight in ${weightUnit}.` });
  } else {
    const kg = imperial ? inputs.weight * LB_TO_KG : inputs.weight;
    if (kg < minKg || kg > maxKg) {
      errors.push({
        field: "weight",
        message: imperial
          ? `Enter a weight between ${lb(minKg)} and ${lb(maxKg)} lb.`
          : `Enter a weight between ${minKg} and ${maxKg} kg.`,
      });
    }
  }

  if (imperial) {
    if (!Number.isFinite(inputs.heightFeet)) {
      errors.push({ field: "heightFeet", message: "Enter your height in feet." });
    } else if (inputs.heightFeet < 0) {
      errors.push({ field: "heightFeet", message: "Feet cannot be negative." });
    }
    if (!Number.isNaN(inputs.heightInches) && (inputs.heightInches < 0 || inputs.heightInches >= 12)) {
      errors.push({ field: "heightInches", message: "Inches must be from 0 to 11." });
    }
    const alreadyFlagged = errors.some((e) => e.field === "heightFeet" || e.field === "heightInches");
    if (!alreadyFlagged) {
      const cm = (inputs.heightFeet * 12 + inchesOrZero(inputs)) * IN_TO_CM;
      if (cm < minCm || cm > maxCm) {
        errors.push({ field: "heightFeet", message: "Enter a height between 3 ft 4 in and 8 ft 2 in." });
      }
    }
  } else if (!Number.isFinite(inputs.height)) {
    errors.push({ field: "height", message: "Enter your height in cm." });
  } else if (inputs.height < minCm || inputs.height > maxCm) {
    errors.push({ field: "height", message: `Enter a height between ${minCm} and ${maxCm} cm.` });
  }

  return errors.length === 0 ? { ok: true } : { ok: false, errors };
}

export interface BMIResult {
  /** Rounded to 1 decimal: the number shown and used for the category. */
  bmi: number;
  category: BMICategory;
  weightKg: number;
  heightCm: number;
  /** Weights that give a BMI of 18.5 to 24.9 at this height, in kg. */
  healthyRangeKg: { min: number; max: number };
}

/** Call `validateBMIInputs` first; this assumes finite, in-range inputs. */
export function calculateBMI(inputs: BMIInputs): BMIResult {
  const { weightKg, heightCm } = toMetric(inputs);
  const heightM = heightCm / 100;
  const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;
  const m2 = heightM * heightM;
  return {
    bmi,
    category: categoryForBMI(bmi),
    weightKg,
    heightCm,
    healthyRangeKg: {
      min: Math.round(18.5 * m2 * 10) / 10,
      max: Math.round(24.9 * m2 * 10) / 10,
    },
  };
}
