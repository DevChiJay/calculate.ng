import type { Metadata } from "next";
import { site } from "@/lib/site";

/** Per-route SEO copy. Titles ≤ 60 chars, descriptions ≤ 160 chars. `updated` feeds the sitemap. */
export const pages = {
  "/": {
    title: "Nigerian Tax, Inflation & BMI Calculators | Calculate.ng",
    description:
      "Free Nigerian calculators: 2026 PAYE tax and take-home pay, inflation and the value of the naira, and BMI. Clear workings, no sign-up.",
    updated: "2026-11-10",
  },
  "/calculators": {
    title: "Nigerian Calculators: Tax, Loan, CGPA, VAT | Calculate.ng",
    description:
      "Browse free Nigerian calculators for PAYE tax, net salary, VAT, loans, savings, inflation, CGPA and BMI. Clear workings, no sign-up.",
    updated: "2026-11-10",
  },
  "/tax-calculator": {
    title: "Nigeria PAYE Tax Calculator 2026 (NTA 2025) | Calculate.ng",
    description:
      "Estimate your 2026 PAYE and take-home pay under the Nigeria Tax Act 2025. Monthly and yearly views, rent relief, and a comparison with the old rules.",
    updated: "2026-11-10",
  },
  "/net-to-gross-calculator": {
    title: "Net to Gross Salary Calculator Nigeria 2026 | Calculate.ng",
    description:
      "Find the gross salary you need for a target take-home pay under Nigeria's 2026 PAYE rules. Monthly and yearly, with rent relief and the workings shown.",
    updated: "2026-11-10",
  },
  "/loan-calculator": {
    title: "Nigeria Loan Calculator: Flat vs Reducing | Calculate.ng",
    description:
      "Work out monthly repayments, total interest and the true annual cost of a loan, with flat or reducing-balance interest and fees. See the full schedule.",
    updated: "2026-11-10",
  },
  "/savings-calculator": {
    title: "Savings & Compound Interest Calculator | Calculate.ng",
    description:
      "See how much your savings can grow with compound interest and monthly top-ups. Choose how often interest is added and see the year-by-year balance.",
    updated: "2026-11-10",
  },
  "/inflation-calculator": {
    title: "Nigeria Inflation Calculator (CPI) | Calculate.ng",
    description:
      "See how inflation has changed the value of your naira between two years, using Nigerian Consumer Price Index (CPI) data.",
    updated: "2026-11-10",
  },
  "/cgpa-calculator": {
    title: "CGPA Calculator (5.0 & 4.0 Scale, Nigeria) | Calculate.ng",
    description:
      "Calculate your semester GPA and cumulative CGPA on the Nigerian 5.0 scale or the 4.0 scale, and see your degree class. Add courses and credit units.",
    updated: "2026-11-10",
  },
  "/bmi-calculator": {
    title: "BMI Calculator (Metric & Imperial) | Calculate.ng",
    description:
      "Calculate your body mass index in kg and cm or lb and ft/in, see your WHO category and what it means. For adults aged 18 and over.",
    updated: "2026-11-10",
  },
} as const;

export type PagePath = keyof typeof pages;

const ogImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Calculate.ng: Nigerian tax, inflation and BMI calculators",
};

/** Page metadata with its own canonical, Open Graph and Twitter cards (nothing inherited from "/"). */
export function pageMetadata(path: PagePath): Metadata {
  const { title, description } = pages[path];
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: site.name,
      locale: "en_NG",
      type: "website",
      images: [ogImage],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImage.url] },
  };
}
