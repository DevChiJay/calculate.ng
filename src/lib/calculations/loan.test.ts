import { describe, expect, it } from "vitest";
import { calculateLoan, validateLoanInputs, type LoanInputs } from "./loan";
import { round2 } from "./finance";

const loan = (over: Partial<LoanInputs> = {}): LoanInputs => ({
  amount: 500_000,
  rate: 20,
  ratePeriod: "year",
  type: "reducing",
  termMonths: 12,
  feePercent: 0,
  ...over,
});

describe("flat rate loans", () => {
  it("charges interest on the original amount for the whole term: ₦500,000 at 20% flat for 12 months", () => {
    const r = calculateLoan(loan({ type: "flat" }));
    expect(r.totalInterest).toBe(100_000);
    expect(r.totalRepayable).toBe(600_000);
    expect(r.monthlyPayment).toBe(50_000);
  });

  it("scales a yearly flat rate by the term in years", () => {
    // 20% a year for 6 months = 10% of the amount
    expect(calculateLoan(loan({ type: "flat", termMonths: 6 })).totalInterest).toBe(50_000);
  });

  it("treats a monthly flat rate as a charge per month: ₦100,000 at 5% a month flat for 6 months", () => {
    const r = calculateLoan(loan({ amount: 100_000, rate: 5, ratePeriod: "month", type: "flat", termMonths: 6 }));
    expect(r.totalInterest).toBe(30_000);
    expect(round2(r.monthlyPayment)).toBe(21_666.67);
  });

  it("repays principal evenly and interest evenly in the schedule", () => {
    const r = calculateLoan(loan({ type: "flat" }));
    expect(r.schedule[0].principal).toBeCloseTo(500_000 / 12, 6);
    expect(r.schedule[0].interest).toBeCloseTo(100_000 / 12, 6);
    expect(r.schedule[11].balance).toBeCloseTo(0, 6);
  });
});

describe("reducing balance loans", () => {
  it("matches the annuity value for ₦100,000 at 2% a month over 12 months: ₦9,455.96", () => {
    const r = calculateLoan(loan({ amount: 100_000, rate: 2, ratePeriod: "month" }));
    expect(round2(r.monthlyPayment)).toBe(9_455.96);
  });

  it("uses a yearly rate ÷ 12: ₦500,000 at 20% a year over 12 months ≈ ₦46,315 a month", () => {
    const r = calculateLoan(loan());
    expect(r.monthlyPayment).toBeGreaterThan(46_300);
    expect(r.monthlyPayment).toBeLessThan(46_330);
    expect(r.totalInterest).toBeCloseTo(r.monthlyPayment * 12 - 500_000, 6);
  });

  it("amortises exactly: balance ends at zero, principal repaid equals the amount, interest adds up", () => {
    const r = calculateLoan(loan({ amount: 2_000_000, rate: 24, termMonths: 36 }));
    expect(r.schedule).toHaveLength(36);
    expect(Math.abs(r.schedule[35].balance)).toBeLessThan(0.01);
    const principal = r.schedule.reduce((s, row) => s + row.principal, 0);
    const interest = r.schedule.reduce((s, row) => s + row.interest, 0);
    expect(principal).toBeCloseTo(2_000_000, 4);
    expect(interest).toBeCloseTo(r.totalInterest, 4);
  });

  it("charges more interest in early months than later ones", () => {
    const r = calculateLoan(loan({ termMonths: 24 }));
    expect(r.schedule[0].interest).toBeGreaterThan(r.schedule[23].interest);
  });

  it("handles a 0% rate", () => {
    const r = calculateLoan(loan({ rate: 0, termMonths: 10 }));
    expect(r.monthlyPayment).toBe(50_000);
    expect(r.totalInterest).toBe(0);
    expect(r.effectiveAnnualRate).toBeCloseTo(0, 9);
  });
});

describe("effective annual rate (the true cost)", () => {
  /** Independent check: find the monthly rate that makes the instalments worth exactly what was received. */
  const monthlyRateBySearch = (received: number, pay: number, n: number) => {
    let best = 0;
    let bestErr = Infinity;
    for (let i = 0; i <= 0.2; i += 0.000001) {
      const pv = pay * ((1 - Math.pow(1 + i, -n)) / i || n);
      const err = Math.abs(pv - received);
      if (err < bestErr) {
        bestErr = err;
        best = i;
      }
    }
    return best;
  };

  it("for a reducing loan with no fee it equals the quoted rate compounded monthly", () => {
    const r = calculateLoan(loan({ rate: 18 }));
    expect(r.monthlyRate).toBeCloseTo(0.015, 8);
    expect(r.effectiveAnnualRate).toBeCloseTo(Math.pow(1.015, 12) - 1, 7);
  });

  it("is far higher than the headline for a flat loan: 20% flat ≈ 35% a year nominal", () => {
    const r = calculateLoan(loan({ type: "flat" }));
    const independent = monthlyRateBySearch(500_000, 50_000, 12);
    expect(r.monthlyRate).toBeCloseTo(independent, 5);
    expect(r.nominalAnnualRate).toBeGreaterThan(0.34);
    expect(r.nominalAnnualRate).toBeLessThan(0.37);
    expect(r.effectiveAnnualRate).toBeGreaterThan(r.nominalAnnualRate);
  });

  it("rises when an upfront fee reduces what you receive", () => {
    const without = calculateLoan(loan());
    const withFee = calculateLoan(loan({ feePercent: 2 }));
    expect(withFee.fee).toBe(10_000);
    expect(withFee.netReceived).toBe(490_000);
    expect(withFee.effectiveAnnualRate).toBeGreaterThan(without.effectiveAnnualRate);
    expect(withFee.totalCost).toBeCloseTo(withFee.totalInterest + 10_000, 6);
    // The payment is unchanged: the fee comes off what you receive, it does not change what you repay.
    expect(withFee.monthlyPayment).toBeCloseTo(without.monthlyPayment, 8);
  });
});

describe("validateLoanInputs", () => {
  it("accepts a normal request", () => {
    expect(validateLoanInputs(loan())).toEqual([]);
  });

  it.each([[0], [-1], [Number.NaN], [1e15]])("rejects amount %s", (amount) => {
    expect(validateLoanInputs(loan({ amount })).map((e) => e.field)).toContain("amount");
  });

  it("rejects negative or absurd rates, and allows 0", () => {
    expect(validateLoanInputs(loan({ rate: -1 })).map((e) => e.field)).toContain("rate");
    expect(validateLoanInputs(loan({ rate: Number.NaN })).map((e) => e.field)).toContain("rate");
    expect(validateLoanInputs(loan({ rate: 600 })).map((e) => e.field)).toContain("rate");
    expect(validateLoanInputs(loan({ rate: 60, ratePeriod: "month" })).map((e) => e.field)).toContain("rate");
    expect(validateLoanInputs(loan({ rate: 0 }))).toEqual([]);
  });

  it("requires a whole number of months between 1 and 360", () => {
    for (const termMonths of [0, -3, 361, 2.5, Number.NaN]) {
      expect(validateLoanInputs(loan({ termMonths })).map((e) => e.field), String(termMonths)).toContain("term");
    }
    expect(validateLoanInputs(loan({ termMonths: 360 }))).toEqual([]);
  });

  it("limits the fee to 0–50%", () => {
    expect(validateLoanInputs(loan({ feePercent: -1 })).map((e) => e.field)).toContain("fee");
    expect(validateLoanInputs(loan({ feePercent: 51 })).map((e) => e.field)).toContain("fee");
    expect(validateLoanInputs(loan({ feePercent: 50 }))).toEqual([]);
  });
});
