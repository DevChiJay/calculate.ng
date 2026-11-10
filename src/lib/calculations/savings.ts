/**
 * Savings growth with optional monthly top-ups. Pure functions; run `validateSavingsInputs` first.
 *
 * Crediting rule (stated on the page): top-ups are added at the end of each month. Interest is credited at the
 * end of each compounding period on the balance at the START of that period, so a top-up earns interest from the
 * next period on. With monthly compounding this is exactly the standard "ordinary annuity" formula.
 * Not modelled: withholding tax on interest, account fees, and rate changes.
 */

export type Compounding = "monthly" | "quarterly" | "yearly";

export interface SavingsInputs {
  startingAmount: number;
  monthlyTopUp: number;
  /** Percent a year, e.g. 10 for 10%. */
  annualRate: number;
  months: number;
  compounding: Compounding;
}

export interface SavingsFieldError {
  field: "startingAmount" | "monthlyTopUp" | "annualRate" | "months";
  message: string;
}

export const COMPOUNDING_MONTHS: Record<Compounding, number> = { monthly: 1, quarterly: 3, yearly: 12 };

const MAX_AMOUNT = 1e12;
const MAX_MONTHS = 600;

export function validateSavingsInputs(inputs: SavingsInputs): SavingsFieldError[] {
  const errors: SavingsFieldError[] = [];
  const amountOk = (v: number) => Number.isFinite(v) && v >= 0 && v <= MAX_AMOUNT;

  if (!amountOk(inputs.startingAmount)) {
    errors.push({ field: "startingAmount", message: "Enter ₦0 or more (up to a trillion)." });
  }
  if (!amountOk(inputs.monthlyTopUp)) {
    errors.push({ field: "monthlyTopUp", message: "Enter ₦0 or more (up to a trillion)." });
  }
  if (amountOk(inputs.startingAmount) && amountOk(inputs.monthlyTopUp) && inputs.startingAmount === 0 && inputs.monthlyTopUp === 0) {
    errors.push({ field: "startingAmount", message: "Enter a starting amount or a monthly top-up to save." });
  }
  if (!Number.isFinite(inputs.annualRate) || inputs.annualRate < 0 || inputs.annualRate > 100) {
    errors.push({ field: "annualRate", message: "Enter a yearly interest rate from 0% to 100%." });
  }
  if (!Number.isInteger(inputs.months) || inputs.months < 1 || inputs.months > MAX_MONTHS) {
    errors.push({ field: "months", message: `Enter a whole number of months from 1 to ${MAX_MONTHS} (50 years).` });
  }
  return errors;
}

export interface YearRow {
  /** 1-based; the last row can cover fewer than 12 months. */
  year: number;
  paidIn: number;
  interest: number;
  /** Balance at the end of the row's period. */
  balance: number;
}

export interface SavingsResult {
  finalBalance: number;
  /** Starting amount plus every top-up. */
  totalPaidIn: number;
  interestEarned: number;
  years: YearRow[];
}

export function calculateSavings(inputs: SavingsInputs): SavingsResult {
  const { startingAmount, monthlyTopUp, annualRate, months, compounding } = inputs;
  const k = COMPOUNDING_MONTHS[compounding];
  const periodRate = (annualRate / 100) * (k / 12);

  let balance = startingAmount;
  let base = startingAmount; // the balance interest is calculated on at the next credit
  let yearPaid = 0;
  let yearInterest = 0;
  const years: YearRow[] = [];

  for (let m = 1; m <= months; m++) {
    balance += monthlyTopUp;
    yearPaid += monthlyTopUp;
    if (m % k === 0) {
      const interest = base * periodRate;
      balance += interest;
      yearInterest += interest;
      base = balance;
    }
    if (m % 12 === 0 || m === months) {
      years.push({ year: Math.ceil(m / 12), paidIn: yearPaid, interest: yearInterest, balance });
      yearPaid = 0;
      yearInterest = 0;
    }
  }

  const totalPaidIn = startingAmount + monthlyTopUp * months;
  return { finalBalance: balance, totalPaidIn, interestEarned: balance - totalPaidIn, years };
}
