"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Notice } from "@/components/ui/notice";
import { BreakdownBar } from "@/components/ui/breakdown-bar";
import {
  CalculatorGrid,
  FormPanel,
  Headline,
  Headlines,
  ResultPanel,
  ResultPlaceholder,
} from "@/components/calculators/shared";
import { TaxFormActions, TaxFormFields } from "@/components/calculators/tax-fields";
import { TaxWorkings } from "@/components/calculators/tax-workings";
import { useTaxForm } from "@/components/calculators/use-tax-form";
import { compareRegimes } from "@/lib/tax/compare";
import { computeTax, validateTaxInputs } from "@/lib/tax/engine";
import { RULES } from "@/lib/tax/rules";
import type { FieldError } from "@/lib/tax/types";
import { formatNaira } from "@/lib/utils/format";

const rules = RULES["2026"];

export function TaxCalculator() {
  const { form, set, clear, parsed, copied, copyLink } = useTaxForm("income");

  const outcome = useMemo(() => {
    const v = validateTaxInputs(parsed);
    if (!v.ok) return { errors: v.errors, result: null, comparison: null };
    return {
      errors: [] as FieldError[],
      result: computeTax(parsed, rules),
      comparison: compareRegimes(parsed, "2024", "2026"),
    };
  }, [parsed]);

  const { result, comparison } = outcome;
  const hasUnverified = result?.reliefs.some((r) => !r.verified && r.amount > 0) ?? false;

  return (
    <CalculatorGrid wide>
      <FormPanel label="Tax inputs">
        <TaxFormFields
          idPrefix="tax"
          form={form}
          set={set}
          parsedAmount={parsed.amount}
          errors={outcome.errors}
          rules={rules}
          amountLabel={(per) => `Gross income per ${per}`}
          amountHelp="Your pay before any tax or deductions."
          amountPlaceholder={{ monthly: "e.g. 500,000", annual: "e.g. 6,000,000" }}
        />
        <TaxFormActions onClear={clear} onCopy={copyLink} copied={copied} canCopy={!!result} />
      </FormPanel>

      <ResultPanel className="space-y-6">
        {result ? (
          <>
            <Headlines>
              <Headline
                label="PAYE tax per month"
                value={formatNaira(result.monthly.tax)}
                sub={`${formatNaira(result.annual.tax)} a year`}
              />
              <Headline
                emphasis
                label="Estimated take-home per month"
                value={formatNaira(result.monthly.takeHome)}
                sub={`${formatNaira(result.annual.takeHome)} a year`}
              />
            </Headlines>

            <BreakdownBar
              caption="Where your yearly gross income goes"
              segments={[
                { label: "PAYE tax", value: result.annual.tax, swatch: "bg-highlight" },
                {
                  label: "Pension, NHF, NHIS",
                  value: Math.max(0, result.annual.gross - result.annual.tax - result.annual.takeHome),
                  swatch: "bg-info",
                },
                { label: "Take-home", value: result.annual.takeHome, swatch: "bg-primary" },
              ]}
            />

            <TaxWorkings result={result} idPrefix="tax" />

            {comparison && (
              <section aria-labelledby="tax-compare" className="rounded-lg border border-border p-4">
                <h3 id="tax-compare" className="text-base font-semibold">
                  Compared with the old rules
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  The same income under the previous rules (PITA, up to 31 December 2025) would have been taxed{" "}
                  <strong className="num text-foreground">{formatNaira(comparison.a.annual.tax)}</strong> a year (
                  {formatNaira(comparison.a.monthly.tax)} a month).{" "}
                  {comparison.annualDifference === 0 ? (
                    "The new rules give the same result."
                  ) : (
                    <>
                      Under the new rules you pay{" "}
                      <strong className="num text-foreground">
                        {formatNaira(Math.abs(comparison.annualDifference))} a year {comparison.annualDifference < 0 ? "less" : "more"}
                      </strong>{" "}
                      ({formatNaira(Math.abs(comparison.monthlyDifference))} a month).
                    </>
                  )}
                </p>
              </section>
            )}

            {hasUnverified ? (
              <Notice tone="warning">
                Some deductions you entered are marked <strong>Unverified</strong>. They come from commentary on the
                Nigeria Tax Act 2025, not yet confirmed against the Act’s text. Check them with your employer or a tax
                adviser.
              </Notice>
            ) : (
              <Notice>An estimate for regular employment income, not tax advice. Your employer’s payroll may differ.</Notice>
            )}

            <p className="text-sm text-muted-foreground">
              Working backwards from the take-home you want?{" "}
              <Link href="/net-to-gross-calculator" className="font-medium text-primary underline underline-offset-4">
                Try the net-to-gross calculator
              </Link>
              .
            </p>
          </>
        ) : (
          <>
            <ResultPlaceholder>
              Enter your gross income to see your PAYE tax and take-home pay under the 2026 rules. The result updates as
              you type.
            </ResultPlaceholder>
            <Notice>An estimate for regular employment income, not tax advice. Your employer’s payroll may differ.</Notice>
          </>
        )}
      </ResultPanel>
    </CalculatorGrid>
  );
}
