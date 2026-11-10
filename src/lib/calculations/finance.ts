/** Small financial helpers shared by the loan and savings calculators. Pure functions. */

/** Round to 2 decimals, half up, nudged so values like 1.005 are not lost to binary floating point. */
export function round2(n: number): number {
  return Math.round((n + 1e-9) * 100) / 100;
}

/** Level instalment that repays `principal` over `months` at `monthlyRate` (a fraction, e.g. 0.02 = 2%). */
export function monthlyPayment(principal: number, monthlyRate: number, months: number): number {
  if (monthlyRate === 0) return principal / months;
  const growth = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * growth) / (growth - 1);
}

/**
 * Internal rate of return per period for a series of cash flows (index 0 is now), by bisection between 0% and
 * 1000% a period. Returns NaN when the flows do not change sign, because there is then no rate to find.
 */
export function irr(cashflows: number[]): number {
  if (cashflows.length < 2) return Number.NaN;
  const npv = (rate: number) => cashflows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + rate, t), 0);
  let lo = 0;
  let hi = 10;
  const atLo = npv(lo);
  const atHi = npv(hi);
  if (!Number.isFinite(atLo) || !Number.isFinite(atHi) || atLo === 0) return atLo === 0 ? 0 : Number.NaN;
  if (Math.sign(atLo) === Math.sign(atHi)) return Number.NaN;
  for (let i = 0; i < 200 && hi - lo > 1e-12; i++) {
    const mid = (lo + hi) / 2;
    if (Math.sign(npv(mid)) === Math.sign(atLo)) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** The yearly rate that a monthly rate compounds to: (1 + i)^12 − 1, as a fraction. */
export function effectiveAnnual(monthlyRate: number): number {
  return Math.pow(1 + monthlyRate, 12) - 1;
}
