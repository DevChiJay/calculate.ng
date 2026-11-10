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

export const calculators = [
  {
    path: "/tax-calculator",
    name: "Income tax (PAYE)",
    short: "Tax",
    blurb: "Estimate PAYE and take-home pay under the Nigeria Tax Act 2025, monthly and yearly.",
  },
  {
    path: "/inflation-calculator",
    name: "Inflation",
    short: "Inflation",
    blurb: "See how the value of the naira has changed between two years.",
  },
  {
    path: "/bmi-calculator",
    name: "BMI",
    short: "BMI",
    blurb: "Check your body mass index in metric or imperial units.",
  },
] as const;
