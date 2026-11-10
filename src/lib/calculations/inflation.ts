/**
 * Inflation maths using Consumer Price Index (CPI) values. Pure: the CPI lookup is passed in, so the
 * data source can change (or be tested) without touching the formulas.
 * Months are "YYYY-MM" strings, parsed without `Date` so results never depend on the time zone.
 */
import { formatMonthYear } from "@/lib/utils/format";

export interface InflationInputs {
  amount: number;
  /** "YYYY-MM" */
  start: string;
  /** "YYYY-MM" */
  end: string;
}

export interface InflationResult {
  start: string;
  end: string;
  startCPI: number;
  endCPI: number;
  /** What the amount would need to be at the end date to buy the same as at the start date. */
  equivalentAmount: number;
  /** Cumulative price rise between the two dates, as a percentage. */
  totalInflation: number;
  /** Compound yearly rate over the period, as a percentage. */
  annualizedRate: number;
  /** Change in what the same naira can buy. Negative = lost. e.g. prices doubling gives −50. */
  purchasingPowerChange: number;
  years: number;
}

export interface InflationFieldError {
  field: "amount" | "start" | "end";
  message: string;
}

export function parseYM(ym: string): { year: number; month: number } | null {
  const m = /^(\d{4})-(\d{2})$/.exec(ym);
  if (!m) return null;
  const month = Number(m[2]);
  if (month < 1 || month > 12) return null;
  return { year: Number(m[1]), month };
}

/** Whole months from a to b (negative if b is earlier). Inputs must be valid "YYYY-MM". */
export function monthsBetween(a: string, b: string): number {
  const x = parseYM(a)!;
  const y = parseYM(b)!;
  return (y.year - x.year) * 12 + (y.month - x.month);
}

export function validateInflationInputs(
  inputs: InflationInputs,
  range: { min: string; max: string },
): InflationFieldError[] {
  const errors: InflationFieldError[] = [];

  if (!Number.isFinite(inputs.amount) || inputs.amount <= 0) {
    errors.push({ field: "amount", message: "Enter an amount greater than ₦0." });
  } else if (inputs.amount > 1e12) {
    errors.push({ field: "amount", message: "That amount is too large to calculate. Please check it." });
  }

  const startOk = parseYM(inputs.start) !== null;
  const endOk = parseYM(inputs.end) !== null;
  if (!startOk) errors.push({ field: "start", message: "Choose a start date." });
  if (!endOk) errors.push({ field: "end", message: "Choose an end date." });

  if (startOk && inputs.start < range.min) {
    errors.push({ field: "start", message: `Data starts in ${formatMonthYear(range.min)}. Choose a later start.` });
  }
  if (endOk && inputs.end > range.max) {
    errors.push({ field: "end", message: `Data runs to ${formatMonthYear(range.max)}. Choose an earlier end.` });
  }
  if (startOk && endOk && monthsBetween(inputs.start, inputs.end) < 1) {
    errors.push({ field: "end", message: "The end date must be at least one month after the start date." });
  }

  return errors;
}

/** Call `validateInflationInputs` first. Throws if the CPI source has no value for a date. */
export function calculateInflation(inputs: InflationInputs, cpiFor: (ym: string) => number): InflationResult {
  const startCPI = cpiFor(inputs.start);
  const endCPI = cpiFor(inputs.end);
  if (!Number.isFinite(startCPI) || !Number.isFinite(endCPI) || startCPI <= 0 || endCPI <= 0) {
    throw new Error("No CPI value available for the selected dates");
  }

  const ratio = endCPI / startCPI;
  const years = monthsBetween(inputs.start, inputs.end) / 12;

  return {
    start: inputs.start,
    end: inputs.end,
    startCPI,
    endCPI,
    equivalentAmount: inputs.amount * ratio,
    totalInflation: (ratio - 1) * 100,
    annualizedRate: years > 0 ? (Math.pow(ratio, 1 / years) - 1) * 100 : 0,
    purchasingPowerChange: (1 / ratio - 1) * 100,
    years,
  };
}
