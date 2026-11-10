import { describe, expect, it } from "vitest";
import { effectiveAnnual, irr, monthlyPayment, round2 } from "./finance";

describe("round2", () => {
  it("rounds half up without floating point surprises", () => {
    expect(round2(1.005)).toBe(1.01);
    expect(round2(2.675)).toBe(2.68);
    expect(round2(9455.9567)).toBe(9455.96);
  });
});

describe("monthlyPayment (level instalments on a reducing balance)", () => {
  it("matches the standard annuity formula: ₦100,000 at 2% a month for 12 months = ₦9,455.96", () => {
    expect(round2(monthlyPayment(100_000, 0.02, 12))).toBe(9_455.96);
  });

  it("matches ₦500,000 at 20% a year (1.6667% a month) over 12 months ≈ ₦46,315", () => {
    const p = monthlyPayment(500_000, 0.2 / 12, 12);
    expect(p).toBeGreaterThan(46_300);
    expect(p).toBeLessThan(46_330);
  });

  it("is amount ÷ months at a 0% rate", () => {
    expect(monthlyPayment(120_000, 0, 12)).toBe(10_000);
  });

  it("amortises to zero: paying it every month clears the balance", () => {
    const P = 750_000;
    const r = 0.015;
    const n = 36;
    const pay = monthlyPayment(P, r, n);
    let balance = P;
    for (let i = 0; i < n; i++) balance = balance * (1 + r) - pay;
    expect(Math.abs(balance)).toBeLessThan(0.01);
  });
});

describe("irr", () => {
  it("finds a simple one-period rate", () => {
    expect(irr([-100, 110])).toBeCloseTo(0.1, 6);
  });

  it("finds a multi-period rate: −1000, then 600 twice ≈ 13.07%", () => {
    expect(irr([-1000, 600, 600])).toBeCloseTo(0.130662, 5);
  });

  it("works with the loan orientation (money in first, payments out after)", () => {
    // Borrow 1000, repay 600 twice: same rate from the other side.
    expect(irr([1000, -600, -600])).toBeCloseTo(0.130662, 5);
  });

  it("returns NaN when there is no sign change (no meaningful rate)", () => {
    expect(irr([100, 100, 100])).toBeNaN();
    expect(irr([])).toBeNaN();
  });
});

describe("effectiveAnnual", () => {
  it("compounds a monthly rate over 12 months", () => {
    expect(effectiveAnnual(0.01)).toBeCloseTo(0.126825, 6);
    expect(effectiveAnnual(0)).toBe(0);
  });
});
