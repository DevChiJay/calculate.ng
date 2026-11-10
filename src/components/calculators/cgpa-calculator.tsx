"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronDown, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextField, controlClass } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { Segmented } from "@/components/ui/segmented";
import {
  CalculatorGrid,
  FormPanel,
  Headline,
  Headlines,
  MoreDetails,
  ResultPanel,
  ResultPlaceholder,
} from "@/components/calculators/shared";
import {
  SCALES,
  computeResult,
  courseStatus,
  validatePrevious,
  type Course,
  type Grade,
  type ScaleId,
} from "@/lib/calculations/cgpa";
import { parseMoney } from "@/lib/utils/format";

interface Row {
  key: number;
  units: string;
  grade: Grade | "";
}

const START_ROWS = 5;
const MAX_ROWS = 20;

export function CgpaCalculator() {
  const nextKey = useRef(START_ROWS);
  const blankRows = () => Array.from({ length: START_ROWS }, (_, i): Row => ({ key: i, units: "", grade: "" }));

  const [scale, setScale] = useState<ScaleId>("5.0");
  const [rows, setRows] = useState<Row[]>(blankRows);
  const [prevCgpa, setPrevCgpa] = useState("");
  const [prevUnits, setPrevUnits] = useState("");

  const updateRow = (key: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const addRow = () => setRows((rs) => (rs.length >= MAX_ROWS ? rs : [...rs, { key: nextKey.current++, units: "", grade: "" }]));
  const removeRow = (key: number) => setRows((rs) => (rs.length <= 1 ? rs : rs.filter((r) => r.key !== key)));
  const clear = () => {
    nextKey.current = START_ROWS;
    setRows(blankRows());
    setPrevCgpa("");
    setPrevUnits("");
  };

  // A grade that does not exist on the new scale (E on 4.0) is cleared, not silently kept.
  function changeScale(next: ScaleId) {
    setScale(next);
    setRows((rs) =>
      rs.map((r) => (r.grade && !SCALES[next].grades.some((g) => g.grade === r.grade) ? { ...r, grade: "" } : r)),
    );
  }

  const courses: Course[] = useMemo(
    () => rows.map((r) => ({ units: parseMoney(r.units), grade: r.grade })),
    [rows],
  );
  const incomplete = courses.filter((c) => courseStatus(c, scale) === "incomplete").length;

  const hasPrevInput = prevCgpa.trim() !== "" || prevUnits.trim() !== "";
  const previous = useMemo(
    () => ({ cgpa: parseMoney(prevCgpa), units: prevUnits.trim() === "" ? Number.NaN : parseMoney(prevUnits) }),
    [prevCgpa, prevUnits],
  );
  const prevErrors = hasPrevInput ? validatePrevious(previous, scale) : [];
  const usePrevious = hasPrevInput && prevErrors.length === 0 && previous.units > 0;

  const result = useMemo(
    () => computeResult(courses, scale, usePrevious ? previous : undefined),
    [courses, scale, usePrevious, previous],
  );

  const cfg = SCALES[scale];
  const hasAny = result.semester !== null || result.cgpa !== null;
  const prevError = (field: "cgpa" | "units") => prevErrors.find((e) => e.field === field)?.message;

  return (
    <CalculatorGrid>
      <FormPanel label="CGPA inputs">
        <Segmented
          legend="Grading scale"
          name="cgpa-scale"
          value={scale}
          onChange={changeScale}
          options={[
            { value: "5.0", label: "5.0 scale" },
            { value: "4.0", label: "4.0 scale" },
          ]}
        />

        <fieldset className="min-w-0">
          <legend className="mb-1.5 text-sm font-medium">Courses this semester</legend>
          <div className="grid grid-cols-[1fr_1fr_2.75rem] gap-x-3 px-0.5 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground" aria-hidden>
            <span>Credit units</span>
            <span>Grade</span>
            <span />
          </div>
          <ul className="space-y-2">
            {rows.map((row, i) => (
              <li key={row.key} className="grid grid-cols-[1fr_1fr_2.75rem] items-center gap-x-3">
                <input
                  aria-label={`Course ${i + 1} credit units`}
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="e.g. 3"
                  value={row.units}
                  onChange={(e) => updateRow(row.key, { units: e.target.value })}
                  className={controlClass}
                />
                <div className="relative">
                  <select
                    aria-label={`Course ${i + 1} grade`}
                    value={row.grade}
                    onChange={(e) => updateRow(row.key, { grade: e.target.value as Grade | "" })}
                    className={`${controlClass} appearance-none pr-9`}
                  >
                    <option value="">Grade</option>
                    {cfg.grades.map((g) => (
                      <option key={g.grade} value={g.grade}>
                        {g.grade} ({g.points})
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    aria-hidden
                    className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove course ${i + 1}`}
                  disabled={rows.length <= 1}
                  onClick={() => removeRow(row.key)}
                >
                  <X aria-hidden />
                </Button>
              </li>
            ))}
          </ul>
          <Button type="button" variant="outline" className="mt-3" onClick={addRow} disabled={rows.length >= MAX_ROWS}>
            <Plus aria-hidden /> Add course
          </Button>
          <p role="status" className="mt-2 min-h-5 text-sm text-muted-foreground">
            {incomplete > 0 &&
              `${incomplete} ${incomplete === 1 ? "row needs" : "rows need"} both credit units and a grade, so ${incomplete === 1 ? "it is" : "they are"} not counted.`}
          </p>
        </fieldset>

        <MoreDetails summary="Include earlier semesters (for your CGPA)">
          <p className="text-sm text-muted-foreground">
            Enter your CGPA and total credit units from before this semester. We weight them by units.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id="cgpa-prev"
              label="Previous CGPA"
              inputMode="decimal"
              autoComplete="off"
              placeholder={`e.g. ${scale === "5.0" ? "3.80" : "3.20"}`}
              value={prevCgpa}
              onChange={(e) => setPrevCgpa(e.target.value)}
              error={hasPrevInput && prevCgpa.trim() !== "" ? prevError("cgpa") : undefined}
            />
            <TextField
              id="cgpa-prev-units"
              label="Previous credit units"
              inputMode="numeric"
              autoComplete="off"
              placeholder="e.g. 60"
              value={prevUnits}
              onChange={(e) => setPrevUnits(e.target.value)}
              error={hasPrevInput && prevUnits.trim() !== "" ? prevError("units") : undefined}
            />
          </div>
        </MoreDetails>

        <Button type="button" variant="outline" onClick={clear}>
          Clear all
        </Button>
      </FormPanel>

      <ResultPanel className="space-y-6">
        {hasAny ? (
          <>
            <Headlines>
              {usePrevious && result.cgpa ? (
                <>
                  <Headline
                    emphasis
                    label="Your CGPA"
                    value={result.cgpa.value.toFixed(2)}
                    sub={`${result.cgpa.units} credit units in total`}
                  />
                  <Headline
                    label="GPA this semester"
                    value={result.semester ? result.semester.gpa.toFixed(2) : "–"}
                    sub={result.semester ? `${result.semester.units} credit units` : "No courses entered"}
                  />
                </>
              ) : (
                <>
                  <Headline
                    emphasis
                    label="GPA this semester"
                    value={result.semester!.gpa.toFixed(2)}
                    sub={`out of ${cfg.max.toFixed(1)}`}
                  />
                  <Headline
                    label="Credit units"
                    value={String(result.semester!.units)}
                    sub={`${result.semester!.qualityPoints} quality points`}
                  />
                </>
              )}
            </Headlines>

            {scale === "5.0" ? (
              result.degreeClass ? (
                <p className="text-sm text-muted-foreground">
                  {usePrevious ? "At this CGPA" : "At this GPA"} you would be in the{" "}
                  <strong className="text-foreground">{result.degreeClass.label}</strong> range.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  This is below the lowest degree class (a CGPA of 1.00).
                </p>
              )
            ) : (
              <p className="text-sm text-muted-foreground">
                Degree classes are not shown for the 4.0 scale, because the bands vary by university.
              </p>
            )}

            <Notice>
              Universities can apply their own rules, for example a Senate review near a class boundary. Check yours.
            </Notice>
          </>
        ) : (
          <>
            <ResultPlaceholder>
              Add each course&apos;s credit units and grade. Your GPA updates as you go. To get your CGPA, add your earlier
              semesters under the courses.
            </ResultPlaceholder>
            <Notice>
              Universities can apply their own rules, for example a Senate review near a class boundary. Check yours.
            </Notice>
          </>
        )}
      </ResultPanel>
    </CalculatorGrid>
  );
}
