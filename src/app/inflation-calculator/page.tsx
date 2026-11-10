import { InflationCalculator } from "@/components/calculators/inflation-calculator";
import { ContentSection, FaqList, type FaqItem } from "@/components/content";
import { JsonLd } from "@/components/json-ld";
import { PageHeader } from "@/components/page-header";
import { breadcrumbSchema, faqSchema, webApplicationSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/inflation-calculator");

const faq: FaqItem[] = [
  {
    question: "How does the inflation calculator work?",
    answer:
      "It compares the Consumer Price Index (CPI) for your two chosen months. If the CPI doubled, prices doubled, so you would need twice as many naira to buy the same things. The result is your amount multiplied by the end CPI divided by the start CPI.",
  },
  {
    question: "What is CPI?",
    answer:
      "The Consumer Price Index measures the average change in prices of a basket of goods and services bought by households. In Nigeria it is published monthly by the National Bureau of Statistics (NBS).",
  },
  {
    question: "Why does buying power fall by less than the price rise?",
    answer:
      "If prices double (up 100%), each naira buys half as much, a fall of 50%, not 100%. The two figures describe the same change from different directions.",
  },
  {
    question: "Why can I only choose some years?",
    answer:
      "The calculator only offers months covered by the CPI data it holds. The coverage is shown beside the result. We are updating the series to the latest NBS releases.",
  },
  {
    question: "Does this site store my figures?",
    answer: "No. The calculation runs in your browser and nothing you enter is sent or saved.",
  },
];

export default function InflationCalculatorPage() {
  return (
    <div className="container-x py-10 sm:py-14">
      <JsonLd data={webApplicationSchema("/inflation-calculator", "Nigeria Inflation Calculator", "FinanceApplication")} />
      <JsonLd data={breadcrumbSchema("/inflation-calculator", "Inflation calculator")} />
      <JsonLd data={faqSchema(faq)} />

      <PageHeader eyebrow="Prices · CPI" title="Nigeria Inflation Calculator">
        See how much the value of the naira has changed between two dates, using Consumer Price Index data for Nigeria.
      </PageHeader>

      <InflationCalculator />

      <ContentSection id="method" title="How it is calculated">
        <p>
          <strong>Equivalent amount = amount × (end CPI ÷ start CPI)</strong>. The yearly rate is the compound rate that
          turns the start CPI into the end CPI over the period: (end ÷ start)^(1 ÷ years) − 1. CPI values for months
          without a published figure are estimated by drawing a straight line between the nearest published months.
        </p>
        <p>
          Inflation is measured with the all-items CPI published by the National Bureau of Statistics. Your personal
          inflation depends on what you buy, so treat the result as a guide.
        </p>
      </ContentSection>

      <ContentSection id="faq" title="Frequently asked questions">
        <FaqList items={faq} />
      </ContentSection>
    </div>
  );
}
