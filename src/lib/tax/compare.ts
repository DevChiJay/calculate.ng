import { computeTax } from "./engine";
import { RULES } from "./rules";
import type { RegimeComparison, RulesId, TaxInputs } from "./types";

/** Runs the same inputs through two rule sets. `annualDifference` is b − a. */
export function compareRegimes(inputs: TaxInputs, a: RulesId, b: RulesId): RegimeComparison {
  const resultA = computeTax(inputs, RULES[a]);
  const resultB = computeTax(inputs, RULES[b]);
  const annualDifference = Math.round((resultB.annual.tax - resultA.annual.tax) * 100) / 100;
  return {
    a: resultA,
    b: resultB,
    annualDifference,
    monthlyDifference: Math.round((annualDifference / 12) * 100) / 100,
  };
}
