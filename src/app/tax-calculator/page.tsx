import { TaxCalculator } from "@/components/calculators/tax-calculator";
import { CalculatorPage } from "@/components/calculator-page";
import { ContentSection, DataTable, td, th, type FaqItem } from "@/components/content";
import { RulesStatus } from "@/components/rules-status";
import { Notice, Tag } from "@/components/ui/notice";
import { pageMetadata } from "@/lib/seo";
import { computeTax } from "@/lib/tax/engine";
import { RULES } from "@/lib/tax/rules";
import type { TaxInputs } from "@/lib/tax/types";
import { formatNaira } from "@/lib/utils/format";

export const metadata = pageMetadata("/tax-calculator");

const rules = RULES["2026"];
const rentRelief = rules.rentRelief!;

const bandLabel = (from: number, to: number | null) =>
  to === null ? `Above ${formatNaira(from)}` : from === 0 ? `First ${formatNaira(to)}` : `${formatNaira(from)} to ${formatNaira(to)}`;

// Bands as plain rows (from, to, rate) for the rules table.
const bandRows = rules.bands.map((b, i) => ({
  from: i === 0 ? 0 : rules.bands[i - 1].upTo!,
  to: b.upTo,
  rate: b.rate,
}));

// Worked examples are computed from the same engine and rules the calculator uses, so they cannot drift.
const base: TaxInputs = { amount: 0, period: "annual", rentPaid: 0, pension: 0, nhf: 0, nhis: 0, lifeInsurance: 0 };
const exampleA = computeTax({ ...base, amount: 5_000_000 }, rules);
const exampleB = computeTax({ ...base, amount: 5_000_000, rentPaid: 1_200_000 }, rules);

const faq: FaqItem[] = [
  {
    question: "What are the personal income tax rates for 2026?",
    answer: `Under the Nigeria Tax Act 2025, taxable income is charged in bands: ${bandRows
      .map((b) => `${bandLabel(b.from, b.to).toLowerCase()} at ${b.rate}%`)
      .join(", ")}.`,
  },
  {
    question: "Is the first ₦800,000 really tax-free?",
    answer:
      "Yes. The first ₦800,000 of taxable income is charged at 0%. Because every taxpayer gets this, the old Consolidated Relief Allowance was removed.",
  },
  {
    question: "What happened to the Consolidated Relief Allowance?",
    answer:
      "The Nigeria Tax Act 2025 eliminated it from 1 January 2026. People who pay rent can claim rent relief instead. The calculator also shows what the old rules, including the allowance, would have charged, so you can compare.",
  },
  {
    question: "How does rent relief work?",
    answer: `Rent relief is ${rentRelief.pct}% of the rent you pay in a year, up to ${formatNaira(rentRelief.cap)}, whichever is lower. You must declare the rent you actually paid, and it can be verified, so keep your receipts or tenancy agreement.`,
  },
  {
    question: "Are pension, NHF, NHIS and life insurance deductible?",
    answer:
      "Commentary on the Act says employee pension contributions, National Housing Fund contributions, NHIS contributions and life insurance premiums can be deducted before tax. Sources differ on details, and we have not yet confirmed them against the Act’s text. So the calculator lets you enter the amounts from your payslip and marks each one as unverified. It never works them out from your salary.",
  },
  {
    question: "Will this match my payslip?",
    answer:
      "Not necessarily. This is an estimate for regular employment income. Your employer’s payroll may treat allowances, benefits or reliefs differently, and some rules are not modelled (see the list on this page). Use it to understand and sanity-check, not as a substitute for your payslip or a tax adviser.",
  },
  {
    question: "When did the new rules start?",
    answer:
      "The Nigeria Tax Act 2025 was signed on 26 June 2025 and took effect on 1 January 2026, replacing the previous personal income tax rates and reliefs.",
  },
  {
    question: "Does this site store my income?",
    answer:
      "No. The calculation runs in your browser. The “Copy link” button builds a link containing the figures you typed so you can share or save it; nothing is sent to us.",
  },
];

export default function TaxCalculatorPage() {
  return (
    <CalculatorPage
      path="/tax-calculator"
      appName="Nigeria PAYE Tax Calculator"
      breadcrumb="Income tax calculator"
      category="FinanceApplication"
      eyebrow="Income tax · PAYE"
      title="Nigeria PAYE Tax Calculator 2026"
      intro="Work out your PAYE tax and take-home pay under the Nigeria Tax Act 2025, by the month or by the year, and see how it compares with the old rules."
      status={<RulesStatus rules={rules} />}
      calculator={<TaxCalculator />}
      faq={faq}
    >
      <ContentSection id="bands" title="2026 income tax bands">
        <p>
          Tax is charged on <strong>taxable income</strong>, which is your gross income less the reliefs you qualify for.
          Each slice of taxable income is charged at that band’s rate, not the whole amount.
        </p>
        <DataTable caption="Nigeria personal income tax bands from 1 January 2026">
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className={th}>Taxable income</th>
              <th scope="col" className={`${th} text-right`}>Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {bandRows.map((b) => (
              <tr key={b.from}>
                <td className={td}>{bandLabel(b.from, b.to)}</td>
                <td className={`${td} text-right`}>{b.rate}%</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </ContentSection>

      <ContentSection id="reliefs" title="Reliefs and deductions we use">
        <ul className="space-y-3">
          <li>
            <strong>Rent relief</strong> <Tag tone="success">Confirmed</Tag>
            <br />
            {rentRelief.pct}% of your yearly rent, up to {formatNaira(rentRelief.cap)}. Only if you pay rent.
          </li>
          {rules.deductions.map((d) => (
            <li key={d.id}>
              <strong>{d.label}</strong> <Tag tone="warning">Unverified</Tag>
              <br />
              {d.basis}. You enter this amount; we do not estimate it.
            </li>
          ))}
        </ul>
        <p>
          The Consolidated Relief Allowance no longer exists under the new rules. “Unverified” means the rule comes from
          commentary on the Act and is still being checked against the Act’s own text.
        </p>
        <Notice>
          <p className="font-medium text-foreground">Not modelled</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {rules.notModelled.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </Notice>
      </ContentSection>

      <ContentSection id="example" title="Worked examples">
        <p>Both examples use a gross income of {formatNaira(5_000_000)} a year and no other deductions.</p>
        <DataTable caption="Worked PAYE examples under the 2026 rules">
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className={th}>&nbsp;</th>
              <th scope="col" className={`${th} text-right`}>No rent relief</th>
              <th scope="col" className={`${th} text-right`}>Rent {formatNaira(1_200_000)} a year</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr>
              <th scope="row" className="px-4 py-3 text-left font-medium">Rent relief (20%)</th>
              <td className={`${td} text-right`}>{formatNaira(0)}</td>
              <td className={`${td} text-right`}>{formatNaira(exampleB.reliefs.find((r) => r.id === "rent")!.amount)}</td>
            </tr>
            <tr>
              <th scope="row" className="px-4 py-3 text-left font-medium">Taxable income</th>
              <td className={`${td} text-right`}>{formatNaira(exampleA.annual.taxableIncome)}</td>
              <td className={`${td} text-right`}>{formatNaira(exampleB.annual.taxableIncome)}</td>
            </tr>
            <tr>
              <th scope="row" className="px-4 py-3 text-left font-medium">PAYE tax a year</th>
              <td className={`${td} text-right`}>{formatNaira(exampleA.annual.tax)}</td>
              <td className={`${td} text-right`}>{formatNaira(exampleB.annual.tax)}</td>
            </tr>
            <tr>
              <th scope="row" className="px-4 py-3 text-left font-medium">PAYE tax a month</th>
              <td className={`${td} text-right`}>{formatNaira(exampleA.monthly.tax)}</td>
              <td className={`${td} text-right`}>{formatNaira(exampleB.monthly.tax)}</td>
            </tr>
          </tbody>
        </DataTable>
        <p>
          For the first example: the first {formatNaira(800_000)} is tax-free, the next {formatNaira(2_200_000)} is taxed
          at 15% ({formatNaira(330_000)}), and the remaining {formatNaira(2_000_000)} at 18% ({formatNaira(360_000)}),
          giving {formatNaira(exampleA.annual.tax)}.
        </p>
      </ContentSection>
    </CalculatorPage>
  );
}
