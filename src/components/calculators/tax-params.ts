import type { Period, TaxInputs } from "@/lib/tax/types";
import { parseMoney, parseOptionalMoney } from "@/lib/utils/format";

/** Form state shared by the PAYE and net-to-gross calculators (strings, exactly as typed). */
export interface TaxFormState {
  period: Period;
  /** Gross income on the PAYE page; desired take-home on the net-to-gross page. */
  amount: string;
  rent: string;
  pension: string;
  nhf: string;
  nhis: string;
  life: string;
}

export const TAX_EMPTY: TaxFormState = {
  period: "monthly",
  amount: "",
  rent: "",
  pension: "",
  nhf: "",
  nhis: "",
  life: "",
};

/** Query-string keys for shareable links. Only the amount's key differs between the two calculators. */
const paramKeys = (amountKey: string): Record<keyof TaxFormState, string> => ({
  period: "period",
  amount: amountKey,
  rent: "rent",
  pension: "pension",
  nhf: "nhf",
  nhis: "nhis",
  life: "life",
});

export function readTaxParams(search: string, amountKey: string): TaxFormState {
  const keys = paramKeys(amountKey);
  const q = new URLSearchParams(search);
  const num = (k: string) => {
    const v = q.get(k) ?? "";
    return /^\d+(\.\d+)?$/.test(v) ? v : "";
  };
  return {
    period: q.get(keys.period) === "annual" ? "annual" : "monthly",
    amount: num(keys.amount),
    rent: num(keys.rent),
    pension: num(keys.pension),
    nhf: num(keys.nhf),
    nhis: num(keys.nhis),
    life: num(keys.life),
  };
}

export function writeTaxParams(form: TaxFormState, amountKey: string): string {
  const keys = paramKeys(amountKey);
  const q = new URLSearchParams();
  (Object.keys(keys) as (keyof TaxFormState)[]).forEach((k) => {
    const v = form[k].replace(/[₦,\s]/g, "");
    if (v && !(k === "period" && v === TAX_EMPTY.period)) q.set(keys[k], v);
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

export function toTaxInputs(form: TaxFormState): TaxInputs {
  return {
    amount: parseMoney(form.amount),
    period: form.period,
    rentPaid: parseOptionalMoney(form.rent),
    pension: parseOptionalMoney(form.pension),
    nhf: parseOptionalMoney(form.nhf),
    nhis: parseOptionalMoney(form.nhis),
    lifeInsurance: parseOptionalMoney(form.life),
  };
}
