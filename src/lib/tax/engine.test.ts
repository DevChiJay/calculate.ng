import { describe, expect, it } from "vitest";
import { computeTax, validateTaxInputs } from "./engine";
import { compareRegimes } from "./compare";
import { RULES, DEFAULT_RULES_ID } from "./rules";
import type { TaxInputs } from "./types";

const base = (over: Partial<TaxInputs> = {}): TaxInputs => ({
  amount: 0,
  period: "annual",
  rentPaid: 0,
  pension: 0,
  nhf: 0,
  nhis: 0,
  lifeInsurance: 0,
  ...over,
});

const tax2026 = (over: Partial<TaxInputs>) => computeTax(base(over), RULES["2026"]);
const tax2024 = (over: Partial<TaxInputs>) => computeTax(base(over), RULES["2024"]);

describe("2026 rules (Nigeria Tax Act 2025)", () => {
  it("defaults to the 2026 rules", () => {
    expect(DEFAULT_RULES_ID).toBe("2026");
  });

  it("charges nothing on the first ₦800,000", () => {
    const r = tax2026({ amount: 800_000 });
    expect(r.annual.tax).toBe(0);
    expect(r.annual.taxableIncome).toBe(800_000);
  });

  // Hand-calculated cumulative tax at each band ceiling.
  it.each([
    [3_000_000, 330_000], // 2.2m × 15%
    [12_000_000, 1_950_000], // + 9m × 18%
    [25_000_000, 4_680_000], // + 13m × 21%
    [50_000_000, 10_430_000], // + 25m × 23%
    [60_000_000, 12_930_000], // + 10m × 25%
  ])("gross ₦%i → tax ₦%i", (gross, expected) => {
    expect(tax2026({ amount: gross }).annual.tax).toBe(expected);
  });

  it("reports per-band breakdown that sums to the total", () => {
    const r = tax2026({ amount: 5_000_000 });
    const sum = r.bands.reduce((s, b) => s + b.tax, 0);
    expect(sum).toBe(r.annual.tax);
    expect(r.annual.tax).toBe(690_000); // 330,000 + 2m × 18%
    expect(r.bands.filter((b) => b.taxableInBand > 0)).toHaveLength(3);
  });

  it("applies rent relief at 20% of rent", () => {
    const r = tax2026({ amount: 5_000_000, rentPaid: 1_200_000 });
    const rent = r.reliefs.find((x) => x.id === "rent");
    expect(rent?.amount).toBe(240_000);
    expect(r.annual.taxableIncome).toBe(4_760_000);
    expect(r.annual.tax).toBe(646_800);
  });

  it("caps rent relief at ₦500,000", () => {
    const r = tax2026({ amount: 5_000_000, rentPaid: 4_000_000 });
    expect(r.reliefs.find((x) => x.id === "rent")?.amount).toBe(500_000);
    expect(r.annual.tax).toBe(600_000);
  });

  it("has no Consolidated Relief Allowance", () => {
    expect(tax2026({ amount: 5_000_000 }).reliefs.find((x) => x.id === "cra")).toBeUndefined();
  });

  it("deducts declared pension and subtracts payroll deductions from take-home", () => {
    const r = tax2026({ amount: 5_000_000, pension: 300_000 });
    expect(r.annual.taxableIncome).toBe(4_700_000);
    expect(r.annual.tax).toBe(636_000); // 330,000 + 1.7m × 18%
    expect(r.annual.takeHome).toBe(4_064_000); // 5,000,000 − 636,000 − 300,000
  });

  it("does not treat rent or life insurance as a payroll deduction", () => {
    const r = tax2026({ amount: 5_000_000, rentPaid: 1_000_000, lifeInsurance: 100_000 });
    expect(r.annual.takeHome).toBe(5_000_000 - r.annual.tax);
  });

  it("flags unverified deductions and lists what is not modelled", () => {
    const r = tax2026({ amount: 5_000_000, pension: 100_000 });
    expect(r.reliefs.find((x) => x.id === "pension")?.verified).toBe(false);
    expect(r.reliefs.find((x) => x.id === "rent")?.verified).toBe(true);
    expect(RULES["2026"].notModelled.length).toBeGreaterThan(0);
  });

  it("never produces negative taxable income", () => {
    const r = tax2026({ amount: 1_000_000, pension: 1_000_000 });
    expect(r.annual.taxableIncome).toBe(0);
    expect(r.annual.tax).toBe(0);
  });

  it("marginal rate is the rate on the next naira earned", () => {
    expect(tax2026({ amount: 500_000 }).annual.marginalRate).toBe(0);
    expect(tax2026({ amount: 800_000 }).annual.marginalRate).toBe(15);
    expect(tax2026({ amount: 5_000_000 }).annual.marginalRate).toBe(18);
    expect(tax2026({ amount: 90_000_000 }).annual.marginalRate).toBe(25);
  });

  it("effective rate is tax ÷ gross, as a percentage", () => {
    expect(tax2026({ amount: 3_000_000 }).annual.effectiveRate).toBeCloseTo(11, 5);
    expect(tax2026({ amount: 0.0 + 800_000 }).annual.effectiveRate).toBe(0);
  });
});

describe("monthly vs annual input", () => {
  it("treats monthly amounts as ×12 and returns both views", () => {
    const m = tax2026({ amount: 500_000, period: "monthly" });
    const a = tax2026({ amount: 6_000_000, period: "annual" });
    expect(m.annual.gross).toBe(6_000_000);
    expect(m.annual.tax).toBe(a.annual.tax);
    expect(m.annual.tax).toBe(870_000);
    expect(m.monthly.tax).toBe(72_500);
    expect(m.monthly.gross).toBe(500_000);
  });

  it("converts rent and deductions with the same period", () => {
    const m = tax2026({ amount: 500_000, period: "monthly", rentPaid: 100_000 });
    expect(m.reliefs.find((x) => x.id === "rent")?.amount).toBe(240_000); // 1.2m/yr × 20%
  });
});

describe("2024 legacy rules (PITA), for comparison", () => {
  it("computes CRA as max(₦200k, 1%) + 20% of gross", () => {
    const r = tax2024({ amount: 5_000_000 });
    expect(r.reliefs.find((x) => x.id === "cra")?.amount).toBe(1_200_000);
    expect(r.annual.taxableIncome).toBe(3_800_000);
    expect(r.annual.tax).toBe(704_000);
  });

  it("applies 1% minimum tax when it exceeds computed tax", () => {
    const r = tax2024({ amount: 300_000 });
    expect(r.annual.tax).toBe(3_000);
    expect(r.annual.minimumTaxApplied).toBe(true);
  });

  it("does not apply minimum tax when computed tax is higher", () => {
    expect(tax2024({ amount: 5_000_000 }).annual.minimumTaxApplied).toBe(false);
  });

  it("is marked legacy", () => {
    expect(RULES["2024"].legacy).toBe(true);
    expect(RULES["2026"].legacy).toBe(false);
  });
});

describe("compareRegimes", () => {
  it("returns both results and the annual difference (new − old)", () => {
    const c = compareRegimes(base({ amount: 5_000_000 }), "2024", "2026");
    expect(c.a.annual.tax).toBe(704_000);
    expect(c.b.annual.tax).toBe(690_000);
    expect(c.annualDifference).toBe(-14_000);
    expect(c.monthlyDifference).toBeCloseTo(-1_166.67, 2);
  });
});

describe("validateTaxInputs", () => {
  it("accepts a normal input", () => {
    const v = validateTaxInputs(base({ amount: 400_000, period: "monthly" }));
    expect(v.ok).toBe(true);
  });

  it.each([[0], [-5], [Number.NaN], [Number.POSITIVE_INFINITY]])(
    "rejects amount %s with a field-keyed error",
    (amount) => {
      const v = validateTaxInputs(base({ amount }));
      expect(v.ok).toBe(false);
      if (!v.ok) expect(v.errors.map((e) => e.field)).toContain("amount");
    },
  );

  it("rejects negative or oversized deductions", () => {
    const v = validateTaxInputs(base({ amount: 1_000_000, pension: -1, nhis: 2_000_000 }));
    expect(v.ok).toBe(false);
    if (!v.ok) {
      const fields = v.errors.map((e) => e.field);
      expect(fields).toContain("pension");
      expect(fields).toContain("nhis");
    }
  });

  it("rejects absurdly large amounts", () => {
    const v = validateTaxInputs(base({ amount: 1e15 }));
    expect(v.ok).toBe(false);
  });
});
