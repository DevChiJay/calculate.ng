/**
 * Loan repayment maths for Nigerian lending, where rates are often quoted on a FLAT basis (interest on the
 * original amount for the whole term) or per MONTH, not just as a yearly reducing-balance rate.
 * Pure functions: callers should run `validateLoanInputs` first.
 */
import { effectiveAnnual, irr, monthlyPayment } from "./finance";

export type RateType = "reducing" | "flat";
export type RatePeriod = "year" | "month";

export interface LoanInputs {
  amount: number;
  /** Percent, e.g. 20 for 20%. Per `ratePeriod`. */
  rate: number;
  ratePeriod: RatePeriod;
  type: RateType;
  termMonths: number;
  /** Upfront fee as a percent of the amount, deducted from what the borrower receives. 0 if none. */
  feePercent: number;
}

export interface LoanFieldError {
  field: "amount" | "rate" | "term" | "fee";
  message: string;
}

const MAX_AMOUNT = 1e12;
const MAX_TERM_MONTHS = 360;

export function validateLoanInputs(inputs: LoanInputs): LoanFieldError[] {
  const errors: LoanFieldError[] = [];
  if (!Number.isFinite(inputs.amount) || inputs.amount <= 0) {
    errors.push({ field: "amount", message: "Enter a loan amount greater than ₦0." });
  } else if (inputs.amount > MAX_AMOUNT) {
    errors.push({ field: "amount", message: "That amount is too large to calculate. Please check it." });
  }

  const maxRate = inputs.ratePeriod === "month" ? 50 : 500;
  if (!Number.isFinite(inputs.rate) || inputs.rate < 0) {
    errors.push({ field: "rate", message: "Enter an interest rate of 0% or more." });
  } else if (inputs.rate > maxRate) {
    errors.push({ field: "rate", message: `That rate looks too high. Please check it (maximum ${maxRate}% a ${inputs.ratePeriod}).` });
  }

  if (!Number.isInteger(inputs.termMonths) || inputs.termMonths < 1 || inputs.termMonths > MAX_TERM_MONTHS) {
    errors.push({ field: "term", message: `Enter a whole number of months from 1 to ${MAX_TERM_MONTHS}.` });
  }

  if (!Number.isFinite(inputs.feePercent) || inputs.feePercent < 0 || inputs.feePercent > 50) {
    errors.push({ field: "fee", message: "Enter a fee between 0% and 50%." });
  }
  return errors;
}

export interface ScheduleRow {
  month: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
}

export interface LoanResult {
  /** The regular monthly instalment. */
  monthlyPayment: number;
  totalInterest: number;
  /** Upfront fee, deducted from the amount received. */
  fee: number;
  netReceived: number;
  /** Everything paid in instalments. */
  totalRepayable: number;
  /** Interest plus fee: what the loan costs beyond the amount borrowed. */
  totalCost: number;
  /** The monthly rate that makes the instalments exactly repay what was actually received. */
  monthlyRate: number;
  /** monthlyRate × 12: how lenders usually quote a "reducing balance" equivalent. */
  nominalAnnualRate: number;
  /** (1 + monthlyRate)^12 − 1: the true yearly cost once compounding is counted. */
  effectiveAnnualRate: number;
  schedule: ScheduleRow[];
}

export function calculateLoan(inputs: LoanInputs): LoanResult {
  const { amount: P, rate, ratePeriod, type, termMonths: n } = inputs;
  const fee = (P * inputs.feePercent) / 100;
  const netReceived = P - fee;

  const schedule: ScheduleRow[] = [];
  let payment: number;
  let totalInterest: number;

  if (type === "flat") {
    // Interest on the original amount for the whole term. Multiply before dividing so whole-naira cases stay exact.
    totalInterest = ratePeriod === "year" ? (P * rate * n) / 1200 : (P * rate * n) / 100;
    payment = (P + totalInterest) / n;
    const monthlyInterest = totalInterest / n;
    const monthlyPrincipal = P / n;
    let balance = P;
    for (let month = 1; month <= n; month++) {
      balance = month === n ? 0 : balance - monthlyPrincipal;
      schedule.push({ month, payment, interest: monthlyInterest, principal: monthlyPrincipal, balance });
    }
  } else {
    const r = ratePeriod === "year" ? rate / 1200 : rate / 100;
    payment = monthlyPayment(P, r, n);
    let balance = P;
    for (let month = 1; month <= n; month++) {
      const interest = balance * r;
      const principal = payment - interest;
      balance = month === n ? 0 : balance - principal;
      schedule.push({ month, payment, interest, principal, balance });
    }
    totalInterest = payment * n - P;
  }

  const totalRepayable = payment * n;
  const monthlyRate = irr([netReceived, ...Array.from({ length: n }, () => -payment)]);

  return {
    monthlyPayment: payment,
    totalInterest,
    fee,
    netReceived,
    totalRepayable,
    totalCost: totalInterest + fee,
    monthlyRate,
    nominalAnnualRate: monthlyRate * 12,
    effectiveAnnualRate: effectiveAnnual(monthlyRate),
    schedule,
  };
}
