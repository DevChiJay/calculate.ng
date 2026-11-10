/**
 * GPA and CGPA for Nigerian university grading. Pure functions; scales and degree classes are data.
 *
 * The 5.0 scale and its degree classes follow commentary citing the NUC's minimum standards. They have NOT been
 * verified against the NUC itself, and individual universities can apply different rules (for example Senate
 * upgrades near a boundary), so the UI says so. The 4.0 scale is offered for GPA only: we have no source for
 * its degree-class bands, so none is shown.
 */

export type ScaleId = "5.0" | "4.0";
export type Grade = "A" | "B" | "C" | "D" | "E" | "F";

export interface GradeRow {
  grade: Grade;
  points: number;
  /** Typical score range for this grade. Varies by university; shown as a guide only. */
  scoreRange?: string;
}

export interface DegreeClass {
  id: "first" | "second-upper" | "second-lower" | "third" | "pass";
  label: string;
  /** Inclusive lower bound, on the 2-decimal CGPA. */
  min: number;
  /** Inclusive upper bound. */
  max: number;
}

export interface Scale {
  id: ScaleId;
  label: string;
  max: number;
  grades: GradeRow[];
  /** Empty when we have no source for the scale's classes. */
  classes: DegreeClass[];
}

export const SCALES: Record<ScaleId, Scale> = {
  "5.0": {
    id: "5.0",
    label: "5.0 scale",
    max: 5,
    grades: [
      { grade: "A", points: 5, scoreRange: "70–100" },
      { grade: "B", points: 4, scoreRange: "60–69" },
      { grade: "C", points: 3, scoreRange: "50–59" },
      { grade: "D", points: 2, scoreRange: "45–49" },
      { grade: "E", points: 1, scoreRange: "40–44" },
      { grade: "F", points: 0, scoreRange: "0–39" },
    ],
    classes: [
      { id: "first", label: "First Class", min: 4.5, max: 5 },
      { id: "second-upper", label: "Second Class Upper", min: 3.5, max: 4.49 },
      { id: "second-lower", label: "Second Class Lower", min: 2.4, max: 3.49 },
      { id: "third", label: "Third Class", min: 1.5, max: 2.39 },
      { id: "pass", label: "Pass", min: 1, max: 1.49 },
    ],
  },
  "4.0": {
    id: "4.0",
    label: "4.0 scale",
    max: 4,
    grades: [
      { grade: "A", points: 4 },
      { grade: "B", points: 3 },
      { grade: "C", points: 2 },
      { grade: "D", points: 1 },
      { grade: "F", points: 0 },
    ],
    classes: [],
  },
};

/** One row of the course list, exactly as entered. Blank fields are NaN / "". */
export interface Course {
  units: number;
  grade: Grade | "";
}

export type CourseStatus = "empty" | "incomplete" | "ready";

/** Whether a row counts: both a positive number of units and a grade that exists on the scale. */
export function courseStatus(course: Course, scale: ScaleId): CourseStatus {
  const hasUnits = Number.isFinite(course.units) && course.units > 0;
  const gradeOnScale = course.grade !== "" && SCALES[scale].grades.some((g) => g.grade === course.grade);
  const unitsBlank = Number.isNaN(course.units);
  if (hasUnits && gradeOnScale) return "ready";
  if (unitsBlank && course.grade === "") return "empty";
  return "incomplete";
}

/** Round to 2 decimals, half up, with a tiny nudge so values like 4.495 are not lost to binary floating point. */
export function round2(n: number): number {
  return Math.round((n + 1e-9) * 100) / 100;
}

export function classifyDegree(cgpa: number, scale: ScaleId): DegreeClass | null {
  // Compare on the 2-decimal value people see, so a CGPA shown as 4.50 is always a First.
  const v = round2(cgpa);
  return SCALES[scale].classes.find((c) => v >= c.min && v <= c.max) ?? null;
}

export interface Previous {
  cgpa: number;
  units: number;
}

export interface PreviousError {
  field: "cgpa" | "units";
  message: string;
}

export function validatePrevious(previous: Previous, scale: ScaleId): PreviousError[] {
  const errors: PreviousError[] = [];
  const max = SCALES[scale].max;
  if (!Number.isFinite(previous.cgpa) || previous.cgpa < 0 || previous.cgpa > max) {
    errors.push({ field: "cgpa", message: `Enter a CGPA between 0 and ${max.toFixed(1)}.` });
  }
  if (!Number.isFinite(previous.units) || previous.units < 0 || !Number.isInteger(previous.units)) {
    errors.push({ field: "units", message: "Enter a whole number of credit units (0 or more)." });
  }
  return errors;
}

export interface SemesterResult {
  gpa: number;
  units: number;
  qualityPoints: number;
}

export interface CumulativeResult {
  value: number;
  units: number;
}

export interface CGPAResult {
  semester: SemesterResult | null;
  cgpa: CumulativeResult | null;
  /** Only on the 5.0 scale, and only when there is a CGPA. */
  degreeClass: DegreeClass | null;
}

/**
 * Semester GPA = Σ(grade points × units) ÷ Σ units, counting failed courses. If earlier results are given,
 * the CGPA weights them by their units: (previous CGPA × previous units + this semester's points) ÷ total units.
 * Callers should check `validatePrevious` first; invalid previous values are ignored here.
 */
export function computeResult(courses: Course[], scale: ScaleId, previous?: Previous): CGPAResult {
  const table = new Map(SCALES[scale].grades.map((g) => [g.grade, g.points]));

  let units = 0;
  let qualityPoints = 0;
  for (const course of courses) {
    if (courseStatus(course, scale) !== "ready") continue;
    units += course.units;
    qualityPoints += table.get(course.grade as Grade)! * course.units;
  }

  const semester: SemesterResult | null =
    units > 0 ? { gpa: round2(qualityPoints / units), units, qualityPoints } : null;

  const prevOk = previous && validatePrevious(previous, scale).length === 0 && previous.units > 0;
  const prevUnits = prevOk ? previous.units : 0;
  const prevPoints = prevOk ? previous.cgpa * previous.units : 0;

  const totalUnits = units + prevUnits;
  const cgpa: CumulativeResult | null =
    totalUnits > 0 ? { value: round2((prevPoints + qualityPoints) / totalUnits), units: totalUnits } : null;

  return { semester, cgpa, degreeClass: cgpa ? classifyDegree(cgpa.value, scale) : null };
}
