import { describe, expect, it } from "vitest";
import { calculateSavings, validateSavingsInputs, type SavingsInputs } from "./savings";
import { round2 } from "./finance";

const sv = (over: Partial<SavingsInputs> = {}): SavingsInputs => ({
  startingAmount: 100_000,
  monthlyTopUp: 0,
  annualRate: 10,
  months: 12,
  compounding: "monthly",
  ...over,
});

describe("monthly compounding", () => {
  it("₦100,000 at 10% a year compounded monthly for 1 year = ₦110,471.31", () => {
    const r = calculateSavings(sv());
    expect(round2(r.finalBalance)).toBe(110_471.31);
    expect(round2(r.interestEarned)).toBe(10_471.31);
    expect(r.totalPaidIn).toBe(100_000);
  });

  it("treats top-ups as an ordinary annuity: ₦10,000 a month at 1% a month for a year = ₦126,825.03", () => {
    const r = calculateSavings(sv({ startingAmount: 0, monthlyTopUp: 10_000, annualRate: 12 }));
    expect(round2(r.finalBalance)).toBe(126_825.03);
    expect(r.totalPaidIn).toBe(120_000);
  });

  it("combines a starting amount with top-ups", () => {
    const r = calculateSavings(sv({ startingAmount: 50_000, monthlyTopUp: 5_000, annualRate: 12 }));
    const lump = 50_000 * Math.pow(1.01, 12);
    const annuity = 5_000 * ((Math.pow(1.01, 12) - 1) / 0.01);
    expect(r.finalBalance).toBeCloseTo(lump + annuity, 6);
  });
});

describe("other compounding periods", () => {
  it("yearly: ₦100,000 at 10% is ₦110,000 after 1 year and ₦121,000 after 2", () => {
    expect(calculateSavings(sv({ compounding: "yearly" })).finalBalance).toBeCloseTo(110_000, 6);
    expect(calculateSavings(sv({ compounding: "yearly", months: 24 })).finalBalance).toBeCloseTo(121_000, 6);
  });

  it("quarterly: ₦100,000 at 8% for a year = ₦108,243.22", () => {
    const r = calculateSavings(sv({ annualRate: 8, compounding: "quarterly" }));
    expect(round2(r.finalBalance)).toBe(108_243.22);
  });

  it("top-ups made inside a period earn nothing until the next credit (stated rule)", () => {
    // Yearly compounding, 1 year: interest is only on the ₦100,000 held at the start. Top-ups add 120,000.
    const r = calculateSavings(sv({ monthlyTopUp: 10_000, annualRate: 12, compounding: "yearly" }));
    expect(r.finalBalance).toBeCloseTo(100_000 + 120_000 + 12_000, 6);
  });

  it("a partial final period earns no credit yet (14 months, quarterly: only 4 whole quarters credited)", () => {
    const a = calculateSavings(sv({ annualRate: 8, compounding: "quarterly", months: 14 }));
    const b = calculateSavings(sv({ annualRate: 8, compounding: "quarterly", months: 12 }));
    expect(a.finalBalance).toBeCloseTo(b.finalBalance, 6);
  });
});

describe("edge cases and totals", () => {
  it("0% rate: no interest, balance is what you paid in", () => {
    const r = calculateSavings(sv({ annualRate: 0, monthlyTopUp: 2_000, months: 10 }));
    expect(r.finalBalance).toBe(120_000);
    expect(r.interestEarned).toBe(0);
  });

  it("interest earned = final balance − everything paid in", () => {
    const r = calculateSavings(sv({ monthlyTopUp: 7_500, months: 60 }));
    expect(r.interestEarned).toBeCloseTo(r.finalBalance - r.totalPaidIn, 6);
    expect(r.totalPaidIn).toBe(100_000 + 7_500 * 60);
  });

  it("builds a year-by-year table whose figures add up", () => {
    const r = calculateSavings(sv({ monthlyTopUp: 5_000, months: 30 }));
    expect(r.years).toHaveLength(3); // 2 full years + 6 months
    expect(r.years.map((y) => y.year)).toEqual([1, 2, 3]);
    expect(r.years[2].balance).toBeCloseTo(r.finalBalance, 6);
    expect(r.years.reduce((s, y) => s + y.paidIn, 0)).toBe(5_000 * 30);
    expect(r.years.reduce((s, y) => s + y.interest, 0)).toBeCloseTo(r.interestEarned, 6);
  });
});

describe("validateSavingsInputs", () => {
  it("accepts a normal request, with a start or a top-up (or both)", () => {
    expect(validateSavingsInputs(sv())).toEqual([]);
    expect(validateSavingsInputs(sv({ startingAmount: 0, monthlyTopUp: 1_000 }))).toEqual([]);
  });

  it("needs something to save: both amounts zero is an error", () => {
    expect(validateSavingsInputs(sv({ startingAmount: 0, monthlyTopUp: 0 })).map((e) => e.field)).toContain("startingAmount");
  });

  it("rejects negative, non-numeric or absurd amounts", () => {
    expect(validateSavingsInputs(sv({ startingAmount: -1 })).map((e) => e.field)).toContain("startingAmount");
    expect(validateSavingsInputs(sv({ monthlyTopUp: Number.NaN })).map((e) => e.field)).toContain("monthlyTopUp");
    expect(validateSavingsInputs(sv({ startingAmount: 1e15 })).map((e) => e.field)).toContain("startingAmount");
  });

  it("limits the rate to 0–100% a year", () => {
    expect(validateSavingsInputs(sv({ annualRate: -1 })).map((e) => e.field)).toContain("annualRate");
    expect(validateSavingsInputs(sv({ annualRate: 101 })).map((e) => e.field)).toContain("annualRate");
    expect(validateSavingsInputs(sv({ annualRate: 0 }))).toEqual([]);
  });

  it("needs a whole number of months from 1 to 600", () => {
    for (const months of [0, -1, 601, 2.5, Number.NaN]) {
      expect(validateSavingsInputs(sv({ months })).map((e) => e.field), String(months)).toContain("months");
    }
    expect(validateSavingsInputs(sv({ months: 600 }))).toEqual([]);
  });
});
