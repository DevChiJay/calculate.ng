import { computeTax } from "./engine";
import type { FieldError, TaxComputation, TaxInputs, TaxRules, ValidationResult } from "./types";

/**
 * Net-to-gross: the gross income needed for a chosen take-home. It reuses the same inputs as `computeTax`,
 * except that `amount` is the take-home you want (per `period`), not the gross.
 */

const MAX_AMOUNT = 1e12;
const DEDUCTION_FIELDS = ["rentPaid", "pension", "nhf", "nhis", "lifeInsurance"] as const;

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function validateGrossUpInputs(inputs: TaxInputs): ValidationResult {
  const errors: FieldError[] = [];

  if (!Number.isFinite(inputs.amount) || inputs.amount <= 0) {
    errors.push({ field: "amount", message: "Enter a take-home amount greater than ₦0." });
  } else if (inputs.amount > MAX_AMOUNT) {
    errors.push({ field: "amount", message: "That amount is too large to calculate. Please check it." });
  }

  // Unlike the PAYE form, deductions are not capped at the amount: they come out of the (larger) gross.
  for (const field of DEDUCTION_FIELDS) {
    const v = inputs[field];
    if (!Number.isFinite(v) || v < 0) errors.push({ field, message: "Enter ₦0 or more." });
  }

  return errors.length === 0 ? { ok: true } : { ok: false, errors };
}

/**
 * Finds the gross income whose take-home equals `inputs.amount`, then returns the full tax workings at that
 * gross. Call `validateGrossUpInputs` first.
 *
 * Take-home(g) = g − tax(g) − payrollDeductions. Marginal tax is at most 25%, so take-home rises by at least
 * 0.75 for every extra naira of gross. It is therefore strictly increasing, and a bounded bisection is exact:
 *   gross ≥ target + payrollDeductions (tax is never negative)
 *   gross ≤ (target + payrollDeductions) ÷ 0.75 (tax is at most 25% of gross)
 */
export function solveGross(inputs: TaxInputs, rules: TaxRules): TaxComputation {
  const k = inputs.period === "monthly" ? 12 : 1;
  const annual = {
    target: inputs.amount * k,
    rentPaid: inputs.rentPaid * k,
    pension: inputs.pension * k,
    nhf: inputs.nhf * k,
    nhis: inputs.nhis * k,
    lifeInsurance: inputs.lifeInsurance * k,
  };

  const payrollDeductions = rules.deductions
    .filter((d) => d.payrollDeduction)
    .reduce((sum, d) => sum + annual[d.id], 0);

  const takeHomeAt = (gross: number) =>
    computeTax(
      {
        amount: gross,
        period: "annual",
        rentPaid: annual.rentPaid,
        pension: annual.pension,
        nhf: annual.nhf,
        nhis: annual.nhis,
        lifeInsurance: annual.lifeInsurance,
      },
      rules,
    ).annual.takeHome;

  let lo = annual.target + payrollDeductions;
  let hi = lo / 0.75 + 1;
  for (let i = 0; i < 100 && hi - lo > 0.001; i++) {
    const mid = (lo + hi) / 2;
    if (takeHomeAt(mid) < annual.target) lo = mid;
    else hi = mid;
  }

  const gross = round2((lo + hi) / 2);
  return computeTax(
    {
      amount: gross,
      period: "annual",
      rentPaid: annual.rentPaid,
      pension: annual.pension,
      nhf: annual.nhf,
      nhis: annual.nhis,
      lifeInsurance: annual.lifeInsurance,
    },
    rules,
  );
}
