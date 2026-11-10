import { BmiCalculator } from "@/components/calculators/bmi-calculator";
import { CalculatorPage } from "@/components/calculator-page";
import { ContentSection, DataTable, td, th, type FaqItem } from "@/components/content";
import { BMI_CATEGORIES } from "@/lib/calculations/bmi";
import { pageMetadata } from "@/lib/seo";
import { toneText } from "@/lib/tone";

export const metadata = pageMetadata("/bmi-calculator");

const faq: FaqItem[] = [
  {
    question: "How is BMI calculated?",
    answer:
      "BMI is your weight in kilograms divided by your height in metres squared. For example, 70 kg at 1.75 m is 70 ÷ 3.0625 = 22.9. With pounds and inches the calculator converts to kg and cm first.",
  },
  {
    question: "What is a healthy BMI?",
    answer:
      "For adults, the World Health Organization treats a BMI from 18.5 to 24.9 as the healthy weight range. Below 18.5 is underweight, 25 to 29.9 is overweight, and 30 or more is obese.",
  },
  {
    question: "Is BMI accurate for everyone?",
    answer:
      "No. BMI does not separate muscle from fat, so very muscular people can score as overweight. It is also not designed for children, pregnant women or elite athletes. Use it as a starting point and talk to a healthcare provider about your own situation.",
  },
  {
    question: "Does this calculator store my details?",
    answer:
      "No. The calculation runs in your browser and your weight and height are not sent or saved anywhere.",
  },
];

export default function BmiCalculatorPage() {
  return (
    <CalculatorPage
      path="/bmi-calculator"
      appName="BMI Calculator"
      breadcrumb="BMI calculator"
      category="HealthApplication"
      eyebrow="Health"
      title="BMI Calculator"
      intro="Enter your weight and height in kilograms and centimetres, or pounds and feet, to see your body mass index and what range it falls in."
      calculator={<BmiCalculator />}
      faq={faq}
    >
      <ContentSection id="how" title="How BMI is calculated">
        <p>
          <strong>BMI = weight (kg) ÷ height (m)²</strong>. The result is rounded to one decimal place, and the category
          is read from that rounded figure using the World Health Organization’s adult cut-offs.
        </p>
        <DataTable caption="BMI categories for adults">
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className={th}>Category</th>
              <th scope="col" className={th}>BMI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {BMI_CATEGORIES.map((c) => (
              <tr key={c.id}>
                <th scope="row" className={`px-4 py-3 text-left font-medium ${toneText[c.tone]}`}>{c.label}</th>
                <td className={td}>
                  {c.max === null ? `${c.min} or more` : c.min === 0 ? `Under ${c.max}` : `${c.min} to ${(c.max - 0.1).toFixed(1)}`}
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </ContentSection>

      <ContentSection id="limits" title="What BMI can and cannot tell you">
        <p>
          BMI is a quick screening number, not a diagnosis. It ignores where weight is carried, muscle mass, age and
          family history. It is meant for adults aged 18 and over. If your result is outside the healthy range, or you
          are worried about your weight, speak to a doctor or dietitian.
        </p>
      </ContentSection>
    </CalculatorPage>
  );
}
