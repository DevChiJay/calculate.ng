# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev`: Next.js dev server (Turbopack), http://localhost:3000
- `npm run build` / `npm start`: production build / serve
- `npm test`: Vitest (`vitest run`); one file: `npx vitest run src/lib/tax/engine.test.ts`
- `npm run typecheck` (`tsc --noEmit`) and `npm run lint` (`eslint .`, flat config in `eslint.config.mjs`; `next build` no longer lints)
- `npm run build:analyze`: bundle analysis (webpack build, `ANALYZE=true`)
- `npm run pre-deploy`: `scripts/pre-deployment-check.mjs` (generated SEO routes present, no static files shadowing them, every page in `src/lib/seo.ts` exists)
- `npm run build && npm run e2e`: browser regression suite in `e2e/` (Playwright + axe, driving your installed Chrome, ~240 checks across every calculator, both colour schemes, the menus and 375px). `e2e/run.mjs` starts `next start` on port 3199 and runs each suite. Update `CALCULATORS` in `e2e/run.mjs` when adding a calculator.

## Stack

Next.js 16 App Router (Turbopack), React 19, TypeScript (strict, `@/*` → `src/*`), Tailwind CSS v4 (tokens in `src/app/globals.css`, no tailwind config file), Radix Dialog (mobile menu) and `next-themes`. No backend and no database: calculations run in the browser and nothing the user types is stored or sent.

## Architecture

Eight calculators in three groups (Income & tax: PAYE, net to gross, VAT; Money: loan, savings, inflation; Everyday: CGPA, BMI), each a **server page that wraps a small client island**:

`src/app/<name>-calculator/page.tsx`: server component using the `CalculatorPage` shell (`src/components/calculator-page.tsx`: one H1, `WebApplication`/`BreadcrumbList`/`FAQPage` JSON-LD, the FAQ, related links) with `pageMetadata()` and all explanatory copy (tables, worked examples, disclaimers), so the text is in the HTML without JavaScript. Worked examples and tables on pages are **computed from the same functions the calculator uses**, never hand-typed.
→ `src/components/calculators/<name>-calculator.tsx`: client island (form state in `useState`, results from `useMemo`, no debounce or fake delay), built from `calculators/shared.tsx` (`CalculatorGrid`, `FormPanel`, `ResultPanel`, `Headline(s)`, `MoreDetails`, `ResultPlaceholder`)
→ `src/lib/...`: pure, tested logic (TDD: write the hand-calculated test first).

**Adding a calculator:** logic + tests in `src/lib/`, client component, page, an item in the right group in `src/lib/site.ts` (`calculatorGroups`: feeds the header menu, hub, home, footer, related links), an entry in `src/lib/seo.ts` (title ≤60, description 70–160 chars, `updated`), an e2e suite, and bump `CALCULATORS` in `e2e/run.mjs`. `src/lib/site.test.ts` and `seo.test.ts` enforce registry/SEO integrity (max 4 per group, unique paths and titles).

**UI budget (keep the UI uncluttered):** at most 4 visible inputs (a number plus its unit select counts as one `UnitField`); everything else goes in a `MoreDetails` "More options"; one primary result card with at most 2 headline figures, detail collapsed; at most one notice visible; no tabs, charts or modals.

**Navigation:** one "Calculators" disclosure menu in the header (`calculators-menu.tsx`; Escape/outside click/navigation close it), a `/calculators` hub page, grouped footer, and at most 3 related links per page (`relatedTo()` in `site.ts`, declared `related` first, padded so no page is a dead end).

- **Tax** (`src/lib/tax/`): `engine.ts` `computeTax(inputs, rules)` and `validateTaxInputs` are pure and take a rules object; rules are data in `rules/2026.ts` (Nigeria Tax Act 2025, in force 1 Jan 2026) and `rules/2024.ts` (legacy PITA, kept only for the old-vs-new comparison in `compare.ts`). Each rules file carries `effectiveFrom`, `lastChecked`, `sources` and per-deduction `verified` flags; the page renders these. **Pension, NHF, NHIS and life insurance are user-declared amounts flagged unverified** (sourced from commentary, not the Act text); bands and rent relief (20%, cap ₦500k) are cross-checked. Never derive deductions from gross. When rules change, add a new `rules/<year>.ts`, register it in `rules/index.ts`, update tests, and bump `updated` in `src/lib/seo.ts`.
- **Tax UI state is shareable**: the form syncs to the query string (`income`, `period`, `rent`, `pension`, `nhf`, `nhis`, `life`) via `history.replaceState`; the page itself stays static.
- **Net to gross** (`src/lib/tax/gross-up.ts`): `solveGross` bisects over `computeTax` (take-home is strictly increasing in gross because marginal tax ≤ 25%); `amount` is the desired take-home. Shares `useTaxForm`, `TaxFormFields`, `TaxWorkings` and `tax-params.ts` with the PAYE page; the share-link key for the amount differs (`takehome` vs `income`).
- **VAT** (`src/lib/calculations/vat.ts`, `src/lib/vat/rules.ts`): rate 7.5% is Confirmed; exempt vs zero-rated lists and the small-business threshold are unverified (sources disagree), so the person picks the rate and the page never decides scope. Net + VAT always equals gross exactly (VAT is the difference after rounding).
- **CGPA** (`src/lib/calculations/cgpa.ts`): 5.0 and 4.0 scales and degree classes are data. Classes exist only for 5.0 and are unverified against the NUC; no class is shown for 4.0. Classification uses the 2-decimal value shown.
- **Loan** (`loan.ts`, `finance.ts`): flat (interest on the original amount) or reducing balance, rates per year or per month, upfront fee deducted from the amount received, effective annual rate via IRR of what was actually received vs the instalments. **Savings** (`savings.ts`): interest credited each compounding period on the balance at the start of that period; top-ups at month end earn from the next period (monthly compounding equals the ordinary annuity formula). Taxes/fees on interest are not modelled and say so.
- **BMI** (`src/lib/calculations/bmi.ts`): WHO adult categories chosen on the 1-decimal value shown to the user.
- **Inflation** (`src/lib/calculations/inflation.ts` + `src/lib/data/nigeria-cpi.ts`): maths take an injected CPI lookup. **The CPI dataset is known to be unreliable (synthetic-looking, ends May 2025, does not handle NBS's Jan 2025 rebase to 2024=100) and is awaiting replacement; do not deploy the inflation page as-is.**
- **SEO is generated, not static**: `src/lib/seo.ts` holds per-page title/description/`updated` and feeds `pageMetadata()`, `app/sitemap.ts`, and the pre-deploy check. Also `app/robots.ts`, `app/manifest.ts`, `app/opengraph-image.tsx`, `src/lib/schema.ts` (JSON-LD builders) and `src/lib/site.ts` (name, URL, owner, contact, calculator list). 
- **Design system** is shared with devchi.me (`/Users/devchi/LocalDisk/Work/Devchi-Digital`): same palette, Geist + Space Grotesk, 0.875rem radius. Deliberately flat: no glows, gradients, grid textures, per-calculator themes or heavy animation (Guide.md). Dark by default; light/system via `ThemeToggle`. Primitives in `src/components/ui/` (button, `field.tsx` labelled inputs with native `<select>`, `segmented.tsx` radio group, notice/tag, breakdown bar); page copy blocks in `src/components/content.tsx`. Controls must keep 44px tap targets, 16px input text, and AA contrast in both themes.
- **Layout shell** (`src/app/layout.tsx`): skip link, `SiteHeader` (sheet menu closes on navigation), server-rendered `SiteFooter` (visible "Built by Devchi Digital" link), `GoogleAnalytics` in production only (`NEXT_PUBLIC_GA_ID`, falls back to the existing property).
- React lint rules are strict (`react-hooks/set-state-in-effect`): derive state or use `useSyncExternalStore` instead of setting state in effects (see `tax-calculator.tsx`, `theme-toggle.tsx`, `site-header.tsx`).
- `next.config.ts`: minimal (`removeConsole` in production, optional bundle analyzer). Hashed assets are cached by Next; do not add immutable cache headers for unhashed `public/` files.

## Project notes

- `Guide.md` holds the owner's polish guide and known issues (some items are unverified there; verify before acting).
- `.ui-audit/` holds the before/after screenshots, axe and Lighthouse results and `REPORT.md` (with a follow-ups list); `docs/superpowers/specs/` holds the redesign spec.
- Not built (ideas only): pension, freelancer tax, JAMB aggregate, live FX. No backend or database exists or is planned for the current set.
