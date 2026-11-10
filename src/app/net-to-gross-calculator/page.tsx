import { NetToGrossCalculator } from "@/components/calculators/net-to-gross-calculator";
import { CalculatorPage } from "@/components/calculator-page";
import { ContentSection, DataTable, td, th, type FaqItem } from "@/components/content";
import { RulesStatus } from "@/components/rules-status";
import { pageMetadata } from "@/lib/seo";
import { solveGross } from "@/lib/tax/gross-up";
import { RULES } from "@/lib/tax/rules";
import type { TaxInputs } from "@/lib/tax/types";
import { formatNaira } from "@/lib/utils/format";

export const metadata = pageMetadata("/net-to-gross-calculator");

const rules = RULES["2026"];
const base: TaxInputs = { amount: 0, period: "monthly", rentPaid: 0, pension: 0, nhf: 0, nhis: 0, lifeInsurance: 0 };

// Computed from the same solver the calculator uses, so the page copy cannot drift from the maths.
const example = solveGross({ ...base, amount: 500_000 }, rules);
const table = [100_000, 200_000, 300_000, 500_000, 750_000, 1_000_000].map((takeHome) => ({
  takeHome,
  result: solveGross({ ...base, amount: takeHome }, rules),
}));

const faq: FaqItem[] = [
  {
    question: "What is a net-to-gross calculation?",
    answer:
      "Net pay is what lands in your account after tax and deductions. Gross pay is the amount before them. A net-to-gross calculation works backwards from the take-home you want to the gross pay an employer would have to offer.",
  },
  {
    question: "Why is the gross more than take-home plus a flat percentage?",
    answer:
      "Tax is charged in bands, so the share taken depends on how high your income goes. The first ₦800,000 a year is tax-free and each higher band is taxed at a higher rate, so the calculator solves for the exact gross that leaves your target take-home after the tax on it.",
  },
  {
    question: "Which tax rules does it use?",
    answer: `The Nigeria Tax Act 2025 rules in force from ${rules.effectiveFrom.slice(0, 4)}: bands from 0% to 25%, no Consolidated Relief Allowance, and rent relief of 20% of rent up to ₦500,000 a year. The page shows when the rules were last checked.`,
  },
  {
    question: "Are pension, NHF, NHIS and life insurance included?",
    answer:
      "Only if you enter them. They are amounts you type in from your payslip, never estimated from your pay. Each is marked unverified because it comes from commentary on the Act and has not been confirmed against the Act's text. Pension, NHF and NHIS come out of your pay; life insurance only reduces your taxable income.",
  },
  {
    question: "Will this match my offer letter?",
    answer:
      "It is an estimate for regular employment income. Employers can structure pay into basic salary, allowances and benefits, and payroll rules can differ. Use it to understand what a take-home figure implies, and confirm with your employer.",
  },
  {
    question: "Does this site store my figures?",
    answer:
      "No. The calculation runs in your browser. The \"Copy link\" button builds a link containing the figures you typed so you can share or save it; nothing is sent to us.",
  },
];

export default function NetToGrossCalculatorPage() {
  return (
    <CalculatorPage
      path="/net-to-gross-calculator"
      appName="Nigeria Net to Gross Salary Calculator"
      breadcrumb="Net to gross calculator"
      category="FinanceApplication"
      eyebrow="Income tax · PAYE"
      title="Net to Gross Salary Calculator 2026"
      intro="Enter the take-home pay you want and see the gross salary it needs under the Nigeria Tax Act 2025, by the month or by the year."
      status={<RulesStatus rules={rules} />}
      calculator={<NetToGrossCalculator />}
      faq={faq}
    >
      <ContentSection id="how" title="How it works">
        <p>
          Take-home pay is gross pay less PAYE tax and any deductions taken from your pay. Because tax rises in bands, no
          single percentage converts one to the other. The calculator searches for the gross pay whose take-home, after
          the 2026 tax on it, equals your target. The answer is exact to the kobo.
        </p>
        <p>
          For example, to take home <strong>{formatNaira(500_000)} a month</strong> you need a gross pay of about{" "}
          <strong>{formatNaira(example.monthly.gross)} a month</strong>. PAYE tax on that is{" "}
          <strong>{formatNaira(example.monthly.tax)} a month</strong> ({formatNaira(example.annual.tax)} a year).
        </p>
      </ContentSection>

      <ContentSection id="table" title="Gross pay for common take-home amounts">
        <p>Monthly figures with no rent relief or other deductions. Use the calculator to include yours.</p>
        <DataTable caption="Monthly gross pay needed for common monthly take-home amounts under the 2026 rules">
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className={th}>Take-home a month</th>
              <th scope="col" className={`${th} text-right`}>Gross a month</th>
              <th scope="col" className={`${th} text-right`}>PAYE a month</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {table.map(({ takeHome, result }) => (
              <tr key={takeHome}>
                <td className={td}>{formatNaira(takeHome)}</td>
                <td className={`${td} text-right`}>{formatNaira(result.monthly.gross)}</td>
                <td className={`${td} text-right`}>{formatNaira(result.monthly.tax)}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </ContentSection>
    </CalculatorPage>
  );
}
