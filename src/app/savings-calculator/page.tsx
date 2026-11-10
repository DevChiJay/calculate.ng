import { SavingsCalculator } from "@/components/calculators/savings-calculator";
import { CalculatorPage } from "@/components/calculator-page";
import { ContentSection, DataTable, td, th, type FaqItem } from "@/components/content";
import { calculateSavings, type SavingsInputs } from "@/lib/calculations/savings";
import { pageMetadata } from "@/lib/seo";
import { formatNaira } from "@/lib/utils/format";

export const metadata = pageMetadata("/savings-calculator");

// Worked examples computed with the calculator's own maths, so the copy cannot drift from it.
const plan: SavingsInputs = { startingAmount: 100_000, monthlyTopUp: 20_000, annualRate: 10, months: 60, compounding: "monthly" };
const planResult = calculateSavings(plan);
const lump: SavingsInputs = { startingAmount: 100_000, monthlyTopUp: 0, annualRate: 10, months: 12, compounding: "monthly" };
const frequencies = (["monthly", "quarterly", "yearly"] as const).map((c) => ({
  c,
  balance: calculateSavings({ ...lump, compounding: c }).finalBalance,
}));
const label = { monthly: "Every month", quarterly: "Every 3 months", yearly: "Once a year" } as const;

const faq: FaqItem[] = [
  {
    question: "What is compound interest?",
    answer:
      "It is interest earned on your interest. Each time interest is added to your balance, the next round of interest is worked out on the larger balance, so growth speeds up over time. The longer you save, the bigger the effect.",
  },
  {
    question: "Does it matter how often interest is added?",
    answer:
      "A little. The more often interest is added, the more you earn at the same yearly rate, because each addition starts earning too. The difference is small over a year but grows over many years. Check how often your account credits interest.",
  },
  {
    question: "How are my monthly top-ups treated?",
    answer:
      "Top-ups are added at the end of each month. Interest is added at the end of each compounding period on the balance at the start of that period, so a top-up starts earning from the next period. With monthly compounding this matches the standard savings-plan formula.",
  },
  {
    question: "Which interest rate should I enter?",
    answer:
      "Enter the yearly interest rate your bank or investment states for the account. Some products, such as treasury bills, are quoted with a discount rate, which is not the same figure as a yearly interest rate, so check the yield the provider gives you.",
  },
  {
    question: "Does the result include tax or fees?",
    answer:
      "No. Interest can be subject to tax and some accounts charge fees, and rates can change over time. This is an estimate for planning, not a promise of what you will receive.",
  },
  {
    question: "Does this site store my figures?",
    answer: "No. The calculation runs in your browser and nothing you enter is sent or saved.",
  },
];

export default function SavingsCalculatorPage() {
  return (
    <CalculatorPage
      path="/savings-calculator"
      appName="Savings and Compound Interest Calculator"
      breadcrumb="Savings calculator"
      category="FinanceApplication"
      eyebrow="Savings"
      title="Savings and Compound Interest Calculator"
      intro="Enter what you have now, what you can add each month and the yearly interest rate to see how your savings could grow."
      calculator={<SavingsCalculator />}
      faq={faq}
    >
      <ContentSection id="how" title="How the growth is calculated">
        <p>
          Each compounding period, interest equal to <strong>the yearly rate × the period&apos;s share of a year</strong> is
          added to the balance you held at the start of that period. Top-ups are added at the end of each month. With
          monthly compounding and no top-ups, a starting amount grows by <strong>(1 + rate ÷ 12)ⁿ</strong> after n months.
        </p>
        <p>
          For example, saving {formatNaira(plan.startingAmount)} to start and {formatNaira(plan.monthlyTopUp)} a month at{" "}
          {plan.annualRate}% a year for 5 years pays in {formatNaira(planResult.totalPaidIn)} and grows to{" "}
          <strong>{formatNaira(planResult.finalBalance)}</strong>, of which{" "}
          <strong>{formatNaira(planResult.interestEarned)}</strong> is interest.
        </p>
        <DataTable caption="Year-by-year growth for the example above">
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className={th}>Year</th>
              <th scope="col" className={`${th} text-right`}>Paid in</th>
              <th scope="col" className={`${th} text-right`}>Interest</th>
              <th scope="col" className={`${th} text-right`}>Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {planResult.years.map((y) => (
              <tr key={y.year}>
                <td className={td}>{y.year}</td>
                <td className={`${td} text-right`}>{formatNaira(y.paidIn)}</td>
                <td className={`${td} text-right`}>{formatNaira(y.interest)}</td>
                <td className={`${td} text-right`}>{formatNaira(y.balance)}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </ContentSection>

      <ContentSection id="frequency" title="How often interest is added">
        <p>
          {formatNaira(lump.startingAmount)} at {lump.annualRate}% a year for one year, with no top-ups:
        </p>
        <DataTable caption="The same savings with different compounding frequencies">
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className={th}>Interest added</th>
              <th scope="col" className={`${th} text-right`}>Balance after 1 year</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {frequencies.map((f) => (
              <tr key={f.c}>
                <th scope="row" className="px-4 py-3 text-left font-medium">{label[f.c]}</th>
                <td className={`${td} text-right`}>{formatNaira(f.balance, 2)}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </ContentSection>
    </CalculatorPage>
  );
}
