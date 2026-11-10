/**
 * Types for the versioned Nigerian personal income tax (PAYE) engine.
 * Rules live in ./rules/*; the engine in ./engine.ts is pure and takes a rules object.
 */

export type RulesId = "2024" | "2026";

/** Money fields are entered per `period` and converted to annual by the engine. */
export type Period = "annual" | "monthly";

export interface TaxInputs {
  /** Gross employment income for the chosen period, in naira. */
  amount: number;
  period: Period;
  /** Rent paid for the chosen period. Only used by rules that grant rent relief. */
  rentPaid: number;
  /** Declared deductions for the chosen period. Never derived from gross. */
  pension: number;
  nhf: number;
  nhis: number;
  lifeInsurance: number;
}

export type DeductionId = "pension" | "nhf" | "nhis" | "lifeInsurance";
export type ReliefId = DeductionId | "rent" | "cra";

/** One progressive band. `upTo` is the cumulative taxable-income ceiling (null = no ceiling). */
export interface Band {
  upTo: number | null;
  /** Percentage, e.g. 15 for 15%. */
  rate: number;
}

export interface DeductionRule {
  id: DeductionId;
  label: string;
  /** What the user should enter, shown next to the field. */
  basis: string;
  /** True when it is taken out of pay (reduces take-home), false for insurance premiums. */
  payrollDeduction: boolean;
  /** False = sourced only from secondary commentary; surfaced to the user as "verify". */
  verified: boolean;
}

export interface TaxRules {
  id: RulesId;
  label: string;
  /** Legacy rules exist only so users can compare against the old regime. */
  legacy: boolean;
  /** ISO dates (YYYY-MM-DD). */
  effectiveFrom: string;
  effectiveTo?: string;
  lastChecked: string;
  sources: { label: string; url: string }[];
  bands: Band[];
  /** Pre-2026 Consolidated Relief Allowance: max(fixed, floorPct% of gross) + pct% of gross. */
  cra?: { fixed: number; floorPctOfGross: number; pctOfGross: number };
  /** 2026 rent relief: lower of pct% of annual rent and cap. */
  rentRelief?: { pct: number; cap: number; verified: boolean };
  /** Legacy minimum tax: pct% of gross, applied when higher than computed tax. */
  minimumTax?: { pctOfGross: number };
  deductions: DeductionRule[];
  /** Plain-language list of rules this version does not model. */
  notModelled: string[];
}

export interface ReliefLine {
  id: ReliefId;
  label: string;
  /** Annual naira amount deducted from taxable income. */
  amount: number;
  verified: boolean;
}

export interface BandResult {
  from: number;
  to: number | null;
  rate: number;
  taxableInBand: number;
  tax: number;
}

export interface PeriodFigures {
  gross: number;
  tax: number;
  takeHome: number;
}

export interface TaxComputation {
  rulesId: RulesId;
  reliefs: ReliefLine[];
  bands: BandResult[];
  annual: PeriodFigures & {
    reliefsTotal: number;
    taxableIncome: number;
    /** Tax ÷ gross, as a percentage. */
    effectiveRate: number;
    /** Rate on the next naira of taxable income, as a percentage. */
    marginalRate: number;
    minimumTaxApplied: boolean;
  };
  monthly: PeriodFigures;
}

export interface FieldError {
  field: keyof TaxInputs;
  message: string;
}

export type ValidationResult = { ok: true } | { ok: false; errors: FieldError[] };

export interface RegimeComparison {
  a: TaxComputation;
  b: TaxComputation;
  /** b − a. Negative means regime b taxes less. */
  annualDifference: number;
  monthlyDifference: number;
}
