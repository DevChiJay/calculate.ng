"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextField, controlClass } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { Segmented } from "@/components/ui/segmented";
import { DataTable, td, th } from "@/components/content";
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
  calculateLoan,
  validateLoanInputs,
  type LoanFieldError,
  type LoanInputs,
  type RatePeriod,
  type RateType,
} from "@/lib/calculations/loan";
import { formatNaira, formatPercent, parseMoney, parseOptionalMoney } from "@/lib/utils/format";

type TermUnit = "months" | "years";

interface FormState {
  type: RateType;
  amount: string;
  rate: string;
  ratePeriod: RatePeriod;
  term: string;
  termUnit: TermUnit;
  fee: string;
}

const EMPTY: FormState = { type: "reducing", amount: "", rate: "", ratePeriod: "year", term: "", termUnit: "months", fee: "" };
const SCHEDULE_PREVIEW = 12;

/** A number input joined to a unit select, announced as one labelled group. */
function UnitField({
  id,
  legend,
  error,
  hint,
  children,
}: {
  id: string;
  legend: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="min-w-0" aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}>
      <legend className="mb-1.5 text-sm font-medium">{legend}</legend>
      <div className="flex gap-2">{children}</div>
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </fieldset>
  );
}

function UnitSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="relative w-36 shrink-0">
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${controlClass} appearance-none pr-9`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

export function LoanCalculator() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [showAll, setShowAll] = useState(false);
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const outcome = useMemo(() => {
    const term = parseMoney(form.term);
    const inputs: LoanInputs = {
      amount: parseMoney(form.amount),
      rate: parseMoney(form.rate),
      ratePeriod: form.ratePeriod,
      type: form.type,
      termMonths: form.termUnit === "years" ? Math.round(term * 12 * 1e6) / 1e6 : term,
      feePercent: parseOptionalMoney(form.fee),
    };
    const errors = validateLoanInputs(inputs);
    return errors.length > 0 ? { inputs, result: null, errors } : { inputs, result: calculateLoan(inputs), errors: [] as LoanFieldError[] };
  }, [form]);

  // Show an error only after the person has typed in that field; a blank field just waits for input.
  const errorFor = (field: LoanFieldError["field"], raw: string) =>
    raw.trim() === "" ? undefined : outcome.errors.find((e) => e.field === field)?.message;

  const { result, inputs } = outcome;
  const amount = parseMoney(form.amount);
  const ready = result !== null && form.amount.trim() !== "" && form.rate.trim() !== "" && form.term.trim() !== "";
  const visibleRows = result ? (showAll ? result.schedule : result.schedule.slice(0, SCHEDULE_PREVIEW)) : [];
  const perWord = form.ratePeriod === "year" ? "a year" : "a month";

  const insight = result
    ? form.type === "flat"
      ? `A flat ${inputs.rate}% ${perWord} works out to about ${formatPercent(result.nominalAnnualRate * 100)} a year on a reducing balance (${formatPercent(result.effectiveAnnualRate * 100)} once monthly compounding is counted).`
      : result.fee > 0
        ? `With the ${inputs.feePercent}% fee taken off what you receive, the true cost is ${formatPercent(result.effectiveAnnualRate * 100)} a year, not just the quoted rate.`
        : `A reducing rate of ${inputs.rate}% ${perWord} compounds to an effective ${formatPercent(result.effectiveAnnualRate * 100)} a year.`
    : "";

  return (
    <CalculatorGrid>
      <FormPanel label="Loan inputs">
        <Segmented
          legend="How is the interest quoted?"
          name="loan-type"
          value={form.type}
          onChange={(t) => set("type", t)}
          options={[
            { value: "reducing", label: "Reducing" },
            { value: "flat", label: "Flat" },
          ]}
        />

        <TextField
          id="loan-amount"
          label="Loan amount"
          hint={Number.isFinite(amount) && amount > 0 ? formatNaira(amount) : undefined}
          prefix="₦"
          inputMode="decimal"
          autoComplete="off"
          placeholder="e.g. 500,000"
          value={form.amount}
          onChange={(e) => set("amount", e.target.value)}
          error={errorFor("amount", form.amount)}
        />

        <UnitField
          id="loan-rate"
          legend="Interest rate"
          error={errorFor("rate", form.rate)}
          hint={form.type === "flat" ? "Flat: charged on the full amount for the whole loan." : "Reducing: charged only on what you still owe."}
        >
          <input
            aria-label="Interest rate in percent"
            aria-invalid={errorFor("rate", form.rate) ? true : undefined}
            inputMode="decimal"
            autoComplete="off"
            placeholder="e.g. 20"
            value={form.rate}
            onChange={(e) => set("rate", e.target.value)}
            className={`${controlClass} min-w-0 flex-1`}
          />
          <UnitSelect
            label="Rate period"
            value={form.ratePeriod}
            onChange={(v) => set("ratePeriod", v as RatePeriod)}
            options={[
              { value: "year", label: "% per year" },
              { value: "month", label: "% per month" },
            ]}
          />
        </UnitField>

        <UnitField id="loan-term" legend="Loan term" error={errorFor("term", form.term)}>
          <input
            aria-label="Loan term"
            aria-invalid={errorFor("term", form.term) ? true : undefined}
            inputMode="decimal"
            autoComplete="off"
            placeholder="e.g. 12"
            value={form.term}
            onChange={(e) => set("term", e.target.value)}
            className={`${controlClass} min-w-0 flex-1`}
          />
          <UnitSelect
            label="Term unit"
            value={form.termUnit}
            onChange={(v) => set("termUnit", v as TermUnit)}
            options={[
              { value: "months", label: "months" },
              { value: "years", label: "years" },
            ]}
          />
        </UnitField>

        <MoreDetails summary="More options (fees)">
          <TextField
            id="loan-fee"
            label="Upfront fee"
            hint="A percentage of the loan, taken off what you receive (for example a management or insurance fee)."
            suffix="%"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0"
            value={form.fee}
            onChange={(e) => set("fee", e.target.value)}
            error={errorFor("fee", form.fee)}
          />
        </MoreDetails>

        <Button type="button" variant="outline" onClick={() => { setForm(EMPTY); setShowAll(false); }}>
          Clear
        </Button>
      </FormPanel>

      <ResultPanel className="space-y-6">
        {ready && result ? (
          <>
            <Headlines>
              <Headline emphasis label="Monthly payment" value={formatNaira(result.monthlyPayment)} sub={`for ${inputs.termMonths} months`} />
              <Headline label="Total repayable" value={formatNaira(result.totalRepayable)} sub={`${formatNaira(result.totalInterest)} interest`} />
            </Headlines>

            <dl className="num divide-y divide-border text-sm">
              <div className="flex items-baseline justify-between gap-4 py-2.5">
                <dt className="text-muted-foreground">Amount you receive</dt>
                <dd>{formatNaira(result.netReceived)}</dd>
              </div>
              {result.fee > 0 && (
                <div className="flex items-baseline justify-between gap-4 py-2.5">
                  <dt className="text-muted-foreground">Upfront fee</dt>
                  <dd>{formatNaira(result.fee)}</dd>
                </div>
              )}
              <div className="flex items-baseline justify-between gap-4 py-2.5">
                <dt className="font-semibold text-foreground">Effective annual rate</dt>
                <dd className="font-semibold">{formatPercent(result.effectiveAnnualRate * 100)}</dd>
              </div>
            </dl>

            <p className="text-sm text-muted-foreground">{insight}</p>

            <MoreDetails summary={`Repayment schedule (${result.schedule.length} months)`}>
              <DataTable caption="Month-by-month repayment schedule">
                <thead>
                  <tr className="border-b border-border">
                    <th scope="col" className={th}>Month</th>
                    <th scope="col" className={`${th} text-right`}>Payment</th>
                    <th scope="col" className={`${th} text-right`}>Interest</th>
                    <th scope="col" className={`${th} text-right`}>Principal</th>
                    <th scope="col" className={`${th} text-right`}>Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {visibleRows.map((r) => (
                    <tr key={r.month}>
                      <td className={td}>{r.month}</td>
                      <td className={`${td} text-right`}>{formatNaira(r.payment, 2)}</td>
                      <td className={`${td} text-right`}>{formatNaira(r.interest, 2)}</td>
                      <td className={`${td} text-right`}>{formatNaira(r.principal, 2)}</td>
                      <td className={`${td} text-right`}>{formatNaira(r.balance, 2)}</td>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
              {result.schedule.length > SCHEDULE_PREVIEW && (
                <Button type="button" variant="outline" onClick={() => setShowAll((s) => !s)}>
                  {showAll ? "Show fewer months" : `Show all ${result.schedule.length} months`}
                </Button>
              )}
            </MoreDetails>
          </>
        ) : (
          <ResultPlaceholder>
            Enter the loan amount, the interest rate and how long you will take to repay it. The result updates as you type.
          </ResultPlaceholder>
        )}
        <Notice>An estimate. Your lender&apos;s schedule, fees and rounding may differ, so check the written offer.</Notice>
      </ResultPanel>
    </CalculatorGrid>
  );
}
