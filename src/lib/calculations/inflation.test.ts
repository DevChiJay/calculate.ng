import { describe, expect, it } from "vitest";
import { calculateInflation, monthsBetween, parseYM, validateInflationInputs } from "./inflation";

const range = { min: "2010-01", max: "2024-12" };

describe("parseYM / monthsBetween", () => {
  it("parses YYYY-MM without time zones", () => {
    expect(parseYM("2020-01")).toEqual({ year: 2020, month: 1 });
    expect(parseYM("2020-13")).toBeNull();
    expect(parseYM("nope")).toBeNull();
  });

  it("counts whole months", () => {
    expect(monthsBetween("2020-01", "2024-12")).toBe(59);
    expect(monthsBetween("2020-05", "2020-05")).toBe(0);
    expect(monthsBetween("2021-01", "2020-01")).toBe(-12);
  });
});

describe("calculateInflation", () => {
  // CPI doubles over exactly 2 years: 100 → 200
  const cpi = (ym: string) => (ym === "2020-01" ? 100 : ym === "2022-01" ? 200 : Number.NaN);
  const r = calculateInflation({ amount: 100_000, start: "2020-01", end: "2022-01" }, cpi);

  it("scales the amount by the CPI ratio", () => {
    expect(r.equivalentAmount).toBe(200_000);
    expect(r.totalInflation).toBe(100);
  });

  it("annualises over the real period", () => {
    expect(r.years).toBe(2);
    expect(r.annualizedRate).toBeCloseTo(41.421, 2); // √2 − 1
  });

  it("reports purchasing power lost correctly (50%, not 100%) when prices double", () => {
    expect(r.purchasingPowerChange).toBe(-50);
  });

  it("handles flat prices", () => {
    const flat = calculateInflation({ amount: 50_000, start: "2020-01", end: "2022-01" }, () => 100);
    expect(flat.equivalentAmount).toBe(50_000);
    expect(flat.totalInflation).toBe(0);
    expect(flat.purchasingPowerChange).toBe(0);
  });

  it("throws if the CPI lookup fails (callers validate first)", () => {
    expect(() => calculateInflation({ amount: 1, start: "2019-01", end: "2022-01" }, cpi)).toThrow();
  });
});

describe("validateInflationInputs", () => {
  const ok = { amount: 100_000, start: "2020-01", end: "2022-06" };

  it("accepts valid input", () => {
    expect(validateInflationInputs(ok, range)).toEqual([]);
  });

  it.each([[0], [-1], [Number.NaN], [1e15]])("rejects amount %s", (amount) => {
    const errs = validateInflationInputs({ ...ok, amount }, range);
    expect(errs.map((e) => e.field)).toContain("amount");
  });

  it("requires the end month to be after the start month", () => {
    const errs = validateInflationInputs({ ...ok, start: "2022-06", end: "2022-06" }, range);
    expect(errs.map((e) => e.field)).toContain("end");
  });

  it("rejects dates outside the data range with a readable message", () => {
    const early = validateInflationInputs({ ...ok, start: "2009-01" }, range);
    expect(early.find((e) => e.field === "start")?.message).toContain("January 2010");
    const late = validateInflationInputs({ ...ok, end: "2025-03" }, range);
    expect(late.find((e) => e.field === "end")?.message).toContain("December 2024");
  });

  it("rejects malformed dates", () => {
    const errs = validateInflationInputs({ ...ok, start: "" }, range);
    expect(errs.map((e) => e.field)).toContain("start");
  });
});
