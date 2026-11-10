import { ContentSection, FaqList, type FaqItem } from "@/components/content";
import { JsonLd } from "@/components/json-ld";
import { PageHeader } from "@/components/page-header";
import { RelatedCalculators } from "@/components/related-calculators";
import { breadcrumbSchema, faqSchema, webApplicationSchema, type CalculatorPath } from "@/lib/schema";

interface CalculatorPageProps {
  path: CalculatorPath;
  /** Short name used in JSON-LD, e.g. "BMI Calculator". */
  appName: string;
  /** Breadcrumb label, e.g. "BMI calculator". */
  breadcrumb: string;
  category: Parameters<typeof webApplicationSchema>[2];
  eyebrow: string;
  title: string;
  /** One or two sentences under the H1. */
  intro: React.ReactNode;
  /** Optional line directly under the intro (e.g. "Rules effective … last checked …"). */
  status?: React.ReactNode;
  /** The interactive client island. */
  calculator: React.ReactNode;
  /** Explanatory sections (ContentSection blocks), shown below the calculator. */
  children?: React.ReactNode;
  faq: FaqItem[];
}

/**
 * Server shell shared by every calculator page, so they all have the same structure: one H1, structured
 * data, the calculator, explanatory copy, an FAQ (also emitted as FAQPage JSON-LD) and related links.
 */
export function CalculatorPage({
  path,
  appName,
  breadcrumb,
  category,
  eyebrow,
  title,
  intro,
  status,
  calculator,
  children,
  faq,
}: CalculatorPageProps) {
  return (
    <div className="container-x py-10 sm:py-14">
      <JsonLd data={webApplicationSchema(path, appName, category)} />
      <JsonLd data={breadcrumbSchema(path, breadcrumb)} />
      <JsonLd data={faqSchema(faq)} />

      <PageHeader eyebrow={eyebrow} title={title}>
        {intro}
      </PageHeader>
      {status && <p className="-mt-4 mb-8 text-sm text-muted-foreground">{status}</p>}

      {calculator}

      {children}

      <ContentSection id="faq" title="Frequently asked questions">
        <FaqList items={faq} />
      </ContentSection>

      <RelatedCalculators path={path} />
    </div>
  );
}
