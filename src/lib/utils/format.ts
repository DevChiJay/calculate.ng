/** Shared formatting and parsing helpers for naira and percentage values. */

const nairaFormatters = new Map<number, Intl.NumberFormat>();

/** Format as Nigerian naira, e.g. ₦1,250,000. Whole naira by default. */
export function formatNaira(amount: number, decimals = 0): string {
  if (!Number.isFinite(amount)) return "₦0";
  let f = nairaFormatters.get(decimals);
  if (!f) {
    f = new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    nairaFormatters.set(decimals, f);
  }
  return f.format(amount);
}

/** Format a percentage given as a plain number (12.3 → "12.3%"). */
export function formatPercent(value: number, decimals = 1): string {
  if (!Number.isFinite(value)) return "0%";
  return `${value.toFixed(decimals)}%`;
}

/** Parse a user-typed money string ("₦5,000,000", "5 000 000"). NaN when blank or invalid. */
export function parseMoney(input: string): number {
  const cleaned = input.replace(/[₦,\s]/g, "");
  if (cleaned === "") return Number.NaN;
  if (!/^\d*\.?\d+$|^\d+\.$/.test(cleaned)) return Number.NaN;
  return Number(cleaned);
}

/** Like parseMoney but a blank field counts as 0 (for optional inputs). */
export function parseOptionalMoney(input: string): number {
  return input.trim() === "" ? 0 : parseMoney(input);
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "2026-11-10" → "10 November 2026", parsed without time zones. */
export function formatIsoDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
}

/** Long month-year label from "YYYY-MM", parsed without time zones. */
export function formatMonthYear(ym: string): string {
  const m = /^(\d{4})-(\d{2})$/.exec(ym);
  if (!m) return ym;
  return `${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
}
