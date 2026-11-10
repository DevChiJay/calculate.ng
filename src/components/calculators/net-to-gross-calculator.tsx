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
  MoreDetails,
  ResultPanel,
  ResultPlaceholder,
} from "@/components/calculators/shared";
import { TaxFormActions, TaxFormFields } from "@/components/calculators/tax-fields";
import { writeTaxParams } from "@/components/calculators/tax-params";
import { TaxWorkings } from "@/components/calculators/tax-workings";
import { useTaxForm } from "@/components/calculators/use-tax-form";
import { solveGross, validateGrossUpInputs } from "@/lib/tax/gross-up";
import { RULES } from "@/lib/tax/rules";
import type { FieldError } from "@/lib/tax/types";
import { formatNaira } from "@/lib/utils/format";

const rules = RULES["2026"];

export function NetToGrossCalculator() {
  const { form, set, clear, parsed, copied, copyLink } = useTaxForm("takehome");

  const outcome = useMemo(() => {
    const v = validateGrossUpInputs(parsed);
    if (!v.ok) return { errors: v.errors, result: null };
    return { errors: [] as FieldError[], result: solveGross(parsed, rules) };
  }, [parsed]);

  const { result } = outcome;
  const hasUnverified = result?.reliefs.some((r) => !r.verified && r.amount > 0) ?? false;
  const per = form.period === "monthly" ? "month" : "year";

  // Hand the solved gross to the PAYE calculator, with everything else carried over.
  const payeLink = result
    ? `/tax-calculator${writeTaxParams(
        {
          ...form,
          amount: String(form.period === "monthly" ? result.monthly.gross : result.annual.gross),
        },
        "income",
      )}`
    : "/tax-calculator";

  return (
    <CalculatorGrid wide>
      <FormPanel label="Net-to-gross inputs">
        <TaxFormFields
          idPrefix="n2g"
          form={form}
          set={set}
          parsedAmount={parsed.amount}
          errors={outcome.errors}
          rules={rules}
          amountLabel={(p) => `Take-home pay you want per ${p}`}
          amountHelp="The amount you want to receive after tax and deductions."
          amountPlaceholder={{ monthly: "e.g. 500,000", annual: "e.g. 6,000,000" }}
        />
        <TaxFormActions onClear={clear} onCopy={copyLink} copied={copied} canCopy={!!result} />
      </FormPanel>

      <ResultPanel className="space-y-6">
        {result ? (
          <>
            <Headlines>
              <Headline
                emphasis
                label={`Gross pay needed per ${per}`}
                value={formatNaira(form.period === "monthly" ? result.monthly.gross : result.annual.gross)}
                sub={
                  form.period === "monthly"
                    ? `${formatNaira(result.annual.gross)} a year`
                    : `${formatNaira(result.monthly.gross)} a month`
                }
              />
              <Headline
                label={`PAYE tax per ${per}`}
                value={formatNaira(form.period === "monthly" ? result.monthly.tax : result.annual.tax)}
                sub={
                  form.period === "monthly"
                    ? `${formatNaira(result.annual.tax)} a year`
                    : `${formatNaira(result.monthly.tax)} a month`
                }
              />
            </Headlines>

            <p className="text-sm text-muted-foreground">
              To take home{" "}
              <strong className="num text-foreground">
                {formatNaira(parsed.amount)} a {per}
              </strong>{" "}
              under the 2026 rules, your gross pay would need to be about{" "}
              <strong className="num text-foreground">
                {formatNaira(form.period === "monthly" ? result.monthly.gross : result.annual.gross)} a {per}
              </strong>
              .
            </p>

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

            <MoreDetails summary="Show the workings">
              <TaxWorkings result={result} idPrefix="n2g" />
            </MoreDetails>

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
              Want to see this gross pay in the PAYE calculator?{" "}
              <Link href={payeLink} className="font-medium text-primary underline underline-offset-4">
                Check it there
              </Link>
              .
            </p>
          </>
        ) : (
          <>
            <ResultPlaceholder>
              Enter the take-home pay you want to see the gross pay it needs under the 2026 rules. The result updates as
              you type.
            </ResultPlaceholder>
            <Notice>An estimate for regular employment income, not tax advice. Your employer’s payroll may differ.</Notice>
          </>
        )}
      </ResultPanel>
    </CalculatorGrid>
  );
}
