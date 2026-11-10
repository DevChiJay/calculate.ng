"use client";

import { Check, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { Tag } from "@/components/ui/notice";
import { MoreDetails } from "@/components/calculators/shared";
import type { TaxFormState } from "@/components/calculators/tax-params";
import type { FieldError, Period, TaxInputs, TaxRules } from "@/lib/tax/types";
import { formatNaira } from "@/lib/utils/format";

interface TaxFormFieldsProps {
  /** Prefix for element ids, so two calculators never clash. */
  idPrefix: string;
  form: TaxFormState;
  set: <K extends keyof TaxFormState>(key: K, value: TaxFormState[K]) => void;
  parsedAmount: number;
  errors: FieldError[];
  rules: TaxRules;
  amountLabel: (per: string) => string;
  amountHelp: string;
  amountPlaceholder: Record<Period, string>;
}

const FIELD_FOR = { pension: "pension", nhf: "nhf", nhis: "nhis", life: "lifeInsurance" } as const;
const DEDUCTION_KEYS = ["pension", "nhf", "nhis", "life"] as const;

/**
 * The inputs both tax calculators share: period, the main amount, rent, and the optional deductions tucked
 * into a disclosure. Four fields are visible; the rest stay out of the way until asked for.
 */
export function TaxFormFields({
  idPrefix,
  form,
  set,
  parsedAmount,
  errors,
  rules,
  amountLabel,
  amountHelp,
  amountPlaceholder,
}: TaxFormFieldsProps) {
  const per = form.period === "monthly" ? "month" : "year";
  // Only flag a field once the person has typed something in it; blank fields just wait.
  const errorFor = (field: keyof TaxInputs, raw: string) =>
    raw.trim() === "" ? undefined : errors.find((e) => e.field === field)?.message;

  return (
    <>
      <Segmented
        legend="Enter amounts per"
        name={`${idPrefix}-period`}
        value={form.period}
        onChange={(p) => set("period", p)}
        options={[
          { value: "monthly", label: "Month" },
          { value: "annual", label: "Year" },
        ]}
      />

      <TextField
        id={`${idPrefix}-amount`}
        label={amountLabel(per)}
        hint={Number.isFinite(parsedAmount) && parsedAmount > 0 ? `${formatNaira(parsedAmount)} a ${per}` : amountHelp}
        prefix="₦"
        inputMode="decimal"
        autoComplete="off"
        placeholder={amountPlaceholder[form.period]}
        value={form.amount}
        onChange={(e) => set("amount", e.target.value)}
        error={errorFor("amount", form.amount)}
      />

      <TextField
        id={`${idPrefix}-rent`}
        label={`Rent you pay per ${per}`}
        badge={<Tag>Optional</Tag>}
        hint={`Rent relief is ${rules.rentRelief!.pct}% of your yearly rent, up to ₦${rules.rentRelief!.cap.toLocaleString("en-NG")}. Leave blank if you do not pay rent.`}
        prefix="₦"
        inputMode="decimal"
        autoComplete="off"
        value={form.rent}
        onChange={(e) => set("rent", e.target.value)}
        error={errorFor("rentPaid", form.rent)}
      />

      <MoreDetails summary="Other deductions you can enter">
        <p className="text-sm text-muted-foreground">
          Enter the amounts shown on your payslip, per {per}. We do not guess them from your income.
        </p>
        {DEDUCTION_KEYS.map((key) => {
          const rule = rules.deductions.find((d) => d.id === (key === "life" ? "lifeInsurance" : key))!;
          return (
            <TextField
              key={key}
              id={`${idPrefix}-${key}`}
              label={rule.label}
              badge={!rule.verified ? <Tag tone="warning">Unverified</Tag> : undefined}
              hint={rule.basis}
              prefix="₦"
              inputMode="decimal"
              autoComplete="off"
              value={form[key]}
              onChange={(e) => set(key, e.target.value)}
              error={errorFor(FIELD_FOR[key], form[key])}
            />
          );
        })}
      </MoreDetails>
    </>
  );
}

/** Clear and "copy link" actions under a tax form. */
export function TaxFormActions({
  onClear,
  onCopy,
  copied,
  canCopy,
}: {
  onClear: () => void;
  onCopy: () => void;
  copied: "idle" | "ok" | "fail";
  canCopy: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button type="button" variant="outline" onClick={onClear}>
        Clear
      </Button>
      <Button type="button" variant="ghost" onClick={onCopy} disabled={!canCopy}>
        {copied === "ok" ? <Check aria-hidden /> : <Link2 aria-hidden />}
        Copy link to this result
      </Button>
      <span role="status" className="text-sm text-muted-foreground">
        {copied === "ok" && "Link copied"}
        {copied === "fail" && "Could not copy. Copy the address from your browser instead."}
      </span>
    </div>
  );
}
