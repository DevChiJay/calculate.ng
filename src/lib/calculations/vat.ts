/** VAT arithmetic. Pure functions; amounts are rounded to the kobo and net + VAT always equals gross exactly. */
import { round2 } from "./finance";

export interface VatBreakdown {
  net: number;
  vat: number;
  gross: number;
}

/** Add VAT to a price that does not include it. */
export function addVAT(net: number, ratePercent: number): VatBreakdown {
  const vat = round2((net * ratePercent) / 100);
  return { net, vat, gross: round2(net + vat) };
}

/**
 * Take VAT out of a price that already includes it: net = gross ÷ (1 + rate). The VAT is the difference, so it
 * is not "rate × gross" (₦10,000 including 7.5% VAT contains ₦697.67 of VAT, not ₦750).
 */
export function removeVAT(gross: number, ratePercent: number): VatBreakdown {
  const net = round2(gross / (1 + ratePercent / 100));
  return { net, vat: round2(gross - net), gross };
}

export interface VatFieldError {
  field: "amount" | "rate";
  message: string;
}

export function validateVATInputs(amount: number, ratePercent: number): VatFieldError[] {
  const errors: VatFieldError[] = [];
  if (!Number.isFinite(amount) || amount <= 0) {
    errors.push({ field: "amount", message: "Enter an amount greater than ₦0." });
  } else if (amount > 1e12) {
    errors.push({ field: "amount", message: "That amount is too large to calculate. Please check it." });
  }
  if (!Number.isFinite(ratePercent) || ratePercent < 0 || ratePercent > 100) {
    errors.push({ field: "rate", message: "Enter a VAT rate from 0% to 100%." });
  }
  return errors;
}
