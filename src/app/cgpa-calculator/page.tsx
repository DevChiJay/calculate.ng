import { CgpaCalculator } from "@/components/calculators/cgpa-calculator";
import { CalculatorPage } from "@/components/calculator-page";
import { ContentSection, DataTable, td, th, type FaqItem } from "@/components/content";
import { Notice } from "@/components/ui/notice";
import { SCALES, computeResult, type Course } from "@/lib/calculations/cgpa";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/cgpa-calculator");

// Worked example, computed with the same functions as the calculator so the copy cannot drift from the maths.
const exampleCourses: (Course & { code: string })[] = [
  { code: "Course 1", units: 3, grade: "A" },
  { code: "Course 2", units: 2, grade: "B" },
  { code: "Course 3", units: 3, grade: "C" },
  { code: "Course 4", units: 2, grade: "B" },
  { code: "Course 5", units: 1, grade: "A" },
];
const example = computeResult(exampleCourses, "5.0");
const points = (grade: string) => SCALES["5.0"].grades.find((g) => g.grade === grade)!.points;

const faq: FaqItem[] = [
  {
    question: "How is GPA calculated?",
    answer:
      "Multiply each course's grade points by its credit units, add those up, and divide by the total credit units. On the 5.0 scale an A is 5, B is 4, C is 3, D is 2, E is 1 and F is 0. Failed courses still count in the total units.",
  },
  {
    question: "What is the difference between GPA and CGPA?",
    answer:
      "GPA covers one semester. CGPA, the cumulative grade point average, covers all your semesters so far. To get it, add up the quality points from every semester and divide by every credit unit taken.",
  },
  {
    question: "How do I add my earlier results?",
    answer:
      "Open \"Include earlier semesters\", then enter your previous CGPA and the total credit units it covers. The calculator weights them by units and combines them with the courses you entered.",
  },
  {
    question: "What CGPA do I need for a First Class?",
    answer:
      "On the commonly used 5.0 scale, a First Class is a CGPA from 4.50 to 5.00. Second Class Upper is 3.50 to 4.49, Second Class Lower is 2.40 to 3.49, Third Class is 1.50 to 2.39 and a Pass is 1.00 to 1.49. Universities can apply their own rules, so check with yours.",
  },
  {
    question: "Why is there no degree class for the 4.0 scale?",
    answer:
      "Some universities use a 4.0 scale, but the class bands differ between them and we have no reliable source for a single set. The calculator gives your GPA and CGPA on the 4.0 scale and leaves the class to your university.",
  },
  {
    question: "Does this site store my grades?",
    answer: "No. The calculation runs in your browser and nothing you enter is sent or saved.",
  },
];

export default function CgpaCalculatorPage() {
  return (
    <CalculatorPage
      path="/cgpa-calculator"
      appName="CGPA Calculator"
      breadcrumb="CGPA calculator"
      category="EducationalApplication"
      eyebrow="Students"
      title="CGPA Calculator for Nigerian Universities"
      intro="Add your courses with their credit units and grades to see your semester GPA, and add earlier results to see your cumulative CGPA and degree class."
      calculator={<CgpaCalculator />}
      faq={faq}
    >
      <ContentSection id="how" title="How GPA and CGPA are calculated">
        <p>
          <strong>GPA = Σ (grade points × credit units) ÷ Σ credit units</strong>. The result is rounded to two decimal
          places. For <strong>CGPA</strong>, include the quality points and units from your earlier semesters.
        </p>
        <DataTable caption="Worked example of a semester GPA on the 5.0 scale">
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className={th}>Course</th>
              <th scope="col" className={`${th} text-right`}>Units</th>
              <th scope="col" className={`${th} text-right`}>Grade</th>
              <th scope="col" className={`${th} text-right`}>Points</th>
              <th scope="col" className={`${th} text-right`}>Quality points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {exampleCourses.map((c) => (
              <tr key={c.code}>
                <td className={td}>{c.code}</td>
                <td className={`${td} text-right`}>{c.units}</td>
                <td className={`${td} text-right`}>{c.grade}</td>
                <td className={`${td} text-right`}>{points(c.grade)}</td>
                <td className={`${td} text-right`}>{points(c.grade) * c.units}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border font-semibold">
              <td className={td}>Total</td>
              <td className={`${td} text-right`}>{example.semester!.units}</td>
              <td className={td} />
              <td className={td} />
              <td className={`${td} text-right`}>{example.semester!.qualityPoints}</td>
            </tr>
          </tfoot>
        </DataTable>
        <p>
          {example.semester!.qualityPoints} ÷ {example.semester!.units} = <strong>{example.semester!.gpa.toFixed(2)}</strong>.
        </p>
      </ContentSection>

      <ContentSection id="scales" title="Grade points and degree classes">
        <p>
          The 5.0 scale below is the one most Nigerian universities use. Score ranges are a guide and vary by
          institution.
        </p>
        <DataTable caption="Grade points on the 5.0 and 4.0 scales">
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className={th}>Grade</th>
              <th scope="col" className={`${th} text-right`}>Points (5.0)</th>
              <th scope="col" className={`${th} text-right`}>Typical score</th>
              <th scope="col" className={`${th} text-right`}>Points (4.0)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {SCALES["5.0"].grades.map((g) => {
              const four = SCALES["4.0"].grades.find((x) => x.grade === g.grade);
              return (
                <tr key={g.grade}>
                  <th scope="row" className="px-4 py-3 text-left font-medium">{g.grade}</th>
                  <td className={`${td} text-right`}>{g.points}</td>
                  <td className={`${td} text-right`}>{g.scoreRange}</td>
                  <td className={`${td} text-right`}>{four ? four.points : "–"}</td>
                </tr>
              );
            })}
          </tbody>
        </DataTable>
        <DataTable caption="Degree classes on the 5.0 scale">
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className={th}>Degree class</th>
              <th scope="col" className={`${th} text-right`}>CGPA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {SCALES["5.0"].classes.map((c) => (
              <tr key={c.id}>
                <th scope="row" className="px-4 py-3 text-left font-medium">{c.label}</th>
                <td className={`${td} text-right`}>
                  {c.min.toFixed(2)} to {c.max.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
        <Notice>
          These bands come from published commentary on Nigerian university standards and have not been confirmed against
          the National Universities Commission. Your university&apos;s own regulations decide your class.
        </Notice>
      </ContentSection>
    </CalculatorPage>
  );
}
