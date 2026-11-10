import type { TaxRules } from "../types";

/**
 * Personal Income Tax Act (as amended 2011), the regime replaced on 1 January 2026.
 * Kept only so users can compare "old vs new". Deductions use the same declared inputs
 * as the 2026 rules so the comparison is like-for-like.
 *
 * CRA = greater of ₦200,000 or 1% of gross income, plus 20% of gross income.
 * Minimum tax = 1% of gross income, charged when higher than the computed tax.
 */
export const RULES_2024: TaxRules = {
  id: "2024",
  label: "Previous rules (PITA, up to 31 Dec 2025)",
  legacy: true,
  effectiveFrom: "2011-01-01",
  effectiveTo: "2025-12-31",
  lastChecked: "2026-11-10",
  sources: [
    {
      label: "KPMG: Nigeria Tax Act 2025 flash alert (describes the change)",
      url: "https://kpmg.com/xx/en/our-insights/gms-flash-alert/flash-alert-2025-168.html",
    },
  ],
  bands: [
    { upTo: 300_000, rate: 7 },
    { upTo: 600_000, rate: 11 },
    { upTo: 1_100_000, rate: 15 },
    { upTo: 1_600_000, rate: 19 },
    { upTo: 3_200_000, rate: 21 },
    { upTo: null, rate: 24 },
  ],
  cra: { fixed: 200_000, floorPctOfGross: 1, pctOfGross: 20 },
  minimumTax: { pctOfGross: 1 },
  deductions: [
    {
      id: "pension",
      label: "Pension (employee contribution)",
      basis: "Your own contribution, usually 8% of basic + housing + transport",
      payrollDeduction: true,
      verified: true,
    },
    {
      id: "nhf",
      label: "National Housing Fund",
      basis: "Usually 2.5% of basic salary, if deducted from your pay",
      payrollDeduction: true,
      verified: true,
    },
    {
      id: "nhis",
      label: "Health insurance (NHIS)",
      basis: "Your own contribution, if deducted from your pay",
      payrollDeduction: true,
      verified: true,
    },
    {
      id: "lifeInsurance",
      label: "Life insurance premium",
      basis: "Premium paid on your own or your spouse’s life",
      payrollDeduction: false,
      verified: true,
    },
  ],
  notModelled: [
    "Other personal reliefs (for example disability or dependants)",
    "Income other than regular employment income",
  ],
};
