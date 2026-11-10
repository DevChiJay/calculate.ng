# Plan: Audit, research, UI refresh and redesign of Calculate.ng (local + live)

Path: **architectural** (superpowers:brainstorming). This plan is the design. First implementation step is to copy it into `docs/superpowers/specs/2026-11-10-calculate-ng-redesign-design.md`. Follow `anthropic-skills:ui-refresh` ground rules (branch `ui-refresh/2026-11-10`, small commits, `.ui-audit/` before/after) and load `frontend-design`, `seo-audit`, `artifact`-free tooling as needed.

## Context
Guide.md says: tax data is out of date, dependencies are vulnerable/unused, lead with the tax calculator (Nigeria Tax Act 2025, in force 1 Jan 2026; today is 10 Nov 2026), match the devchi.me studio look without glows/grid, every page must show text without JS, Lighthouse 90+ on mobile, "Built by Devchi Digital" footer, `WebApplication` JSON-LD. The audit below confirms all of that and finds more.

**Decisions from the user:** scope = tax first, then BMI/inflation; direction = match devchi.me, dark-first, no glows; tax rules = bands + rent relief fixed, pension/NHF/NHIS/life insurance as labelled user-declared inputs with a "verify" flag. Devchi.me source = `/Users/devchi/LocalDisk/Work/Devchi-Digital` (user chose "local path" but gave none; this repo has the same stack and a `DevChiJay/Devchi-Digital` remote — **confirm it is the right one**).

## Audit findings (evidence; the highest-impact ones)

**Correctness (user-visible, most serious)**
- Tax runs the *old* PITA regime (7–24%, CRA) and is wrong even for that: CRA lacks the 20%-of-gross part, minimum tax is 0.5% not 1%, pension is taken on gross, NHF/NHIS use an invented 70%-of-gross basic, net pay ignores deductions (`src/lib/calculations/tax.ts`, `src/lib/data/nigeria-tax-brackets.ts`).
- `taxYear` and the monthly/annual toggle do nothing (monthly only relabels). Bracket card is hard-coded "(2024)" with a typo (`EnhancedTaxCalculator.tsx:292-302`). Error messages are matched by substring so validation feedback is invisible in all three calculators.
- Inflation: CPI series is sparse, ends **May 2025**, and looks synthetic (e.g. Dec 2024 y/y 20.9% vs ~34.8% reported — verify). No handling of NBS's Jan 2025 rebase (2024=100). "Purchasing-power loss" formula is wrong. Year picker offers 2025/2026 which then silently fail. `cpi-source.ts` is a fake remote fetch and unused.
- BMI: category chosen on unrounded value; obese users get no tips (key mismatch); 0 ft 0 in passes validation; toast on every keystroke.

**Live site (calculate.ng, fetched)**: © 2025, "Made with in Nigeria" (missing glyph), unlabeled GitHub/X links, no tax bands or year on the tax page, sitemap `lastmod` 2025-06-05. PageSpeed API was rate-limited (429) — baseline must be run locally.

**SEO / no-JS**: all three calculator pages inherit canonical `/`; `og-image.jpg` and `public/icons/*` don't exist; manifest never linked; Tax JSON-LD is `FinancialProduct`; two H1s per calculator page; framer-motion `opacity:0` initial states ship in server HTML (calculator invisible until hydration); no bracket table/FAQ/method text in server HTML; no error/not-found pages.

**Performance/a11y**: 1.2–1.7 s of fake delay per calculation with leaking timers; infinite `FloatingElement` loops, per-card springs, backdrop-blur, no `prefers-reduced-motion`; Tailwind v4 + `oklch(from …)` fails on old Android WebViews; unlabeled Selects/Tabs, redundant ARIA, toast with no live region, low-contrast gradient headings and `text-green-500`/`yellow-500`, mobile sheet doesn't close on navigation, 36px tap targets.

**Dependencies** (`npm audit`: 2 critical, 5 high, 8 moderate): `next` 15.3.3 (critical, fix in 15.5.x), `jspdf` (critical; only reachable via dead history code), `aceternity-ui` (high, unused, no fix). Unused: `html2canvas`, `recharts`, `lottie-react`, `aceternity-ui`, `@tabler/icons-react`, `mini-svg-data-uri`, `react-gtm-module`, `@types/chart.js`, `@radix-ui/react-hover-card`, `cross-env`. Dead code: `HistoryDisplay`, `useCalculatorHistory`, `storage.ts`, `cpi-source.ts`, `validation.ts`, 4 ui components, many unused exports. (My CLAUDE.md wrongly says history/export uses jspdf+html2canvas — fix it.)

## Tax research (NTA 2025)
- **Confirmed (KPMG + others agree):** bands 0–800k 0%, –3m 15%, –12m 18%, –25m 21%, –50m 23%, >50m 25%; CRA eliminated; rent relief = lower of 20% of annual rent and ₦500,000 (declared, subject to verification); effective 1 Jan 2026.
- **Secondary-source only (Legal 500 summary of s.30(2)(a)):** pension 8% of basic+housing+transport (i), NHF 2.5% of basic (i), NHIS (ii), life insurance premium (v), owner-occupied housing-loan interest (iv). Other sources dispute NHF/NHIS. **Not verified against the gazetted Act** → ship as declared inputs with source + verify flag; do not auto-derive from gross.
- **Unknown:** whether any minimum-tax rule survives for individuals; minimum-wage exemption wording. Omit from 2026 rules until verified; list in the page's "Not modelled" note.
- Revenue authority is now the Nigeria Revenue Service (NRS); cite nrs.gov.ng Act PDF as the source to check. The PDF I fetched was a law-firm summary, not the Act.

## Approach (recommended)
Rebuild on devchi.me's design system and stack (identical: Next 15, React 19, Tailwind v4 `@theme inline`, shadcn, next-themes), cut heavy animation/charting libraries, and move all rules into pure, tested, versioned modules. Static-first: each page is a server component with real text; calculators are small client islands.

## Workstreams (in order; tax-first)

**0. Baseline (before any code change).** Create branch. Capture `.ui-audit/before/` screenshots at 375/768/1440, light+dark, and Lighthouse mobile for all 4 routes, local prod build *and* live (needs `npx playwright`/`npx lighthouse` — ask before installing). Run `npx tsc --noEmit` + `npm run lint` + `npm run build` to record what passes today. Keep the pre-existing `package-lock.json` change out of unrelated commits.

**1. Security/dependency hygiene.** Delete dead code and unused deps above; bump `next`/`eslint-config-next` to the 15.5.x patch line, `react`/`react-dom`, radix, tailwind patch versions (no majors); re-run `npm audit`. Remove `jspdf` + dead history subsystem (reinstate later only if PDF export is wanted — ask then). Remove `transpilePackages`, tighten `images.remotePatterns`, fix the `immutable` cache rule so non-hashed `public/` files aren't cached for a year.

**2. Design system + shell (all pages).** Port tokens from `Devchi-Digital/src/app/globals.css` (hex palette: teal `#22d3c5` dark / `#0b7a72` light, orange highlight, `--radius .875rem`, `--shadow-frame`), fonts Geist + Space Grotesk (drop Geist Mono), and `ui/{button,card,input,eyebrow,section-heading,sheet}` and `Providers` (`MotionConfig reducedMotion="user"`). **Drop `--glow`, grid, gradients, per-calculator theme system** (`calculator-theme-provider`, `theme-selector`, `theme-showcase`, `theme-config`, `theme-storage`, `animated-*`, `floating-elements`, `calculator-card` CSS) → one accent; update/delete `THEME_SYSTEM.md`. Replace chart.js doughnut with a lightweight CSS/SVG breakdown bar (drops chart.js, react-chartjs-2; likely framer-motion too — use CSS transitions). Top navbar replaces the sidebar (4 routes); sheet closes on navigate; 44px targets; footer as a server component with current year, calculator links, disclaimer and visible "Built by Devchi Digital" link to devchi.me (fix the missing glyph); add `not-found.tsx`, `error.tsx`, `global-error.tsx`; replace pseudo ErrorBoundary. Home page: tax first, real value-prop copy, remove ThemeShowcase and `<Link><Button>` nesting. Restyle BMI/inflation to tokens now (behaviour untouched until B).

**3. Tax calculator (flagship).**
- `src/lib/tax/{types.ts,rules/2024.ts,rules/2026.ts,rules/index.ts,engine.ts,compare.ts}` — pure `computeTax(inputs, rules)`; each rules file carries `effectiveFrom`, `lastChecked`, `sourceUrl`, per-relief `verified` flag. 2026 = bands + rent relief + declared deductions; 2024 corrected (CRA = max(₦200k, 1% gross) + 20% gross; min tax 1%) so old-vs-new comparison is honest. Replace `AllowanceBreakdown.consolidatedRelief` with a `reliefs: {id, amount, verified}[]` list. Real monthly/annual handling, net pay after deductions, discriminated-union validation (no substring matching).
- UI: gross income, period toggle, rent paid, optional declared deductions; results show annual + monthly PAYE, effective/marginal rate, net, old-vs-new card, band-by-band table; **shareable links** via URL query params using `useSearchParams`/`history.replaceState` (page stays static; server HTML shows a worked example). Remove all fake delays; compute synchronously.
- Server-rendered content: H1, intro, "Rules effective 1 Jan 2026 · last checked <date>" + source link, band table rendered from `rules/2026.ts`, how-it-works, reliefs explained with their verification status, FAQ (+ `FAQPage` JSON-LD), "estimate, not tax advice".

**4. SEO / no-JS infrastructure (all pages).** Per-page canonical via a `pageMetadata()` helper (copy pattern from `Devchi-Digital/src/lib/seo.ts`), `title.template`, OG/Twitter per page, `viewport`/`themeColor`/`manifest` link, `app/opengraph-image.tsx` (replaces missing jpg), real icons, `app/sitemap.ts` + `app/robots.ts` (replace hand-maintained XML; real `lastmod`), `WebApplication` JSON-LD (+ `offers` 0, `BreadcrumbList`) via a `JsonLd` component in `<head>`/top of body, home `WebSite`+`Organization`. Static-import the client calculators (remove `next/dynamic` skeletons) so content is visible at first paint; no `opacity:0` initial states. Move GA ID to env, fix double page-view, load after interaction. Verify with `curl`/view-source with JS disabled.

**5. Inflation (phase B).** Rebuild CPI dataset as typed series with explicit `base` and chain-link across the Jan 2025 rebase; extend through the latest NBS release (Aug/Sep 2026 per search) with source + "data through <month>, checked <date>" labels; monthly (not Jan–Dec) selection; linear interpolation for gaps; fix purchasing-power formula, UTC date parsing, hidden errors; drop duplicate types and fake fetch. **Risk:** obtaining exact NBS figures — fetch from nigerianstat.gov.ng/NBS bulletins; if unobtainable, ship clearly labelled data cut-off and flag. Existing synthetic early-years data must be replaced or labelled, not silently kept.

**6. BMI (phase B).** Categorise on rounded value, fix validation (imperial zero, bounds), tips mapping, single result heading, no toast spam, adult-only note; own server-rendered content/FAQ and JSON-LD.

**7. Accessibility + performance pass.** Label/`htmlFor`/`aria-describedby` on all controls, remove redundant ARIA on Radix, focus moves to results, `aria-live` results, AA contrast checked with `@axe-core/playwright`, `prefers-reduced-motion`, avoid `oklch(from …)` relative-colour syntax. Targets: Lighthouse mobile ≥90 in all four categories, no CLS, works at 375px, usable on Slow 4G.

**8. Tests.** Add Vitest (+ Testing Library for the form islands). Golden tests for `engine.ts` per rules version (band boundaries ₦800k/3m/12m/25m/50m, rent cap, monthly≡annual/12, 2024 vs 2026 comparison), CPI lookup/chain-link, BMI boundaries. Add `typecheck` and `test` scripts.

**9. Live site.** Read-only audits done now. After local verification, user chooses deploy path (hosting for calculate.ng not evident from repo; `.vercel` is git-ignored) — I will not push/deploy without approval. Post-deploy: re-fetch live HTML without JS, check canonical/OG/JSON-LD, Rich Results Test, PageSpeed (retry API), resubmit sitemap in Search Console, confirm © year and footer link.

**10. Write-up.** `.ui-audit/REPORT.md` (before/after screenshots, Lighthouse + axe before/after, skipped items, copy suggestions) feeding the weeks 3–4 posts from Guide.md. Update `CLAUDE.md` (architecture, commands, remove wrong html2canvas claim) and `README.md` (stop being create-next-app boilerplate).

## Commit/PR sequence
`chore: baseline + audit` → `chore(deps): remove unused, patch next` → `feat(ui): devchi.me design system + shell` → `feat(tax): rules engine + 2026 regime + tests` → `feat(tax): page content + share links` → `feat(seo): metadata/sitemap/og/json-ld` → `fix(inflation)…` → `fix(bmi)…` → `chore: a11y/perf pass` → `docs`. Commits include the Co-Authored-By line from the session attribution.

## Critical files
`src/lib/calculations/tax.ts`, `src/lib/data/nigeria-tax-brackets.ts` (→ replaced by `src/lib/tax/*`), `src/hooks/use{Tax,Inflation}Calculator.ts` (remove fake delays), `src/components/calculators/Enhanced*Calculator.tsx`, `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`, `src/app/*-calculator/page.tsx`, `src/components/layout/*`, `src/lib/data/nigeria-cpi.ts`, `next.config.ts`, `public/{manifest.json,sitemap.xml,robots.txt}`, `package.json`. Reuse from `Devchi-Digital`: `globals.css` tokens, `components/ui/*`, `Providers.tsx`, `JsonLd.tsx`, `lib/seo.ts`, `Footer.tsx`/`Navbar.tsx` patterns.

## Verification
- `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run build` all green; `npm audit` shows no critical/high.
- Tax engine cross-checked by hand against ≥5 worked examples (e.g. ₦800k → ₦0; ₦3m; ₦12m; ₦50m; rent-relief cap) and against independent calculators noted in research.
- `curl -s localhost:3000/tax-calculator` (and with JS disabled in the browser) shows H1, band table, FAQ, disclaimer; one H1 per page; per-page canonical/OG.
- Playwright screenshots into `.ui-audit/after/`, axe before/after counts, Lighthouse mobile ≥90 (local prod build, then live after deploy); manual check at 375px and keyboard-only; user tests on a real low-end Android phone (cannot be automated).

## Open questions / risks
- Confirm `Devchi-Digital` is the devchi.me source.
- Gazetted NTA 2025 text still needed to verify pension/NHF/NHIS/life-insurance rules and whether minimum tax applies — user can supply the NRS PDF; otherwise shipped as flagged inputs.
- NBS CPI data acquisition may need manual input.
- Installing Playwright/Lighthouse/Vitest requires approval; deploy target for calculate.ng unknown.
- Tailwind v4 cannot support very old Android WebViews; mitigated, not eliminated.
