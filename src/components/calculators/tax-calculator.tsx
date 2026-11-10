"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Check, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { Notice, Tag } from "@/components/ui/notice";
import { BreakdownBar } from "@/components/ui/breakdown-bar";
import { DataTable, td, th } from "@/components/content";
import { compareRegimes } from "@/lib/tax/compare";
import { computeTax, validateTaxInputs } from "@/lib/tax/engine";
import { RULES } from "@/lib/tax/rules";
import type { FieldError, Period, TaxInputs } from "@/lib/tax/types";
import { formatNaira, formatPercent, parseMoney, parseOptionalMoney } from "@/lib/utils/format";
import { CalculatorGrid, FormPanel, ResultPanel } from "@/components/calculators/shared";

interface FormState {
  period: Period;
  amount: string;
  rent: string;
  pension: string;
  nhf: string;
  nhis: string;
  life: string;
}

const EMPTY: FormState = { period: "monthly", amount: "", rent: "", pension: "", nhf: "", nhis: "", life: "" };

// Query-string keys for shareable links.
const PARAMS: Record<keyof FormState, string> = {
  period: "period",
  amount: "income",
  rent: "rent",
  pension: "pension",
  nhf: "nhf",
  nhis: "nhis",
  life: "life",
};

function readParams(search: string): FormState {
  const q = new URLSearchParams(search);
  const num = (k: string) => {
    const v = q.get(k) ?? "";
    return /^\d+(\.\d+)?$/.test(v) ? v : "";
  };
  return {
    period: q.get(PARAMS.period) === "annual" ? "annual" : "monthly",
    amount: num(PARAMS.amount),
    rent: num(PARAMS.rent),
    pension: num(PARAMS.pension),
    nhf: num(PARAMS.nhf),
    nhis: num(PARAMS.nhis),
    life: num(PARAMS.life),
  };
}

function writeParams(form: FormState): string {
  const q = new URLSearchParams();
  (Object.keys(PARAMS) as (keyof FormState)[]).forEach((k) => {
    const v = form[k].replace(/[₦,\s]/g, "");
    if (v && !(k === "period" && v === EMPTY.period)) q.set(PARAMS[k], v);
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

const rules = RULES["2026"];

const subscribeNoop = () => () => {};

export function TaxCalculator() {
  // The page is static, so a shared link is read on the client. useSyncExternalStore gives "" during
  // hydration and the real query string right after, with no mismatch and no effect-driven setState.
  const search = useSyncExternalStore(subscribeNoop, () => window.location.search, () => "");
  const fromUrl = useMemo(() => readParams(search), [search]);
  const [edited, setEdited] = useState<FormState | null>(null);
  const form = edited ?? fromUrl;
  const [copied, setCopied] = useState<"idle" | "ok" | "fail">("idle");
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setEdited((prev) => ({ ...(prev ?? fromUrl), [key]: value }));

  // Keep the address bar in sync so the current URL is always a shareable link.
  useEffect(() => {
    if (!edited) return;
    const t = setTimeout(() => {
      window.history.replaceState(null, "", `${window.location.pathname}${writeParams(edited)}`);
    }, 300);
    return () => clearTimeout(t);
  }, [edited]);

  const parsed: TaxInputs = useMemo(
    () => ({
      amount: parseMoney(form.amount),
      period: form.period,
      rentPaid: parseOptionalMoney(form.rent),
      pension: parseOptionalMoney(form.pension),
      nhf: parseOptionalMoney(form.nhf),
      nhis: parseOptionalMoney(form.nhis),
      lifeInsurance: parseOptionalMoney(form.life),
    }),
    [form],
  );

  const outcome = useMemo(() => {
    const v = validateTaxInputs(parsed);
    if (!v.ok) return { errors: v.errors, result: null, comparison: null };
    return {
      errors: [] as FieldError[],
      result: computeTax(parsed, rules),
      comparison: compareRegimes(parsed, "2024", "2026"),
    };
  }, [parsed]);

  const errorFor = (field: keyof TaxInputs, raw: string) =>
    raw.trim() === "" ? undefined : outcome.errors.find((e) => e.field === field)?.message;

  const per = form.period === "monthly" ? "month" : "year";
  const { result, comparison } = outcome;
  const deductionRule = (id: string) => rules.deductions.find((d) => d.id === id)!;
  const hasUnverified = result?.reliefs.some((r) => !r.verified && r.amount > 0) ?? false;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}${writeParams(form)}`);
      setCopied("ok");
    } catch {
      setCopied("fail");
    }
    setTimeout(() => setCopied("idle"), 2500);
  }

  const deductionFields = [
    { key: "pension" as const, id: "tax-pension" },
    { key: "nhf" as const, id: "tax-nhf" },
    { key: "nhis" as const, id: "tax-nhis" },
    { key: "life" as const, id: "tax-life" },
  ];
  const ruleId = { pension: "pension", nhf: "nhf", nhis: "nhis", life: "lifeInsurance" } as const;
  const fieldToInput = { pension: "pension", nhf: "nhf", nhis: "nhis", life: "lifeInsurance" } as const;

  return (
    <CalculatorGrid wide>
      <FormPanel label="Tax inputs">
        <Segmented
          legend="Enter amounts per"
          name="tax-period"
          value={form.period}
          onChange={(p) => set("period", p)}
          options={[
            { value: "monthly", label: "Month" },
            { value: "annual", label: "Year" },
          ]}
        />

        <TextField
          id="tax-income"
          label={`Gross income per ${per}`}
          hint={
            Number.isFinite(parsed.amount) && parsed.amount > 0
              ? `${formatNaira(parsed.amount)} a ${per}`
              : "Your pay before any tax or deductions."
          }
          prefix="₦"
          inputMode="decimal"
          autoComplete="off"
          placeholder={form.period === "monthly" ? "e.g. 500,000" : "e.g. 6,000,000"}
          value={form.amount}
          onChange={(e) => set("amount", e.target.value)}
          error={errorFor("amount", form.amount)}
        />

        <TextField
          id="tax-rent"
          label={`Rent you pay per ${per}`}
          badge={<Tag>Optional</Tag>}
          hint={`Rent relief is 20% of your yearly rent, up to ₦${rules.rentRelief!.cap.toLocaleString("en-NG")}. Leave blank if you do not pay rent.`}
          prefix="₦"
          inputMode="decimal"
          autoComplete="off"
          value={form.rent}
          onChange={(e) => set("rent", e.target.value)}
          error={errorFor("rentPaid", form.rent)}
        />

        <details className="group rounded-lg border border-border">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
            Other deductions you can enter
            <span aria-hidden className="text-muted-foreground group-open:hidden">+</span>
            <span aria-hidden className="hidden text-muted-foreground group-open:inline">−</span>
          </summary>
          <div className="space-y-5 border-t border-border p-4">
            <p className="text-sm text-muted-foreground">
              Enter the amounts shown on your payslip, per {per}. We do not guess them from your income.
            </p>
            {deductionFields.map(({ key, id }) => {
              const rule = deductionRule(ruleId[key]);
              return (
                <TextField
                  key={key}
                  id={id}
                  label={rule.label}
                  badge={!rule.verified ? <Tag tone="warning">Unverified</Tag> : undefined}
                  hint={rule.basis}
                  prefix="₦"
                  inputMode="decimal"
                  autoComplete="off"
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                  error={errorFor(fieldToInput[key], form[key])}
                />
              );
            })}
          </div>
        </details>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" onClick={() => setEdited({ ...EMPTY, period: form.period })}>
            Clear
          </Button>
          <Button type="button" variant="ghost" onClick={copyLink} disabled={!result}>
            {copied === "ok" ? <Check aria-hidden /> : <Link2 aria-hidden />}
            Copy link to this result
          </Button>
          <span role="status" className="text-sm text-muted-foreground">
            {copied === "ok" && "Link copied"}
            {copied === "fail" && "Could not copy. Copy the address from your browser instead."}
          </span>
        </div>
      </FormPanel>

      <ResultPanel className="space-y-6">
        {result ? (
          <>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-muted/50 p-4">
                <dt className="text-sm text-muted-foreground">PAYE tax per month</dt>
                <dd className="num mt-1 font-display text-3xl font-semibold">{formatNaira(result.monthly.tax)}</dd>
                <dd className="num mt-1 text-sm text-muted-foreground">{formatNaira(result.annual.tax)} a year</dd>
              </div>
              <div className="rounded-lg bg-accent p-4 text-accent-foreground">
                <dt className="text-sm">Estimated take-home per month</dt>
                <dd className="num mt-1 font-display text-3xl font-semibold">{formatNaira(result.monthly.takeHome)}</dd>
                <dd className="num mt-1 text-sm">{formatNaira(result.annual.takeHome)} a year</dd>
              </div>
            </dl>

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

            <section aria-labelledby="tax-workings">
              <h3 id="tax-workings" className="text-base font-semibold">
                How we got there (yearly figures)
              </h3>
              <dl className="num mt-3 divide-y divide-border text-sm">
                <Row label="Gross income" value={formatNaira(result.annual.gross)} />
                {result.reliefs
                  .filter((r) => r.amount > 0)
                  .map((r) => (
                    <Row
                      key={r.id}
                      label={
                        <span className="inline-flex flex-wrap items-center gap-2">
                          Less: {r.label}
                          {!r.verified && <Tag tone="warning">Unverified</Tag>}
                        </span>
                      }
                      value={`− ${formatNaira(r.amount)}`}
                    />
                  ))}
                <Row label="Taxable income" value={formatNaira(result.annual.taxableIncome)} strong />
                <Row label="PAYE tax" value={formatNaira(result.annual.tax)} strong />
                <Row label="Average rate on your gross income" value={formatPercent(result.annual.effectiveRate)} />
                <Row label="Rate on your next naira (top band reached)" value={formatPercent(result.annual.marginalRate, 0)} />
              </dl>
            </section>

            <section aria-labelledby="tax-bands">
              <h3 id="tax-bands" className="mb-3 text-base font-semibold">
                Tax by band
              </h3>
              <DataTable caption="Tax charged in each band of taxable income">
                <thead>
                  <tr className="border-b border-border">
                    <th scope="col" className={th}>Taxable income band</th>
                    <th scope="col" className={`${th} text-right`}>Rate</th>
                    <th scope="col" className={`${th} text-right`}>In this band</th>
                    <th scope="col" className={`${th} text-right`}>Tax</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {result.bands
                    .filter((b) => b.taxableInBand > 0)
                    .map((b) => (
                      <tr key={b.from}>
                        <td className={td}>
                          {formatNaira(b.from)} to {b.to === null ? "no limit" : formatNaira(b.to)}
                        </td>
                        <td className={`${td} text-right`}>{b.rate}%</td>
                        <td className={`${td} text-right`}>{formatNaira(b.taxableInBand)}</td>
                        <td className={`${td} text-right`}>{formatNaira(b.tax)}</td>
                      </tr>
                    ))}
                </tbody>
              </DataTable>
            </section>

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

            {hasUnverified && (
              <Notice tone="warning">
                Some deductions you entered are marked <strong>Unverified</strong>. They come from commentary on the Nigeria
                Tax Act 2025, not yet confirmed against the Act’s text. Check them with your employer or a tax adviser.
              </Notice>
            )}
          </>
        ) : (
          <div className="flex min-h-64 flex-col justify-center">
            <p className="font-display text-xl font-semibold">Your result appears here</p>
            <p className="mt-2 max-w-md text-muted-foreground">
              Enter your gross income to see your PAYE tax and take-home pay under the 2026 rules. The result updates as
              you type.
            </p>
          </div>
        )}

        <Notice>
          An estimate for regular employment income, not tax advice. Your employer’s payroll may differ.
        </Notice>
      </ResultPanel>
    </CalculatorGrid>
  );
}

function Row({ label, value, strong = false }: { label: React.ReactNode; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className={strong ? "font-semibold text-foreground" : "text-muted-foreground"}>{label}</dt>
      <dd className={strong ? "font-semibold text-foreground" : "text-foreground"}>{value}</dd>
    </div>
  );
}
