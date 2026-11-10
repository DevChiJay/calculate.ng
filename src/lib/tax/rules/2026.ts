import type { TaxRules } from "../types";

/**
 * Nigeria Tax Act 2025, in force from 1 January 2026.
 *
 * Verified against multiple independent commentaries (KPMG flash alert and others):
 *   - Bands (s.58 / Fourth Schedule), CRA abolished, rent relief 20% capped at ₦500,000.
 * NOT verified against the gazetted Act text (secondary sources only, and some disagree):
 *   - pension, NHF, NHIS and life-insurance deductions (s.30(2)(a)). They are modelled as
 *     amounts the user declares, never derived from gross, and flagged `verified: false`.
 * Check against the Act on nrs.gov.ng before relying on any figure marked unverified.
 */
export const RULES_2026: TaxRules = {
  id: "2026",
  label: "Nigeria Tax Act 2025 (from 1 Jan 2026)",
  legacy: false,
  effectiveFrom: "2026-01-01",
  lastChecked: "2026-11-10",
  sources: [
    {
      label: "KPMG: Nigeria Tax Act 2025 flash alert",
      url: "https://kpmg.com/xx/en/our-insights/gms-flash-alert/flash-alert-2025-168.html",
    },
    { label: "Nigeria Revenue Service (Act text)", url: "https://www.nrs.gov.ng" },
  ],
  bands: [
    { upTo: 800_000, rate: 0 },
    { upTo: 3_000_000, rate: 15 },
    { upTo: 12_000_000, rate: 18 },
    { upTo: 25_000_000, rate: 21 },
    { upTo: 50_000_000, rate: 23 },
    { upTo: null, rate: 25 },
  ],
  rentRelief: { pct: 20, cap: 500_000, verified: true },
  deductions: [
    {
      id: "pension",
      label: "Pension (employee contribution)",
      basis: "Your own contribution, usually 8% of basic + housing + transport",
      payrollDeduction: true,
      verified: false,
    },
    {
      id: "nhf",
      label: "National Housing Fund",
      basis: "Usually 2.5% of basic salary, if deducted from your pay",
      payrollDeduction: true,
      verified: false,
    },
    {
      id: "nhis",
      label: "Health insurance (NHIS)",
      basis: "Your own contribution, if deducted from your pay",
      payrollDeduction: true,
      verified: false,
    },
    {
      id: "lifeInsurance",
      label: "Life insurance premium",
      basis: "Premium paid on your own or your spouse’s life",
      payrollDeduction: false,
      verified: false,
    },
  ],
  notModelled: [
    "Interest on a loan for an owner-occupied home",
    "Any minimum tax for individuals (not confirmed in the Act)",
    "Minimum-wage exemption and other exemptions",
    "Income other than regular employment income, such as business or investment income",
    "State-level or employer-specific arrangements",
  ],
};
