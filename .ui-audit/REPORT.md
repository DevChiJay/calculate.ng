# Calculate.ng audit and redesign: report

Branch `ui-refresh/2026-11-10`. Before = `.ui-audit/before/`, after = `.ui-audit/after/` (screenshots, axe, Lighthouse, server HTML).
All "after" figures are from a local production build (`next start`), Lighthouse mobile with simulated throttling on a fast Mac.
They are not a real low-end Android measurement. Nothing here has been deployed.

## Results

| Measure | Before | After |
|---|---|---|
| axe violating nodes (4 routes × 3 widths × light/dark) | 112 | **0** |
| Lighthouse mobile, performance (home / BMI / inflation / tax) | 78 / 99 / 100 / 100 | **100 / 100 / 100 / 100** |
| Lighthouse mobile, accessibility | 100 / 95 / 90 / 86 | **100 / 100 / 100 / 100** |
| Home page horizontal overflow at 375 px | 37 px | **0** |
| First Load JS: home / BMI / inflation / tax | 116 / 237 / 193 / 263 kB | **106 / 117 / 117 / 120 kB** |
| H1 per page (calculators) | 2 | **1** |
| `opacity:0` in server HTML (tax) | 14 | **0** |
| Canonical on calculator pages | `/` (wrong) | **own URL** |
| Words of real content in server HTML, tax page | skeleton + intro | **~1,000** |
| `npm audit`, production dependencies | 2 critical, 5 high | **0 vulnerabilities** (after upgrading to Next 16) |
| `npm audit`, dev tooling | n/a | 7 moderate (`minimatch` via typescript-eslint; no fix applied) |
| Tests | none | **73** (tax engine, BMI, inflation maths) |
| End-to-end checks (Playwright, both colour schemes, mobile menu) | none | **33/33** |

Lighthouse SEO was already 100 before; it does not detect wrong canonicals, a missing OG image, or absent no-JS content, so it was not evidence the SEO was sound.

## What changed

- **Design system:** devchi.me tokens (palette, Geist + Space Grotesk, radius), flat surfaces, one teal accent. Removed the per-calculator colour themes, gradients, glow, floating/parallax effects, framer-motion, chart.js, toasts, fake progress bars and the dev "theme showcase" home section. Dark by default, light/system via toggle. `prefers-reduced-motion` respected.
- **Tax engine** (`src/lib/tax/`): versioned rules (2026 NTA 2025, legacy PITA for comparison), pure `computeTax`, real monthly/annual, take-home after payroll deductions, per-band breakdown, old-vs-new comparison, shareable links. Old code was wrong even for the old regime (CRA missing its 20% part, 0.5% minimum tax, deductions derived from gross).
- **Tax page:** single H1, "rules effective 1 Jan 2026 · last checked", sources, band table, reliefs with Confirmed/Unverified tags, "not modelled" list, worked examples computed from the same engine, FAQ, disclaimer, all in server HTML.
- **BMI:** category chosen on the rounded value; 0 ft 0 in no longer crashes; obese categories no longer lose their advice; healthy-weight range added; adult-only note.
- **Inflation:** purchasing-power formula fixed (prices doubling is −50%, not −100%), no time-zone date parsing, linear interpolation instead of snapping, errors visible, impossible years not offered, honest data-coverage notice.
- **SEO/PWA:** per-page canonical/OG/Twitter, generated `sitemap.xml` (real lastmod), `robots.txt`, `manifest.webmanifest`, `opengraph-image`, `WebApplication` + `BreadcrumbList` + `FAQPage` + `WebSite` JSON-LD, `not-found`/`error`/`global-error`.
- **Shell:** top nav (mobile menu closes on navigation), 44 px targets, server-rendered footer with a visible "Built by Devchi Digital" link, labelled social links.
- **Dependencies/config:** 21 packages removed, Next.js 16.4.6, no year-long `immutable` cache on unhashed `public/` files, no wildcard image hosts.

## Not done / follow-ups (read before deploying)

1. **Do not deploy the inflation page yet.** Its CPI series (May 2009 to May 2025) looks synthetic: ₦100,000 in Jan 2020 comes out as ₦225,892 in May 2025, far below real price rises. It needs the NBS data and the January 2025 rebasing handled (workstream 5). The page carries a coverage notice but the numbers are not trustworthy.
2. **Tax rules still unverified against the gazetted Act:** pension, NHF, NHIS, life insurance (and whether any minimum tax applies). Bands and rent relief are cross-checked across several sources. Supplying the Act text would let these be confirmed.
3. **Low-end Android:** untested on a real device. Do the slow-network test on a physical phone.
4. ~~Next 16 upgrade~~ Done: Next 16.4.6 (Turbopack), React 19.3, ESLint flat config, Vitest 5. Only dev-tooling `minimatch` advisories remain.
5. **Web app icons:** manifest has no icons (the old ones 404'd); the favicon is still a 16×16 PNG. Generate 192/512 icons from the logo.
6. **Copy for review:** new home/tax/BMI/inflation copy is mine; the footer keeps your email and phone. `NEXT_PUBLIC_GA_ID` defaults to the existing GA property; there is no cookie/consent notice.
7. **Live site:** unchanged. After deploying, re-check no-JS HTML, canonicals, Rich Results Test, PageSpeed, and resubmit the sitemap.
