# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Next.js dev server (Turbopack), http://localhost:3000
- `npm run build` / `npm start` — production build / serve
- `npm run lint` / `npm run lint:fix` — `next lint` (ESLint 9 flat config, `eslint.config.mjs`)
- `npm run build:analyze` — build with `@next/bundle-analyzer` (`ANALYZE=true`)
- `npm run build:prod` — runs `scripts/pre-deployment-check.js` (checks `public/robots.txt`, `sitemap.xml`, `manifest.json` exist, flags large files in `public/`, checks metadata in `layout.tsx`), then builds
- There is **no test runner** (no jest/vitest, no test files). Type-check with `npx tsc --noEmit`.

## Stack

Next.js 15 App Router, React 19, TypeScript (strict; `@/*` → `src/*`), Tailwind CSS v4 (`@tailwindcss/postcss`), shadcn-style UI (`components.json`) on Radix, framer-motion, chart.js / recharts. No backend — all state is client-side.

## Architecture

Three calculators (BMI, Nigerian income tax, Nigerian inflation/CPI), wired the same way:

`src/app/<name>-calculator/page.tsx` — server component: `metadata`, JSON-LD `<script>`, lazy-loads the calculator via `next/dynamic` with a skeleton, wraps it in `ThemedCalculatorPage` + `ToastProvider`
→ `src/components/calculators/Enhanced<Name>Calculator.tsx` — client UI
→ `src/hooks/use<Name>Calculator.ts` — form state, debounced auto-calc, simulated "progress", validation (tax and inflation only; the BMI component holds its own state)
→ `src/lib/calculations/<name>.ts` — pure calculation + `validate*Inputs`, fed by `src/lib/data/*` (tax brackets/reliefs, CPI series).

Shared tax/inflation types are in `src/types/calculator.ts`; BMI types are exported from `src/lib/calculations/bmi.ts`.

Things that span files:

- **Tax rules are hard-coded** in `src/lib/data/nigeria-tax-brackets.ts` (2024/2025 PITA bands 7–24%, Consolidated Relief Allowance, minimum tax). `Guide.md` says this is out of date versus the Nigeria Tax Act 2025 (effective 1 Jan 2026: new bands 0–25%, CRA removed, rent relief rules unclear) and suggests moving rules into a versioned config (e.g. `rules/2026.ts`). Guide.md's own figures are explicitly unverified — check against the Act before changing rates. The old regime is baked into `AllowanceBreakdown.consolidatedRelief` (types) and the `taxYear: '2024'` form default; note `taxYear` is a UI field only and is not passed into `calculateTaxResult`.
- **CPI data**: `src/lib/data/cpi-source.ts` is the data-access layer (1-hour in-memory cache, in-flight dedupe, falls back to static `NIGERIA_CPI_DATA` in `nigeria-cpi.ts`). The "remote" fetch is a stub that returns the static data. Base is May 2009 = 100; the series is sparse (not every month is present).
- **History**: `src/lib/services/storage.ts` (`LocalStorageService`, versioned, key `calculator_history`) behind `useCalculatorHistory` / `HistoryDisplay`. SSR-guarded with `typeof window`. Exports json/csv/pdf (jspdf + html2canvas).
- **Theming** (details in `THEME_SYSTEM.md`): `next-themes` handles light/dark (class strategy); a separate `CalculatorThemeProvider` gives each calculator a colour scheme (`bmi`=Ocean, `tax`=Royal, `inflation`=Sunset) via CSS custom properties in `globals.css`, configured in `src/lib/theme-config.ts` and persisted by `src/lib/theme-storage.ts`. `ThemedCalculatorPage` sets the theme on mount and resets to `default` on unmount. Adding a theme means touching `globals.css`, `theme-config.ts`, and the `CalculatorTheme` type.
- **Root layout** (`src/app/layout.tsx`): header/sidebar/footer shell, skip-to-content link, `ErrorBoundary`. `GoogleAnalytics` renders only in production; `PerformanceIndicator` only in development (both via `next/dynamic`).
- `next.config.ts`: `removeConsole` in production, immutable cache headers on static assets, `transpilePackages` for recharts/framer-motion.
- `public/sitemap.xml`, `robots.txt`, `manifest.json` are hand-maintained — update `sitemap.xml` when adding a calculator page.

## Project goals and known issues (from Guide.md / copilot-instructions.md)

- Mobile-first and accessible; one H1 per page. Each calculator page should show meaningful text without JavaScript so crawlers can read it.
- Polish goals in Guide.md: `WebApplication` structured data (pages currently use `FinancialProduct`), an "estimate, not tax advice" note, a "Built by Devchi Digital" footer link, Lighthouse 90+ on mobile.
- Known issues listed in Guide.md: outdated tax data, vulnerable dependencies, unused dependencies.
- README mentions a Pension calculator (`PensionCalculator.tsx`); it does not exist yet.
