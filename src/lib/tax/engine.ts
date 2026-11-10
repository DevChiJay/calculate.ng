import type {
  BandResult,
  DeductionId,
  FieldError,
  ReliefLine,
  TaxComputation,
  TaxInputs,
  TaxRules,
  ValidationResult,
} from "./types";

const MAX_AMOUNT = 1e12; // ₦1 trillion: guards against typos and float blow-ups

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const periodFactor = (period: TaxInputs["period"]) => (period === "monthly" ? 12 : 1);

const MONEY_FIELDS = ["rentPaid", "pension", "nhf", "nhis", "lifeInsurance"] as const;

export function validateTaxInputs(inputs: TaxInputs): ValidationResult {
  const errors: FieldError[] = [];

  if (!Number.isFinite(inputs.amount) || inputs.amount <= 0) {
    errors.push({ field: "amount", message: "Enter an income greater than ₦0." });
  } else if (inputs.amount > MAX_AMOUNT) {
    errors.push({ field: "amount", message: "That amount is too large to calculate. Please check it." });
  }

  for (const field of MONEY_FIELDS) {
    const v = inputs[field];
    if (!Number.isFinite(v) || v < 0) {
      errors.push({ field, message: "Enter ₦0 or more." });
    } else if (field !== "rentPaid" && Number.isFinite(inputs.amount) && v > inputs.amount) {
      errors.push({ field, message: "This cannot be more than your income." });
    }
  }

  return errors.length === 0 ? { ok: true } : { ok: false, errors };
}

/** Taxes `taxable` through the progressive bands and returns the per-band breakdown. */
function applyBands(taxable: number, rules: TaxRules): { bands: BandResult[]; tax: number } {
  let from = 0;
  const bands: BandResult[] = [];
  for (const band of rules.bands) {
    const ceiling = band.upTo ?? Number.POSITIVE_INFINITY;
    const taxableInBand = Math.max(0, Math.min(taxable, ceiling) - from);
    bands.push({
      from,
      to: band.upTo,
      rate: band.rate,
      taxableInBand,
      tax: round2((taxableInBand * band.rate) / 100),
    });
    from = band.upTo ?? from;
  }
  return { bands, tax: bands.reduce((sum, b) => sum + b.tax, 0) };
}

/** Rate on the next naira of taxable income: the band with from <= taxable < upTo. */
function marginalRateFor(taxable: number, rules: TaxRules): number {
  for (const band of rules.bands) {
    if (band.upTo === null || taxable < band.upTo) return band.rate;
  }
  return rules.bands[rules.bands.length - 1].rate;
}

/**
 * Pure PAYE estimate. Callers should run `validateTaxInputs` first.
 * All amounts are converted to annual figures; the monthly view is annual ÷ 12.
 */
export function computeTax(inputs: TaxInputs, rules: TaxRules): TaxComputation {
  const k = periodFactor(inputs.period);
  const gross = round2(inputs.amount * k);

  const declared: Record<DeductionId, number> = {
    pension: round2(inputs.pension * k),
    nhf: round2(inputs.nhf * k),
    nhis: round2(inputs.nhis * k),
    lifeInsurance: round2(inputs.lifeInsurance * k),
  };

  const reliefs: ReliefLine[] = [];

  if (rules.cra) {
    const { fixed, floorPctOfGross, pctOfGross } = rules.cra;
    const floor = Math.max(fixed, (gross * floorPctOfGross) / 100);
    reliefs.push({
      id: "cra",
      label: "Consolidated Relief Allowance",
      amount: round2(floor + (gross * pctOfGross) / 100),
      verified: true,
    });
  }

  if (rules.rentRelief) {
    const rent = round2(inputs.rentPaid * k);
    reliefs.push({
      id: "rent",
      label: "Rent relief",
      amount: round2(Math.min((rent * rules.rentRelief.pct) / 100, rules.rentRelief.cap)),
      verified: rules.rentRelief.verified,
    });
  }

  let payrollDeductions = 0;
  for (const rule of rules.deductions) {
    const amount = declared[rule.id];
    reliefs.push({ id: rule.id, label: rule.label, amount, verified: rule.verified });
    if (rule.payrollDeduction) payrollDeductions += amount;
  }

  const reliefsTotal = round2(reliefs.reduce((sum, r) => sum + r.amount, 0));
  const taxableIncome = round2(Math.max(0, gross - reliefsTotal));

  const { bands, tax: bandTax } = applyBands(taxableIncome, rules);

  let tax = bandTax;
  let minimumTaxApplied = false;
  if (rules.minimumTax) {
    const minimum = round2((gross * rules.minimumTax.pctOfGross) / 100);
    if (minimum > tax) {
      tax = minimum;
      minimumTaxApplied = true;
    }
  }
  tax = round2(tax);

  const takeHome = round2(gross - tax - payrollDeductions);

  return {
    rulesId: rules.id,
    reliefs,
    bands,
    annual: {
      gross,
      tax,
      takeHome,
      reliefsTotal,
      taxableIncome,
      effectiveRate: gross > 0 ? (tax / gross) * 100 : 0,
      marginalRate: marginalRateFor(taxableIncome, rules),
      minimumTaxApplied,
    },
    monthly: {
      gross: round2(gross / 12),
      tax: round2(tax / 12),
      takeHome: round2(takeHome / 12),
    },
  };
}
