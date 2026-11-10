# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev`: Next.js dev server (Turbopack), http://localhost:3000
- `npm run build` / `npm start`: production build / serve
- `npm test`: Vitest (`vitest run`); one file: `npx vitest run src/lib/tax/engine.test.ts`
- `npm run typecheck` (`tsc --noEmit`) and `npm run lint` (`eslint .`, flat config in `eslint.config.mjs`; `next build` no longer lints)
- `npm run build:analyze`: bundle analysis (webpack build, `ANALYZE=true`)
- `npm run pre-deploy`: `scripts/pre-deployment-check.mjs` (generated SEO routes present, no static files shadowing them, every page in `src/lib/seo.ts` exists)

## Stack

Next.js 16 App Router (Turbopack), React 19, TypeScript (strict, `@/*` → `src/*`), Tailwind CSS v4 (tokens in `src/app/globals.css`, no tailwind config file), Radix Dialog (mobile menu) and `next-themes`. No backend and no database: calculations run in the browser and nothing the user types is stored or sent.

## Architecture

Three calculators, each a **server page that wraps a small client island**:

`src/app/<name>-calculator/page.tsx`: server component with `pageMetadata()`, JSON-LD (`WebApplication`, `BreadcrumbList`, `FAQPage`) and all explanatory copy (tables, FAQ, disclaimers), so the text is in the HTML without JavaScript
→ `src/components/calculators/<name>-calculator.tsx`: client island (form state in `useState`, results from `useMemo`, no debounce or fake delay)
→ `src/lib/...`: pure, tested logic.

- **Tax** (`src/lib/tax/`): `engine.ts` `computeTax(inputs, rules)` and `validateTaxInputs` are pure and take a rules object; rules are data in `rules/2026.ts` (Nigeria Tax Act 2025, in force 1 Jan 2026) and `rules/2024.ts` (legacy PITA, kept only for the old-vs-new comparison in `compare.ts`). Each rules file carries `effectiveFrom`, `lastChecked`, `sources` and per-deduction `verified` flags; the page renders these. **Pension, NHF, NHIS and life insurance are user-declared amounts flagged unverified** (sourced from commentary, not the Act text); bands and rent relief (20%, cap ₦500k) are cross-checked. Never derive deductions from gross. When rules change, add a new `rules/<year>.ts`, register it in `rules/index.ts`, update tests, and bump `updated` in `src/lib/seo.ts`.
- **Tax UI state is shareable**: the form syncs to the query string (`income`, `period`, `rent`, `pension`, `nhf`, `nhis`, `life`) via `history.replaceState`; the page itself stays static.
- **BMI** (`src/lib/calculations/bmi.ts`): WHO adult categories chosen on the 1-decimal value shown to the user.
- **Inflation** (`src/lib/calculations/inflation.ts` + `src/lib/data/nigeria-cpi.ts`): maths take an injected CPI lookup. **The CPI dataset is known to be unreliable (synthetic-looking, ends May 2025, does not handle NBS's Jan 2025 rebase to 2024=100) and is awaiting replacement; do not deploy the inflation page as-is.**
- **SEO is generated, not static**: `src/lib/seo.ts` holds per-page title/description/`updated` and feeds `pageMetadata()`, `app/sitemap.ts`, and the pre-deploy check. Also `app/robots.ts`, `app/manifest.ts`, `app/opengraph-image.tsx`, `src/lib/schema.ts` (JSON-LD builders) and `src/lib/site.ts` (name, URL, owner, contact, calculator list). Adding a calculator = a page, an entry in `seo.ts` and `site.ts`.
- **Design system** is shared with devchi.me (`/Users/devchi/LocalDisk/Work/Devchi-Digital`): same palette, Geist + Space Grotesk, 0.875rem radius. Deliberately flat: no glows, gradients, grid textures, per-calculator themes or heavy animation (Guide.md). Dark by default; light/system via `ThemeToggle`. Primitives in `src/components/ui/` (button, `field.tsx` labelled inputs with native `<select>`, `segmented.tsx` radio group, notice/tag, breakdown bar); page copy blocks in `src/components/content.tsx`. Controls must keep 44px tap targets, 16px input text, and AA contrast in both themes.
- **Layout shell** (`src/app/layout.tsx`): skip link, `SiteHeader` (sheet menu closes on navigation), server-rendered `SiteFooter` (visible "Built by Devchi Digital" link), `GoogleAnalytics` in production only (`NEXT_PUBLIC_GA_ID`, falls back to the existing property).
- React lint rules are strict (`react-hooks/set-state-in-effect`): derive state or use `useSyncExternalStore` instead of setting state in effects (see `tax-calculator.tsx`, `theme-toggle.tsx`, `site-header.tsx`).
- `next.config.ts`: minimal (`removeConsole` in production, optional bundle analyzer). Hashed assets are cached by Next; do not add immutable cache headers for unhashed `public/` files.

## Project notes

- `Guide.md` holds the owner's polish guide and known issues (some items are unverified there; verify before acting).
- `.ui-audit/` holds the before/after screenshots, axe and Lighthouse results and `REPORT.md` (with a follow-ups list); `docs/superpowers/specs/` holds the redesign spec.
- No Pension calculator exists, despite older README text.
