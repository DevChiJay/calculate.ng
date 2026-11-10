import { describe, expect, it } from "vitest";
import {
  SCALES,
  classifyDegree,
  computeResult,
  courseStatus,
  round2,
  validatePrevious,
  type Course,
} from "./cgpa";

const c = (units: number, grade: Course["grade"]): Course => ({ units, grade });

describe("round2", () => {
  it("rounds half up and is not fooled by binary floating point", () => {
    expect(round2(4.495)).toBe(4.5);
    expect(round2(2.675)).toBe(2.68);
    expect(round2(3.2727272727)).toBe(3.27);
    expect(round2(0)).toBe(0);
  });
});

describe("semester GPA (5.0 scale)", () => {
  it("is Σ(points × units) ÷ Σ units", () => {
    // 3·5 + 2·4 + 3·3 + 2·2 + 1·0 = 36 over 11 units = 3.2727
    const r = computeResult([c(3, "A"), c(2, "B"), c(3, "C"), c(2, "D"), c(1, "F")], "5.0");
    expect(r.semester?.qualityPoints).toBe(36);
    expect(r.semester?.units).toBe(11);
    expect(r.semester?.gpa).toBe(3.27);
  });

  it("counts a failed course's units in the denominator", () => {
    const withF = computeResult([c(3, "A"), c(3, "F")], "5.0");
    expect(withF.semester?.gpa).toBe(2.5); // 15 / 6
    const withoutF = computeResult([c(3, "A")], "5.0");
    expect(withoutF.semester?.gpa).toBe(5);
  });

  it("ignores rows with no units, no grade, or no valid units", () => {
    const r = computeResult([c(3, "B"), c(0, "A"), c(2, ""), c(Number.NaN, "A")], "5.0");
    expect(r.semester?.units).toBe(3);
    expect(r.semester?.gpa).toBe(4);
  });

  it("has no result when nothing is complete", () => {
    expect(computeResult([], "5.0").semester).toBeNull();
    expect(computeResult([c(3, "")], "5.0").semester).toBeNull();
    expect(computeResult([c(3, "")], "5.0").cgpa).toBeNull();
  });
});

describe("4.0 scale", () => {
  it("uses A4 B3 C2 D1 F0", () => {
    const r = computeResult([c(3, "A"), c(3, "B")], "4.0");
    expect(r.semester?.gpa).toBe(3.5);
    expect(SCALES["4.0"].grades.map((g) => g.points)).toEqual([4, 3, 2, 1, 0]);
  });

  it("does not offer an E grade", () => {
    expect(SCALES["4.0"].grades.some((g) => g.grade === "E")).toBe(false);
    expect(courseStatus(c(3, "E"), "4.0")).toBe("incomplete");
  });

  it("gives no degree class (we have no source for 4.0-scale bands)", () => {
    expect(computeResult([c(3, "A")], "4.0").degreeClass).toBeNull();
    expect(classifyDegree(3.9, "4.0")).toBeNull();
  });
});

describe("cumulative CGPA", () => {
  it("weights earlier semesters by their units", () => {
    // previous 3.80 over 60 units = 228 quality points.
    // This semester: 10·4 + 10·5 = 90 points over 20 units = 4.50 GPA.
    // Cumulative = (228 + 90) / 80 = 3.975, shown as 3.98.
    const r = computeResult([c(10, "B"), c(10, "A")], "5.0", { cgpa: 3.8, units: 60 });
    expect(r.semester?.gpa).toBe(4.5);
    expect(r.cgpa?.value).toBe(3.98);
    expect(r.cgpa?.units).toBe(80);
  });

  it("leaves the CGPA unchanged when the new semester's GPA equals it", () => {
    // previous 4.00 over 60 units = 240 points; 20 units of B = 80 points; 320 / 80 = 4.00
    const r = computeResult([c(20, "B")], "5.0", { cgpa: 4.0, units: 60 });
    expect(r.cgpa?.value).toBe(4);
  });

  it("is just the previous CGPA when there are no courses this semester", () => {
    const r = computeResult([], "5.0", { cgpa: 3.42, units: 90 });
    expect(r.semester).toBeNull();
    expect(r.cgpa?.value).toBe(3.42);
    expect(r.degreeClass?.id).toBe("second-lower");
  });

  it("equals the semester GPA when there is no previous record", () => {
    const r = computeResult([c(3, "A"), c(3, "C")], "5.0");
    expect(r.cgpa?.value).toBe(r.semester?.gpa);
  });
});

describe("degree class (5.0 scale)", () => {
  it.each([
    [5.0, "first"],
    [4.5, "first"],
    [4.49, "second-upper"],
    [3.5, "second-upper"],
    [3.49, "second-lower"],
    [2.4, "second-lower"],
    [2.39, "third"],
    [1.5, "third"],
    [1.49, "pass"],
    [1.0, "pass"],
  ])("CGPA %s → %s", (cgpa, id) => {
    expect(classifyDegree(cgpa, "5.0")?.id).toBe(id);
  });

  it("gives no class below 1.00", () => {
    expect(classifyDegree(0.99, "5.0")).toBeNull();
    expect(classifyDegree(0, "5.0")).toBeNull();
  });

  it("classifies from the rounded value shown to the user (4.495 displays as 4.50, a First)", () => {
    expect(classifyDegree(round2(4.495), "5.0")?.id).toBe("first");
  });
});

describe("courseStatus", () => {
  it("separates empty, incomplete and ready rows", () => {
    expect(courseStatus({ units: Number.NaN, grade: "" }, "5.0")).toBe("empty");
    expect(courseStatus(c(3, ""), "5.0")).toBe("incomplete");
    expect(courseStatus({ units: Number.NaN, grade: "A" }, "5.0")).toBe("incomplete");
    expect(courseStatus(c(0, "A"), "5.0")).toBe("incomplete");
    expect(courseStatus(c(3, "A"), "5.0")).toBe("ready");
  });
});

describe("validatePrevious", () => {
  it("accepts a sensible earlier record", () => {
    expect(validatePrevious({ cgpa: 3.5, units: 60 }, "5.0")).toEqual([]);
  });

  it("rejects a CGPA above the scale maximum or below zero", () => {
    expect(validatePrevious({ cgpa: 5.5, units: 60 }, "5.0").map((e) => e.field)).toContain("cgpa");
    expect(validatePrevious({ cgpa: 4.5, units: 60 }, "4.0").map((e) => e.field)).toContain("cgpa");
    expect(validatePrevious({ cgpa: -1, units: 60 }, "5.0").map((e) => e.field)).toContain("cgpa");
  });

  it("rejects non-whole or negative units", () => {
    expect(validatePrevious({ cgpa: 3, units: 12.5 }, "5.0").map((e) => e.field)).toContain("units");
    expect(validatePrevious({ cgpa: 3, units: -4 }, "5.0").map((e) => e.field)).toContain("units");
  });
});
