import { VatCalculator } from "@/components/calculators/vat-calculator";
import { CalculatorPage } from "@/components/calculator-page";
import { ContentSection, DataTable, td, th, type FaqItem } from "@/components/content";
import { Notice, Tag } from "@/components/ui/notice";
import { RulesStatus } from "@/components/rules-status";
import { addVAT, removeVAT } from "@/lib/calculations/vat";
import { pageMetadata } from "@/lib/seo";
import { VAT_RULES } from "@/lib/vat/rules";
import { formatNaira } from "@/lib/utils/format";

export const metadata = pageMetadata("/vat-calculator");

const rate = VAT_RULES.rate;
// Worked figures computed with the calculator's own maths, so the copy cannot drift from it.
const added = addVAT(100_000, rate);
const removed = removeVAT(10_000, rate);
const table = [1_000, 5_000, 10_000, 50_000, 100_000].map((net) => addVAT(net, rate));

const faq: FaqItem[] = [
  {
    question: "What is the VAT rate in Nigeria?",
    answer: `The standard VAT rate is ${rate}%. Commentary on the Nigeria Tax Act 2025, in force from 1 January 2026, says the rate was kept at ${rate}% while the rules on what is exempt, zero-rated and recoverable were revised.`,
  },
  {
    question: "How do I calculate VAT on a price?",
    answer: `Multiply the price before VAT by ${rate}% (0.075) to get the VAT, and add it to the price. For example ${formatNaira(added.net)} plus ${formatNaira(added.vat)} VAT is ${formatNaira(added.gross)}.`,
  },
  {
    question: "How do I take VAT out of a price that already includes it?",
    answer: `Divide the total by 1.075 to get the price before VAT, and the VAT is the difference. It is not ${rate}% of the total: ${formatNaira(10_000)} including VAT contains ${formatNaira(removed.vat, 2)} of VAT, and the price before VAT is ${formatNaira(removed.net, 2)}.`,
  },
  {
    question: "Is VAT charged on everything?",
    answer:
      "No. Some goods and services are exempt or zero-rated. The lists were revised under the Nigeria Tax Act 2025 and commentaries describe the split between exempt and zero-rated differently, so check the Act or guidance from the Nigeria Revenue Service for a specific item. Use a 0% rate in the calculator for a zero-rated item.",
  },
  {
    question: "Does a business have to charge VAT?",
    answer:
      "VAT registration depends on the business. Sources currently report different thresholds for small-business exemption, so this calculator does not decide it for you. Check with the tax authority or an adviser.",
  },
  {
    question: "Does this site store my figures?",
    answer: "No. The calculation runs in your browser and nothing you enter is sent or saved.",
  },
];

export default function VatCalculatorPage() {
  return (
    <CalculatorPage
      path="/vat-calculator"
      appName="Nigeria VAT Calculator"
      breadcrumb="VAT calculator"
      category="FinanceApplication"
      eyebrow="Tax · VAT"
      title="VAT Calculator for Nigeria (7.5%)"
      intro="Add VAT to a price, or take it out of a total that already includes it, and see the VAT amount, the net price and the total."
      status={<RulesStatus rules={VAT_RULES} />}
      calculator={<VatCalculator />}
      faq={faq}
    >
      <ContentSection id="how" title="How VAT is worked out">
        <p>
          <strong>Adding VAT:</strong> VAT = price × {rate}%, and total = price + VAT. For example{" "}
          {formatNaira(added.net)} + {formatNaira(added.vat)} VAT = <strong>{formatNaira(added.gross)}</strong>.
        </p>
        <p>
          <strong>Removing VAT:</strong> price before VAT = total ÷ {(1 + rate / 100).toFixed(3)}, and the VAT is what is
          left. {formatNaira(10_000)} including VAT is {formatNaira(removed.net, 2)} plus {formatNaira(removed.vat, 2)} VAT.
          Amounts are rounded to the kobo.
        </p>
        <DataTable caption={`VAT at ${rate}% on common prices`}>
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className={th}>Price before VAT</th>
              <th scope="col" className={`${th} text-right`}>VAT ({rate}%)</th>
              <th scope="col" className={`${th} text-right`}>Price including VAT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {table.map((r) => (
              <tr key={r.net}>
                <td className={td}>{formatNaira(r.net)}</td>
                <td className={`${td} text-right`}>{formatNaira(r.vat, 2)}</td>
                <td className={`${td} text-right`}>{formatNaira(r.gross, 2)}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </ContentSection>

      <ContentSection id="scope" title="What this calculator does not decide">
        <p>
          The standard rate is <Tag tone="success">Confirmed</Tag> across several commentaries. Which goods and services
          carry it is <Tag tone="warning">Unverified</Tag>: the lists of zero-rated and exempt supplies were revised from
          1 January 2026, and sources describe them differently. You choose the rate, so enter 0 for a zero-rated item.
        </p>
        <Notice>
          <p className="font-medium text-foreground">Not modelled</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {VAT_RULES.notModelled.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </Notice>
      </ContentSection>
    </CalculatorPage>
  );
}
