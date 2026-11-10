"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tag, Notice } from "@/components/ui/notice";
import { SelectField, TextField, controlClass } from "@/components/ui/field";
import { DataTable, td, th } from "@/components/content";
import { UnitField, UnitSelect } from "@/components/calculators/unit-field";
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
  calculateSavings,
  validateSavingsInputs,
  type Compounding,
  type SavingsFieldError,
  type SavingsInputs,
} from "@/lib/calculations/savings";
import { formatNaira, parseMoney, parseOptionalMoney } from "@/lib/utils/format";

type TimeUnit = "years" | "months";

interface FormState {
  start: string;
  topUp: string;
  rate: string;
  time: string;
  timeUnit: TimeUnit;
  compounding: Compounding;
}

const EMPTY: FormState = { start: "", topUp: "", rate: "", time: "", timeUnit: "years", compounding: "monthly" };

export function SavingsCalculator() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const outcome = useMemo(() => {
    const time = parseMoney(form.time);
    const inputs: SavingsInputs = {
      startingAmount: parseOptionalMoney(form.start),
      monthlyTopUp: parseOptionalMoney(form.topUp),
      annualRate: parseMoney(form.rate),
      months: form.timeUnit === "years" ? Math.round(time * 12 * 1e6) / 1e6 : time,
      compounding: form.compounding,
    };
    const errors = validateSavingsInputs(inputs);
    return errors.length > 0
      ? { inputs, result: null, errors }
      : { inputs, result: calculateSavings(inputs), errors: [] as SavingsFieldError[] };
  }, [form]);

  // Only flag a field once something has been typed in it; blank fields just wait for input.
  const errorFor = (field: SavingsFieldError["field"], raw: string) =>
    raw.trim() === "" ? undefined : outcome.errors.find((e) => e.field === field)?.message;

  const { result, inputs } = outcome;
  const ready =
    result !== null && (form.start.trim() !== "" || form.topUp.trim() !== "") && form.rate.trim() !== "" && form.time.trim() !== "";
  const years = inputs.months / 12;
  const lengthLabel = inputs.months % 12 === 0 ? `${inputs.months / 12} ${inputs.months === 12 ? "year" : "years"}` : `${inputs.months} months`;

  return (
    <CalculatorGrid>
      <FormPanel label="Savings inputs">
        <TextField
          id="sv-start"
          label="Starting amount"
          badge={<Tag>Optional</Tag>}
          prefix="₦"
          inputMode="decimal"
          autoComplete="off"
          placeholder="e.g. 100,000"
          value={form.start}
          onChange={(e) => set("start", e.target.value)}
          error={errorFor("startingAmount", form.start)}
        />

        <TextField
          id="sv-topup"
          label="Add every month"
          badge={<Tag>Optional</Tag>}
          prefix="₦"
          inputMode="decimal"
          autoComplete="off"
          placeholder="e.g. 20,000"
          value={form.topUp}
          onChange={(e) => set("topUp", e.target.value)}
          error={errorFor("monthlyTopUp", form.topUp)}
        />

        <TextField
          id="sv-rate"
          label="Interest rate"
          hint="Use the yearly rate your bank or investment quotes."
          suffix="% a year"
          inputMode="decimal"
          autoComplete="off"
          placeholder="e.g. 10"
          value={form.rate}
          onChange={(e) => set("rate", e.target.value)}
          error={errorFor("annualRate", form.rate)}
          className="pr-24"
        />

        <UnitField id="sv-time" legend="For how long" error={errorFor("months", form.time)}>
          <input
            aria-label="Length of time"
            aria-invalid={errorFor("months", form.time) ? true : undefined}
            inputMode="decimal"
            autoComplete="off"
            placeholder="e.g. 5"
            value={form.time}
            onChange={(e) => set("time", e.target.value)}
            className={`${controlClass} min-w-0 flex-1`}
          />
          <UnitSelect
            label="Time unit"
            value={form.timeUnit}
            onChange={(v) => set("timeUnit", v as TimeUnit)}
            options={[
              { value: "years", label: "years" },
              { value: "months", label: "months" },
            ]}
          />
        </UnitField>

        <MoreDetails summary="More options (compounding)">
          <SelectField
            id="sv-compounding"
            label="Interest is added"
            hint="How often the bank credits interest to your balance."
            value={form.compounding}
            onChange={(e) => set("compounding", e.target.value as Compounding)}
          >
            <option value="monthly">Every month</option>
            <option value="quarterly">Every 3 months</option>
            <option value="yearly">Once a year</option>
          </SelectField>
        </MoreDetails>

        <Button type="button" variant="outline" onClick={() => setForm(EMPTY)}>
          Clear
        </Button>
      </FormPanel>

      <ResultPanel className="space-y-6">
        {ready && result ? (
          <>
            <Headlines>
              <Headline emphasis label="Balance at the end" value={formatNaira(result.finalBalance)} sub={`after ${lengthLabel}`} />
              <Headline label="Interest earned" value={formatNaira(result.interestEarned)} sub={`on ${formatNaira(result.totalPaidIn)} paid in`} />
            </Headlines>

            <p className="text-sm text-muted-foreground">
              Prices rise too. To see what this balance could buy in today&apos;s money, try the{" "}
              <Link href="/inflation-calculator" className="font-medium text-primary underline underline-offset-4">
                inflation calculator
              </Link>
              .
            </p>

            <MoreDetails summary={`Year-by-year growth (${result.years.length} ${result.years.length === 1 ? "row" : "rows"})`}>
              <DataTable caption="Savings balance at the end of each year">
                <thead>
                  <tr className="border-b border-border">
                    <th scope="col" className={th}>Year</th>
                    <th scope="col" className={`${th} text-right`}>Paid in</th>
                    <th scope="col" className={`${th} text-right`}>Interest</th>
                    <th scope="col" className={`${th} text-right`}>Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {result.years.map((y) => (
                    <tr key={y.year}>
                      <td className={td}>{y.year}</td>
                      <td className={`${td} text-right`}>{formatNaira(y.paidIn)}</td>
                      <td className={`${td} text-right`}>{formatNaira(y.interest)}</td>
                      <td className={`${td} text-right`}>{formatNaira(y.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
              {years > 0 && inputs.months % 12 !== 0 && (
                <p className="text-sm text-muted-foreground">The last row covers the final {inputs.months % 12} months.</p>
              )}
            </MoreDetails>
          </>
        ) : (
          <ResultPlaceholder>
            Enter a starting amount or a monthly top-up, a yearly rate and how long you will save. The result updates as you type.
          </ResultPlaceholder>
        )}
        <Notice>
          An estimate. It does not include tax on interest or account fees, and real rates can change.
        </Notice>
      </ResultPanel>
    </CalculatorGrid>
  );
}
