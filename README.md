# Calculate.ng

Free Nigerian calculators: 2026 PAYE income tax (Nigeria Tax Act 2025), net-to-gross salary, VAT, loans, savings, CGPA, inflation (CPI) and BMI. Built by [Devchi Digital](https://devchi.me).

Next.js 16 (App Router), React 19, Tailwind CSS v4. Calculations run in the browser; nothing a user types is stored or sent.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # unit tests (tax engine, net-to-gross, CGPA, loan, savings, VAT, BMI, inflation maths)
npm run typecheck
npm run lint
npm run build
npm run e2e        # after a build: browser regression suite (Playwright + axe)
```

Before deploying: `npm run pre-deploy`.

## Where things are

- `src/app/*-calculator/page.tsx`: server pages with all copy, metadata and structured data
- `src/components/calculators/`: the interactive client components
- `src/lib/tax/`: versioned tax rules (`rules/`) and the pure engine
- `src/lib/seo.ts`: per-page SEO copy; drives metadata, the sitemap and the pre-deploy check

See `CLAUDE.md` for architecture notes and `.ui-audit/REPORT.md` for the audit and redesign report.

## Data sources and accuracy

- **Income tax:** Nigeria Tax Act 2025, in force from 1 January 2026. Bands and rent relief are cross-checked against several published commentaries; pension, NHF, NHIS and life-insurance deductions are user-entered and marked "unverified" until confirmed against the Act's text. Rules and the date they were last checked are shown on the page and in `src/lib/tax/rules/`.
- **VAT:** the 7.5% standard rate is cross-checked; which items carry VAT is not decided by the calculator (sources disagree).
- **CGPA:** 5.0 and 4.0 scales; degree classes (5.0 only) come from published commentary and are not confirmed against the NUC.
- **Loans and savings:** standard annuity and compound-interest maths; formulas and assumptions are stated on each page.
- **Inflation:** National Bureau of Statistics (NBS) Consumer Price Index. The bundled dataset is being replaced with current NBS figures.
- **BMI:** World Health Organization adult categories.

## Disclaimer

For information only. Not tax, financial or medical advice. Check figures against official sources before relying on them.
