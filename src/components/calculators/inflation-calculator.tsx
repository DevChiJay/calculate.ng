"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { SelectField, TextField } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import {
  calculateInflation,
  validateInflationInputs,
  type InflationFieldError,
} from "@/lib/calculations/inflation";
import { getAvailableDateRange, getCPIForMonth } from "@/lib/data/nigeria-cpi";
import { formatMonthYear, formatNaira, formatPercent, parseMoney } from "@/lib/utils/format";
import { CalculatorGrid, FormPanel, ResultPanel } from "@/components/calculators/shared";

const range = getAvailableDateRange();
const minYear = Number(range.min.slice(0, 4));
const maxYear = Number(range.max.slice(0, 4));
const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => String(minYear + i));
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface FormState {
  amount: string;
  startYear: string;
  startMonth: string;
  endYear: string;
  endMonth: string;
}

const defaults = (): FormState => ({
  amount: "",
  startYear: "2020",
  startMonth: "01",
  endYear: range.max.slice(0, 4),
  endMonth: range.max.slice(5, 7),
});

export function InflationCalculator() {
  const [form, setForm] = useState<FormState>(defaults);
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const outcome = useMemo(() => {
    const inputs = {
      amount: parseMoney(form.amount),
      start: `${form.startYear}-${form.startMonth}`,
      end: `${form.endYear}-${form.endMonth}`,
    };
    const errors = validateInflationInputs(inputs, range);
    if (errors.length > 0) return { result: null, errors };
    return { result: calculateInflation(inputs, getCPIForMonth), errors: [] as InflationFieldError[] };
  }, [form]);

  const amountBlank = form.amount.trim() === "";
  const errorFor = (field: InflationFieldError["field"]) => outcome.errors.find((e) => e.field === field)?.message;
  // Don't nag about the amount until something has been typed; date problems always show.
  const amountError = amountBlank ? undefined : errorFor("amount");
  const { result } = outcome;
  const amount = parseMoney(form.amount);

  const monthOptions = MONTHS.map((m, i) => (
    <option key={m} value={String(i + 1).padStart(2, "0")}>
      {m}
    </option>
  ));
  const yearOptions = years.map((y) => (
    <option key={y} value={y}>
      {y}
    </option>
  ));

  return (
    <CalculatorGrid>
      <FormPanel label="Inflation inputs">
        <TextField
          id="infl-amount"
          label="Amount (₦)"
          hint={Number.isFinite(amount) && amount > 0 ? formatNaira(amount) : "The amount of money in the start month."}
          prefix="₦"
          inputMode="decimal"
          autoComplete="off"
          placeholder="e.g. 100,000"
          value={form.amount}
          onChange={(e) => set("amount", e.target.value)}
          error={amountError}
        />

        <fieldset className="min-w-0">
          <legend className="mb-1.5 text-sm font-medium">From</legend>
          <div className="grid grid-cols-2 gap-3">
            <SelectField id="infl-start-month" label="Month" value={form.startMonth} onChange={(e) => set("startMonth", e.target.value)}>
              {monthOptions}
            </SelectField>
            <SelectField id="infl-start-year" label="Year" value={form.startYear} onChange={(e) => set("startYear", e.target.value)} error={errorFor("start")}>
              {yearOptions}
            </SelectField>
          </div>
        </fieldset>

        <fieldset className="min-w-0">
          <legend className="mb-1.5 text-sm font-medium">To</legend>
          <div className="grid grid-cols-2 gap-3">
            <SelectField id="infl-end-month" label="Month" value={form.endMonth} onChange={(e) => set("endMonth", e.target.value)}>
              {monthOptions}
            </SelectField>
            <SelectField id="infl-end-year" label="Year" value={form.endYear} onChange={(e) => set("endYear", e.target.value)} error={errorFor("end")}>
              {yearOptions}
            </SelectField>
          </div>
        </fieldset>

        <Button type="button" variant="outline" onClick={() => setForm(defaults())}>
          Reset
        </Button>
      </FormPanel>

      <ResultPanel className="space-y-6">
        {result && !amountBlank ? (
          <>
            <div className="rounded-lg bg-accent p-4 text-accent-foreground">
              <p className="text-sm">
                To buy what {formatNaira(amount)} bought in {formatMonthYear(result.start)}, you would need
              </p>
              <p className="num mt-1 font-display text-4xl font-semibold">{formatNaira(result.equivalentAmount)}</p>
              <p className="mt-1 text-sm">in {formatMonthYear(result.end)}.</p>
            </div>

            <dl className="grid gap-4 sm:grid-cols-3">
              <Stat label="Prices rose by" value={formatPercent(result.totalInflation)} sub="in total" />
              <Stat label="Average a year" value={formatPercent(result.annualizedRate)} sub={`over ${result.years.toFixed(1)} years`} />
              <Stat
                label="Buying power"
                value={formatPercent(result.purchasingPowerChange)}
                sub={`${formatNaira(amount)} now buys what ${formatNaira(amount * (1 + result.purchasingPowerChange / 100))} did`}
              />
            </dl>

            <p className="num text-sm text-muted-foreground">
              CPI {result.startCPI.toFixed(1)} in {formatMonthYear(result.start)} and {result.endCPI.toFixed(1)} in{" "}
              {formatMonthYear(result.end)}.
            </p>
          </>
        ) : (
          <div className="flex min-h-48 flex-col justify-center">
            <p className="font-display text-xl font-semibold">Your result appears here</p>
            <p className="mt-2 text-muted-foreground">Enter an amount and choose two dates. The result updates as you type.</p>
          </div>
        )}

        <Notice tone="warning">
          Data coverage: {formatMonthYear(range.min)} to {formatMonthYear(range.max)}. We are updating the series to the
          latest NBS releases, including the 2025 rebasing of the CPI.
        </Notice>
      </ResultPanel>
    </CalculatorGrid>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="num mt-1 font-display text-2xl font-semibold">{value}</dd>
      {sub && <dd className="mt-1 text-sm text-muted-foreground">{sub}</dd>}
    </div>
  );
}
