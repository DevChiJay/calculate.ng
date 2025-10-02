This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Data Sources & References

This project’s financial calculators leverage reputable Nigerian regulatory and statistical sources. Always verify figures against the latest official releases before production use.

### Tax (Personal Income / PAYE)
- Federal Inland Revenue Service (FIRS) – Personal Income Tax Act (PITA) and Finance Act amendments.
- Official publications and circulars for current tax brackets, relief allowances, and minimum tax provisions.
- Core references: Finance Act 2024 updates to brackets & relief computations.

### Consumer Price Index (CPI) / Inflation
- National Bureau of Statistics (NBS) – Monthly CPI Bulletins and Annual Statistical Reports.
- CPI base and methodology derived from NBS releases (composite all-items index).
- Data access layer includes a fallback static dataset (see `src/lib/data/nigeria-cpi.ts`) and an abstraction for future API integration (`src/lib/data/cpi-source.ts`).

### Pension (Contributory Pension Scheme)
- National Pension Commission (PenCom) – Guidelines on the Contributory Pension Scheme (CPS).
- Statutory contribution rates and pensionable earnings definitions (employee / employer splits) from PenCom regulatory circulars.
- Future calculator scaffold located in `src/components/calculators/PensionCalculator.tsx` (placeholder pending full implementation).

### Disclaimer
The calculators are for informational and educational purposes only and should not be considered financial, tax, or legal advice. Consult qualified professionals for definitive guidance.

