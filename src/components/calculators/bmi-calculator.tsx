"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { Notice } from "@/components/ui/notice";
import { BMI_CATEGORIES, calculateBMI, validateBMIInputs, type BMIFieldError, type Unit } from "@/lib/calculations/bmi";
import { parseMoney } from "@/lib/utils/format";
import { toneBg, toneText } from "@/lib/tone";
import { CalculatorGrid, FormPanel, ResultPanel } from "@/components/calculators/shared";

interface FormState {
  unit: Unit;
  weight: string;
  height: string;
  feet: string;
  inches: string;
}

const EMPTY: FormState = { unit: "metric", weight: "", height: "", feet: "", inches: "" };

// BMI scale shown as a bar from 15 to 45; each category's share of it.
const SCALE_MIN = 15;
const SCALE_MAX = 45;
const toPct = (bmi: number) => ((Math.min(Math.max(bmi, SCALE_MIN), SCALE_MAX) - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;

export function BmiCalculator() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const outcome = useMemo(() => {
    const inputs = {
      unit: form.unit,
      weight: parseMoney(form.weight),
      height: parseMoney(form.height),
      heightFeet: parseMoney(form.feet),
      heightInches: parseMoney(form.inches),
    };
    const v = validateBMIInputs(inputs);
    return v.ok ? { result: calculateBMI(inputs), errors: [] as BMIFieldError[] } : { result: null, errors: v.errors };
  }, [form]);

  // Only flag a field once the person has typed something in it; blank fields just wait.
  const errorFor = (field: BMIFieldError["field"], raw: string) =>
    raw.trim() === "" ? undefined : outcome.errors.find((e) => e.field === field)?.message;

  const imperial = form.unit === "imperial";
  const { result } = outcome;

  return (
    <CalculatorGrid>
      <FormPanel label="BMI inputs">
        <Segmented
          legend="Units"
          name="bmi-unit"
          value={form.unit}
          onChange={(unit) => setForm({ ...EMPTY, unit })}
          options={[
            { value: "metric", label: "Metric (kg, cm)" },
            { value: "imperial", label: "Imperial (lb, ft)" },
          ]}
        />

        <TextField
          id="bmi-weight"
          label={`Weight (${imperial ? "lb" : "kg"})`}
          inputMode="decimal"
          autoComplete="off"
          value={form.weight}
          onChange={(e) => set("weight", e.target.value)}
          error={errorFor("weight", form.weight)}
          suffix={imperial ? "lb" : "kg"}
          placeholder={imperial ? "e.g. 154" : "e.g. 70"}
        />

        {imperial ? (
          <div className="grid grid-cols-2 gap-4">
            <TextField
              id="bmi-feet"
              label="Height (feet)"
              inputMode="numeric"
              autoComplete="off"
              value={form.feet}
              onChange={(e) => set("feet", e.target.value)}
              error={errorFor("heightFeet", form.feet)}
              suffix="ft"
              placeholder="e.g. 5"
            />
            <TextField
              id="bmi-inches"
              label="Inches"
              inputMode="decimal"
              autoComplete="off"
              value={form.inches}
              onChange={(e) => set("inches", e.target.value)}
              error={errorFor("heightInches", form.inches)}
              suffix="in"
              placeholder="e.g. 9"
            />
          </div>
        ) : (
          <TextField
            id="bmi-height"
            label="Height (cm)"
            inputMode="decimal"
            autoComplete="off"
            value={form.height}
            onChange={(e) => set("height", e.target.value)}
            error={errorFor("height", form.height)}
            suffix="cm"
            placeholder="e.g. 175"
          />
        )}

        <Button type="button" variant="outline" onClick={() => setForm({ ...EMPTY, unit: form.unit })}>
          Clear
        </Button>
      </FormPanel>

      <ResultPanel>
        {result ? (
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground">Your BMI</p>
              <p className="num font-display text-6xl font-semibold leading-none">{result.bmi.toFixed(1)}</p>
              <p className={`mt-2 text-xl font-semibold ${toneText[result.category.tone]}`}>{result.category.label}</p>
            </div>

            <div>
              <div className="relative">
                <div className="flex h-3 overflow-hidden rounded-full" role="img" aria-label={`BMI scale from ${SCALE_MIN} to ${SCALE_MAX}. Your BMI is ${result.bmi.toFixed(1)}, in the ${result.category.label} range.`}>
                  {BMI_CATEGORIES.map((c) => {
                    const lo = Math.max(c.min, SCALE_MIN);
                    const hi = Math.min(c.max ?? SCALE_MAX, SCALE_MAX);
                    return <span key={c.id} className={toneBg[c.tone]} style={{ width: `${((hi - lo) / (SCALE_MAX - SCALE_MIN)) * 100}%`, opacity: c.id === result.category.id ? 1 : 0.45 }} />;
                  })}
                </div>
                <span
                  aria-hidden
                  className="absolute -top-1 h-5 w-1 -translate-x-1/2 rounded bg-foreground"
                  style={{ left: `${toPct(result.bmi)}%` }}
                />
              </div>
              <div className="num mt-2 flex justify-between text-xs text-muted-foreground" aria-hidden>
                <span>{SCALE_MIN}</span>
                <span>18.5</span>
                <span>25</span>
                <span>30</span>
                <span>35</span>
                <span>40+</span>
              </div>
            </div>

            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-muted-foreground">Healthy weight for your height</dt>
                <dd className="num mt-1 font-semibold">
                  {imperial
                    ? `${Math.round(result.healthyRangeKg.min / 0.45359237)} to ${Math.round(result.healthyRangeKg.max / 0.45359237)} lb`
                    : `${result.healthyRangeKg.min.toFixed(1)} to ${result.healthyRangeKg.max.toFixed(1)} kg`}
                </dd>
                <dd className="mt-1 text-sm text-muted-foreground">BMI 18.5 to 24.9</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">What it means</dt>
                <dd className="mt-1 text-sm">{result.category.risk}</dd>
              </div>
            </dl>

            <div>
              <h3 className="text-base font-semibold">Things to consider</h3>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                {result.category.advice.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="flex min-h-48 flex-col justify-center">
            <p className="font-display text-xl font-semibold">Your result appears here</p>
            <p className="mt-2 text-muted-foreground">Enter your weight and height. The result updates as you type.</p>
          </div>
        )}
        <Notice className="mt-6">
          BMI is a screening measure for adults aged 18 and over. It does not tell muscle from fat, and does not apply to
          children, pregnancy or athletes. It is not medical advice.
        </Notice>
      </ResultPanel>
    </CalculatorGrid>
  );
}
