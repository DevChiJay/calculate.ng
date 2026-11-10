import { describe, expect, it } from "vitest";
import { BMI_CATEGORIES, calculateBMI, categoryForBMI, validateBMIInputs, type BMIInputs } from "./bmi";

const metric = (weight: number, height: number): BMIInputs => ({
  unit: "metric",
  weight,
  height,
  heightFeet: Number.NaN,
  heightInches: Number.NaN,
});
const imperial = (weight: number, feet: number, inches: number): BMIInputs => ({
  unit: "imperial",
  weight,
  height: Number.NaN,
  heightFeet: feet,
  heightInches: inches,
});

describe("calculateBMI", () => {
  it("computes metric BMI rounded to 1 decimal", () => {
    const r = calculateBMI(metric(70, 175));
    expect(r.bmi).toBe(22.9); // 70 / 1.75² = 22.857
    expect(r.category.id).toBe("normal");
  });

  it("converts imperial units", () => {
    const r = calculateBMI(imperial(154, 5, 9));
    expect(r.heightCm).toBeCloseTo(175.26, 2);
    expect(r.weightKg).toBeCloseTo(69.85, 2);
    expect(r.bmi).toBe(22.7);
  });

  it("chooses the category from the rounded value shown to the user", () => {
    // 24.96 displays as 25.0, so it must be "overweight", not "normal".
    const r = calculateBMI(metric(24.96, 100));
    expect(r.bmi).toBe(25);
    expect(r.category.id).toBe("overweight");
  });

  it("gives a healthy weight range for the height (BMI 18.5 to 24.9)", () => {
    const r = calculateBMI(metric(70, 175));
    expect(r.healthyRangeKg.min).toBeCloseTo(56.7, 1);
    expect(r.healthyRangeKg.max).toBeCloseTo(76.3, 1);
  });
});

describe("categoryForBMI (WHO adult cut-offs)", () => {
  it.each([
    [10, "underweight"],
    [18.4, "underweight"],
    [18.5, "normal"],
    [24.9, "normal"],
    [25, "overweight"],
    [29.9, "overweight"],
    [30, "obese1"],
    [34.9, "obese1"],
    [35, "obese2"],
    [39.9, "obese2"],
    [40, "obese3"],
    [60, "obese3"],
  ])("BMI %s → %s", (bmi, id) => {
    expect(categoryForBMI(bmi).id).toBe(id);
  });

  it("every category has risk text and advice (no missing keys)", () => {
    for (const c of BMI_CATEGORIES) {
      expect(c.risk.length).toBeGreaterThan(0);
      expect(c.advice.length).toBeGreaterThan(0);
    }
  });
});

describe("validateBMIInputs", () => {
  it("accepts sensible metric and imperial inputs", () => {
    expect(validateBMIInputs(metric(70, 175)).ok).toBe(true);
    expect(validateBMIInputs(imperial(154, 5, 9)).ok).toBe(true);
  });

  it("rejects 0 ft 0 in (previously passed validation then crashed)", () => {
    const v = validateBMIInputs(imperial(154, 0, 0));
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.errors.map((e) => e.field)).toContain("heightFeet");
  });

  it.each([
    ["weight too low", metric(1, 175), "weight"],
    ["weight too high", metric(900, 175), "weight"],
    ["height too low", metric(70, 20), "height"],
    ["height too high", metric(70, 400), "height"],
    ["negative weight", metric(-5, 175), "weight"],
    ["blank weight", metric(Number.NaN, 175), "weight"],
  ])("%s", (_name, input, field) => {
    const v = validateBMIInputs(input);
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.errors.map((e) => e.field)).toContain(field);
  });

  it("rejects inches of 12 or more", () => {
    const v = validateBMIInputs(imperial(154, 5, 12));
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.errors.map((e) => e.field)).toContain("heightInches");
  });

  it("treats blank inches as 0 when feet is given", () => {
    expect(validateBMIInputs(imperial(154, 5, Number.NaN)).ok).toBe(true);
    expect(calculateBMI(imperial(154, 5, Number.NaN)).heightCm).toBeCloseTo(152.4, 1);
  });
});
