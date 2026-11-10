export const site = {
  name: "Calculate.ng",
  url: "https://calculate.ng",
  tagline: "Nigerian tax, inflation and BMI calculators",
  owner: { name: "Devchi Digital", url: "https://devchi.me" },
  contact: { email: "support@devchi.me", phone: "+234 701 165 5197", phoneHref: "+2347011655197" },
  social: {
    github: "https://github.com/devchijay",
    x: "https://x.com/devchijay",
  },
} as const;

export interface CalculatorItem {
  path: string;
  name: string;
  short: string;
  blurb: string;
  /** Paths of the most relevant other calculators, best first. Padded automatically (see relatedTo). */
  related: readonly string[];
}

export interface CalculatorGroup {
  id: string;
  name: string;
  blurb: string;
  items: readonly CalculatorItem[];
}

/**
 * The single source of truth for what calculators exist and how they are grouped.
 * Feeds the header menu, hub page, home page, footer, related links and (with src/lib/seo.ts) the sitemap.
 */
export const calculatorGroups: readonly CalculatorGroup[] = [
  {
    id: "income-tax",
    name: "Income & tax",
    blurb: "Pay, take-home and tax",
    items: [
      {
        path: "/tax-calculator",
        name: "Income tax (PAYE)",
        short: "Tax",
        blurb: "Estimate PAYE and take-home pay under the Nigeria Tax Act 2025, monthly and yearly.",
        related: ["/net-to-gross-calculator"],
      },
      {
        path: "/net-to-gross-calculator",
        name: "Net to gross salary",
        short: "Net to gross",
        blurb: "Find the gross pay you need to take home a target amount, under the 2026 PAYE rules.",
        related: ["/tax-calculator"],
      },
    ],
  },
  {
    id: "money",
    name: "Money",
    blurb: "Loans, savings and the value of the naira",
    items: [
      {
        path: "/inflation-calculator",
        name: "Inflation",
        short: "Inflation",
        blurb: "See how the value of the naira has changed between two years.",
        related: [],
      },
    ],
  },
  {
    id: "everyday",
    name: "Everyday",
    blurb: "Student grades and health",
    items: [
      {
        path: "/bmi-calculator",
        name: "BMI",
        short: "BMI",
        blurb: "Check your body mass index in metric or imperial units.",
        related: [],
      },
    ],
  },
];

/** Flat list of every calculator, in group order. */
export const calculators: readonly CalculatorItem[] = calculatorGroups.flatMap((g) => g.items);

export function getCalculator(path: string): CalculatorItem | undefined {
  return calculators.find((c) => c.path === path);
}

/** The group a calculator belongs to. */
export function groupOf(path: string): CalculatorGroup | undefined {
  return calculatorGroups.find((g) => g.items.some((i) => i.path === path));
}

/**
 * Up to `max` other calculators to link from a page: its declared `related` ones first, then the rest of
 * its own group, then anything else, so a page never ends in a dead end. Never includes the page itself.
 */
export function relatedTo(path: string, max = 3): CalculatorItem[] {
  const self = getCalculator(path);
  const ordered = [
    ...(self?.related ?? []).map(getCalculator),
    ...(groupOf(path)?.items ?? []),
    ...calculators,
  ].filter((c): c is CalculatorItem => !!c && c.path !== path);
  return [...new Map(ordered.map((c) => [c.path, c])).values()].slice(0, max);
}
