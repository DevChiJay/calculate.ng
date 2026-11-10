import { LoanCalculator } from "@/components/calculators/loan-calculator";
import { CalculatorPage } from "@/components/calculator-page";
import { ContentSection, DataTable, td, th, type FaqItem } from "@/components/content";
import { calculateLoan, type LoanInputs } from "@/lib/calculations/loan";
import { pageMetadata } from "@/lib/seo";
import { formatNaira, formatPercent } from "@/lib/utils/format";

export const metadata = pageMetadata("/loan-calculator");

// Worked comparison computed with the calculator's own maths, so the copy cannot drift from it.
const example: LoanInputs = { amount: 500_000, rate: 20, ratePeriod: "year", type: "reducing", termMonths: 12, feePercent: 0 };
const reducing = calculateLoan(example);
const flat = calculateLoan({ ...example, type: "flat" });

const faq: FaqItem[] = [
  {
    question: "What is the difference between flat rate and reducing balance?",
    answer:
      "With a flat rate, interest is charged on the full amount you borrowed for the whole term, even though you are repaying it as you go. With a reducing balance, interest is charged only on what you still owe, so it falls each month. The same headline rate costs much more when it is flat.",
  },
  {
    question: "How do I know which one my lender uses?",
    answer:
      "Ask, and get the total repayable and the monthly instalment in writing. Banks usually quote reducing-balance rates, while some salary-advance, car and microfinance loans quote flat or monthly rates. If you know the monthly instalment, enter the amount, term and a rate and adjust it until the payment matches.",
  },
  {
    question: "What is the effective annual rate?",
    answer:
      "It is the true yearly cost of the loan. It is the monthly rate that makes your instalments exactly repay the money you actually received (after any upfront fee), compounded over twelve months: (1 + monthly rate)^12 − 1. Lenders sometimes quote a simpler figure (the monthly rate times twelve), which is lower.",
  },
  {
    question: "How are fees treated?",
    answer:
      "An upfront fee (such as management or insurance) is taken off the amount you receive, but you still repay the full loan. That raises the effective rate, because you pay interest on money you never received.",
  },
  {
    question: "How is a per-month rate handled?",
    answer:
      "Choose \"% per month\" if your lender quotes, say, 5% a month. On a reducing balance that rate is applied to the balance each month. On a flat basis it is charged on the original amount for every month of the term.",
  },
  {
    question: "Does this site store my figures?",
    answer: "No. The calculation runs in your browser and nothing you enter is sent or saved.",
  },
];

export default function LoanCalculatorPage() {
  return (
    <CalculatorPage
      path="/loan-calculator"
      appName="Nigeria Loan Calculator"
      breadcrumb="Loan calculator"
      category="FinanceApplication"
      eyebrow="Loans"
      title="Loan Calculator: Flat vs Reducing Balance"
      intro="Enter the amount, the rate your lender quotes and the term to see your monthly payment, total cost and the true yearly rate, with a month-by-month schedule."
      calculator={<LoanCalculator />}
      faq={faq}
    >
      <ContentSection id="how" title="How repayments are calculated">
        <p>
          <strong>Reducing balance:</strong> each month you pay interest on the balance you still owe, and the rest of
          your instalment repays principal. The level instalment is{" "}
          <strong>P × r × (1 + r)ⁿ ÷ ((1 + r)ⁿ − 1)</strong>, where P is the amount, r the monthly rate and n the number
          of months.
        </p>
        <p>
          <strong>Flat rate:</strong> interest is the amount × the rate × the time, charged on the original amount for the
          whole term. You repay (amount + interest) in equal instalments.
        </p>
      </ContentSection>

      <ContentSection id="compare" title="The same 20% costs very differently">
        <p>
          A {formatNaira(example.amount)} loan for {example.termMonths} months at 20% a year, quoted two ways:
        </p>
        <DataTable caption="The same headline rate on a reducing-balance and a flat basis">
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className={th}>&nbsp;</th>
              <th scope="col" className={`${th} text-right`}>Reducing balance</th>
              <th scope="col" className={`${th} text-right`}>Flat rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr>
              <th scope="row" className="px-4 py-3 text-left font-medium">Monthly payment</th>
              <td className={`${td} text-right`}>{formatNaira(reducing.monthlyPayment)}</td>
              <td className={`${td} text-right`}>{formatNaira(flat.monthlyPayment)}</td>
            </tr>
            <tr>
              <th scope="row" className="px-4 py-3 text-left font-medium">Total interest</th>
              <td className={`${td} text-right`}>{formatNaira(reducing.totalInterest)}</td>
              <td className={`${td} text-right`}>{formatNaira(flat.totalInterest)}</td>
            </tr>
            <tr>
              <th scope="row" className="px-4 py-3 text-left font-medium">Effective annual rate</th>
              <td className={`${td} text-right`}>{formatPercent(reducing.effectiveAnnualRate * 100)}</td>
              <td className={`${td} text-right`}>{formatPercent(flat.effectiveAnnualRate * 100)}</td>
            </tr>
          </tbody>
        </DataTable>
        <p>
          That is why it pays to ask whether a rate is flat or reducing, and to compare the effective annual rate and the
          total repayable, not the headline percentage.
        </p>
      </ContentSection>
    </CalculatorPage>
  );
}
