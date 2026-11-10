/**
 * Nigerian VAT rules as data, in the same shape of thinking as the PAYE rules: effective date, last-checked
 * date, sources, and an explicit list of what the calculator does not model.
 *
 * Confirmed (several independent commentaries, including PwC and KJB, agree): the standard rate stayed at 7.5%
 * under the Nigeria Tax Act 2025, in force from 1 January 2026.
 * NOT confirmed: which supplies are zero-rated vs exempt (commentaries describe the split differently) and the
 * small-business exemption threshold (₦50m vs ₦100m turnover in different sources). The calculator therefore never
 * decides whether an item carries VAT: the person chooses the rate.
 */
export interface VatRules {
  /** Standard rate, as a percent. */
  rate: number;
  effectiveFrom: string;
  lastChecked: string;
  sources: { label: string; url: string }[];
  notModelled: string[];
}

export const VAT_RULES: VatRules = {
  rate: 7.5,
  effectiveFrom: "2026-01-01",
  lastChecked: "2026-11-10",
  sources: [
    { label: "PwC: The Nigerian Tax Reform Acts", url: "https://www.pwc.com/ng/en/publications/the-nigerian-tax-reform-acts.html" },
    { label: "KJB: VAT in 2026, same 7.5% rate", url: "https://www.kjb.ng/insights/vat-changes-input-vat-recovery" },
  ],
  notModelled: [
    "Whether a particular item is standard-rated, zero-rated or exempt",
    "Input VAT recovery and VAT returns for businesses",
    "Who must register for VAT (the small-business threshold is reported inconsistently)",
  ],
};
