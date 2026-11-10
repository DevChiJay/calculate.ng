import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { buttonVariants } from "@/components/ui/button";
import { pageMetadata } from "@/lib/seo";
import { calculators } from "@/lib/site";
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
          Nigerian tax, inflation and BMI calculators
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground sm:text-xl">
          Work out your take-home pay under the 2026 tax rules, see what your naira was worth in an earlier year, or check
          your BMI. Clear answers in seconds, with the workings shown.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/tax-calculator" className={cn(buttonVariants({ size: "lg" }))}>
            Calculate my PAYE tax <ArrowRight aria-hidden />
          </Link>
        </div>
      </section>

      <section aria-labelledby="calculators" className="mt-16">
        <h2 id="calculators" className="text-2xl font-semibold sm:text-3xl">
          Choose a calculator
        </h2>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {calculators.map((c, i) => (
            <li key={c.path}>
              <Link
                href={c.path}
                className={cn(
                  "group flex h-full flex-col rounded-xl border bg-card p-6 transition-colors hover:border-primary",
                  i === 0 ? "border-primary/60" : "border-border",
                )}
              >
                {i === 0 && (
                  <span className="mb-3 w-fit rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
                    Updated for 2026
                  </span>
                )}
                <h3 className="text-xl font-semibold">{c.name}</h3>
                <p className="mt-2 flex-1 text-muted-foreground">{c.blurb}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary">
                  Open calculator
                  <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

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
