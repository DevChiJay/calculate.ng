import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CalculatorCard } from "@/components/calculator-card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { buttonVariants } from "@/components/ui/button";
import { pageMetadata } from "@/lib/seo";
import { calculatorGroups } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata = pageMetadata("/");

const reasons = [
  {
    title: "Current rules, with dates",
    body: "The tax calculator follows the Nigeria Tax Act 2025 and shows the date its rules took effect and when we last checked them.",
  },
  {
    title: "Workings shown",
    body: "Every result comes with the steps behind it, so you can see where the number came from and check it.",
  },
  {
    title: "Private by design",
    body: "Calculations run in your browser. What you type is not sent to us or saved. There is nothing to sign up for.",
  },
];

export default function HomePage() {
  return (
    <div className="container-x py-12 sm:py-16">
      <section aria-labelledby="hero" className="max-w-3xl">
        <Eyebrow className="mb-4">Free · No sign-up</Eyebrow>
        <h1 id="hero" className="text-4xl font-semibold leading-[1.08] sm:text-5xl md:text-6xl">
          Free Nigerian calculators for tax, loans, savings and more
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground sm:text-xl">
          Work out your take-home pay under the 2026 tax rules, the real cost of a loan, how your savings grow, your CGPA
          and more. Clear answers in seconds, with the workings shown.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/tax-calculator" className={cn(buttonVariants({ size: "lg" }))}>
            Calculate my PAYE tax <ArrowRight aria-hidden />
          </Link>
          <Link href="/calculators" className={cn(buttonVariants({ size: "lg", variant: "outline" }))}>
            All calculators
          </Link>
        </div>
      </section>

      <div className="mt-16 space-y-10">
        {calculatorGroups.map((g) => (
          <section key={g.id} aria-labelledby={`home-${g.id}`}>
            <h2 id={`home-${g.id}`} className="text-xl font-semibold sm:text-2xl">
              {g.name}
            </h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map((c) => (
                <li key={c.path}>
                  <CalculatorCard item={c} badge={c.path === "/tax-calculator" ? "Updated for 2026" : undefined} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section aria-labelledby="why" className="mt-16">
        <h2 id="why" className="text-2xl font-semibold sm:text-3xl">
          Why use Calculate.ng
        </h2>
        <ul className="mt-6 grid gap-6 md:grid-cols-3">
          {reasons.map((r) => (
            <li key={r.title}>
              <h3 className="text-lg font-semibold">{r.title}</h3>
              <p className="mt-2 text-muted-foreground">{r.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
