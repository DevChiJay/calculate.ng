import { describe, expect, it } from "vitest";
import { addVAT, removeVAT, validateVATInputs } from "./vat";
import { VAT_RULES } from "../vat/rules";

describe("VAT rules data", () => {
  it("has a 7.5% standard rate with dates and sources", () => {
    expect(VAT_RULES.rate).toBe(7.5);
    expect(VAT_RULES.effectiveFrom).toBe("2026-01-01");
    expect(VAT_RULES.lastChecked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(VAT_RULES.sources.length).toBeGreaterThan(0);
    expect(VAT_RULES.notModelled.length).toBeGreaterThan(0);
  });
});

describe("addVAT", () => {
  it("adds 7.5% to a price: ₦100,000 → ₦7,500 VAT, ₦107,500 total", () => {
    expect(addVAT(100_000, 7.5)).toEqual({ net: 100_000, vat: 7_500, gross: 107_500 });
  });

  it("rounds VAT to the kobo and keeps net + VAT = gross exactly", () => {
    const r = addVAT(19.99, 7.5); // VAT 1.49925 → 1.50
    expect(r.vat).toBe(1.5);
    expect(r.gross).toBe(21.49);
    expect(r.net + r.vat).toBeCloseTo(r.gross, 10);
  });

  it("handles a 0% (zero-rated) price", () => {
    expect(addVAT(5_000, 0)).toEqual({ net: 5_000, vat: 0, gross: 5_000 });
  });

  it("supports other rates", () => {
    expect(addVAT(1_000, 10)).toEqual({ net: 1_000, vat: 100, gross: 1_100 });
  });
});

describe("removeVAT", () => {
  it("takes VAT out of a total: ₦107,500 → ₦100,000 net, ₦7,500 VAT", () => {
    expect(removeVAT(107_500, 7.5)).toEqual({ net: 100_000, vat: 7_500, gross: 107_500 });
  });

  it("is not simply 7.5% of the total (a common mistake): ₦10,000 incl. VAT has ₦697.67 VAT, not ₦750", () => {
    const r = removeVAT(10_000, 7.5);
    expect(r.vat).toBe(697.67);
    expect(r.net).toBe(9_302.33);
  });

  it("keeps net + VAT = gross exactly after rounding", () => {
    for (const gross of [21.49, 1, 9_999.99, 123_456.78]) {
      const r = removeVAT(gross, 7.5);
      expect(r.net + r.vat).toBeCloseTo(gross, 8);
    }
  });

  it("handles 0%", () => {
    expect(removeVAT(5_000, 0)).toEqual({ net: 5_000, vat: 0, gross: 5_000 });
  });
});

describe("adding then removing VAT", () => {
  it("round-trips to the original price (within a kobo)", () => {
    for (const net of [1, 19.99, 250, 4_999.5, 100_000, 987_654.32]) {
      const back = removeVAT(addVAT(net, 7.5).gross, 7.5).net;
      expect(Math.abs(back - net), String(net)).toBeLessThanOrEqual(0.01);
    }
  });
});

describe("validateVATInputs", () => {
  it("accepts a normal amount and rate", () => {
    expect(validateVATInputs(100_000, 7.5)).toEqual([]);
    expect(validateVATInputs(1, 0)).toEqual([]);
  });

  it.each([[0], [-5], [Number.NaN], [Number.POSITIVE_INFINITY], [1e15]])("rejects amount %s", (amount) => {
    expect(validateVATInputs(amount, 7.5).map((e) => e.field)).toContain("amount");
  });

  it("limits the rate to 0–100%", () => {
    expect(validateVATInputs(100, -1).map((e) => e.field)).toContain("rate");
    expect(validateVATInputs(100, 101).map((e) => e.field)).toContain("rate");
    expect(validateVATInputs(100, Number.NaN).map((e) => e.field)).toContain("rate");
  });
});
