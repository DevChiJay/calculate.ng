import { describe, expect, it } from "vitest";
import { computeTax } from "./engine";
import { solveGross, validateGrossUpInputs } from "./gross-up";
import { RULES } from "./rules";
import type { TaxInputs } from "./types";

const rules = RULES["2026"];
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

describe("solveGross (amount = the take-home you want)", () => {
  it("inverts hand-calculated cases", () => {
    // gross 3m → tax 330,000 → take-home 2,670,000
    expect(solveGross(base({ amount: 2_670_000 }), rules).annual.gross).toBeCloseTo(3_000_000, 1);
    // gross 12m → tax 1,950,000 → take-home 10,050,000
    expect(solveGross(base({ amount: 10_050_000 }), rules).annual.gross).toBeCloseTo(12_000_000, 1);
    // gross 50m → tax 10,430,000 → take-home 39,570,000
    expect(solveGross(base({ amount: 39_570_000 }), rules).annual.gross).toBeCloseTo(50_000_000, 1);
  });

  it("charges no tax up to ₦800,000, so gross equals take-home there", () => {
    const r = solveGross(base({ amount: 800_000 }), rules);
    expect(r.annual.gross).toBeCloseTo(800_000, 1);
    expect(r.annual.tax).toBe(0);
    expect(solveGross(base({ amount: 500_000 }), rules).annual.gross).toBeCloseTo(500_000, 1);
  });

  it("handles a non-round case inside the 18% band", () => {
    // take-home = 0.82·G + 210,000 for 3m < G ≤ 12m, so ₦6,000,000 → G = 5,790,000 ÷ 0.82
    const r = solveGross(base({ amount: 500_000, period: "monthly" }), rules);
    expect(r.annual.gross).toBeCloseTo(7_060_975.61, 1);
    expect(r.monthly.gross).toBeCloseTo(588_414.63, 1);
    expect(r.annual.takeHome).toBeCloseTo(6_000_000, 1);
  });

  it("round-trips through computeTax across every band and both periods", () => {
    const targets = [100_000, 799_999, 1_200_000, 2_670_000, 6_000_000, 9_780_000, 20_000_000, 40_000_000, 80_000_000];
    for (const period of ["annual", "monthly"] as const) {
      for (const t of targets) {
        const target = period === "monthly" ? t / 12 : t;
        const solved = solveGross(base({ amount: target, period }), rules);
        const back = computeTax(base({ amount: solved.annual.gross, period: "annual" }), rules);
        expect(Math.abs(back.annual.takeHome - t), `${period} ${t}`).toBeLessThan(0.05);
      }
    }
  });

  it("includes rent relief (same take-home needs less gross)", () => {
    // gross 5m, rent 1.2m: relief 240,000, tax 646,800, take-home 4,353,200
    const r = solveGross(base({ amount: 4_353_200, rentPaid: 1_200_000 }), rules);
    expect(r.annual.gross).toBeCloseTo(5_000_000, 1);
    const noRent = solveGross(base({ amount: 4_353_200 }), rules);
    expect(noRent.annual.gross).toBeGreaterThan(r.annual.gross);
  });

  it("includes declared payroll deductions that come out of pay", () => {
    // gross 5m, pension 300,000: tax 636,000, take-home 4,064,000
    const r = solveGross(base({ amount: 4_064_000, pension: 300_000 }), rules);
    expect(r.annual.gross).toBeCloseTo(5_000_000, 1);
    expect(r.annual.tax).toBeCloseTo(636_000, 1);
  });

  it("treats life insurance as a relief only (it does not come out of pay)", () => {
    const r = solveGross(base({ amount: 4_000_000, lifeInsurance: 100_000 }), rules);
    const plain = solveGross(base({ amount: 4_000_000 }), rules);
    expect(r.annual.gross).toBeLessThan(plain.annual.gross);
    expect(r.annual.takeHome).toBeCloseTo(4_000_000, 1);
  });

  it("returns the full workings (bands and reliefs)", () => {
    const r = solveGross(base({ amount: 5_000_000 }), rules);
    expect(r.bands.length).toBe(rules.bands.length);
    expect(r.reliefs.length).toBeGreaterThan(0);
    expect(r.rulesId).toBe("2026");
  });
});

describe("validateGrossUpInputs", () => {
  it("accepts a normal request", () => {
    expect(validateGrossUpInputs(base({ amount: 400_000, period: "monthly" })).ok).toBe(true);
  });

  it.each([[0], [-1], [Number.NaN], [Number.POSITIVE_INFINITY], [1e15]])("rejects target take-home %s", (amount) => {
    const v = validateGrossUpInputs(base({ amount }));
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.errors.map((e) => e.field)).toContain("amount");
  });

  it("rejects negative or non-numeric deductions, but allows deductions above the take-home target", () => {
    const bad = validateGrossUpInputs(base({ amount: 1_000_000, pension: -1, nhf: Number.NaN }));
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.errors.map((e) => e.field).sort()).toEqual(["nhf", "pension"]);
    // 400k pension against a 300k take-home target is unusual but possible (it is paid out of the gross).
    expect(validateGrossUpInputs(base({ amount: 300_000, pension: 400_000 })).ok).toBe(true);
  });
});
