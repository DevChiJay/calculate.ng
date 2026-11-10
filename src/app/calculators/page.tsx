import { CalculatorCard } from "@/components/calculator-card";
import { JsonLd } from "@/components/json-ld";
import { PageHeader } from "@/components/page-header";
import { breadcrumbSchema, collectionSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";
import { calculatorGroups } from "@/lib/site";

export const metadata = pageMetadata("/calculators");

export default function CalculatorsHubPage() {
  return (
    <div className="container-x py-10 sm:py-14">
      <JsonLd data={collectionSchema(calculatorGroups)} />
      <JsonLd data={breadcrumbSchema("/calculators", "All calculators")} />

      <PageHeader eyebrow="All calculators" title="Free Nigerian calculators">
        Pick a calculator. Each one shows its workings, runs in your browser, and does not store what you enter.
      </PageHeader>

      <div className="space-y-12">
        {calculatorGroups.map((g) => (
          <section key={g.id} aria-labelledby={`group-${g.id}`}>
            <h2 id={`group-${g.id}`} className="text-2xl font-semibold">
              {g.name}
            </h2>
            <p className="mt-1 text-muted-foreground">{g.blurb}</p>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map((c) => (
                <li key={c.path}>
                  <CalculatorCard item={c} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
