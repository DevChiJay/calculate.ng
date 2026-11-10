# Baseline — 2026-11-10, branch `ui-refresh/2026-11-10` (before any change)

Commit base: `a9dac47`. Next.js 15.3.3 production build, served with `next start`.

## Checks
| Check | Result |
|---|---|
| `npx tsc --noEmit` | pass |
| `npm run lint` | pass (no warnings) |
| `npm run build` | pass |
| `npm audit` | 15 vulnerabilities: 2 critical (`next`, `jspdf`), 5 high, 8 moderate |

## Bundle (First Load JS)
| Route | Size | First Load JS |
|---|---|---|
| `/` | 2.4 kB | 116 kB |
| `/bmi-calculator` | 4.2 kB | 237 kB |
| `/inflation-calculator` | 6.75 kB | 193 kB |
| `/tax-calculator` | 5.83 kB | 263 kB |
| shared | | 101 kB |

## Server HTML without JavaScript (`html-*.html` in this folder)
| Route | H1 count | `opacity:0` occurrences | canonical | JSON-LD blocks |
|---|---|---|---|---|
| `/` | 1 | 0 | `https://calculate.ng` | 0 |
| `/bmi-calculator` | 2 | 10 | `https://calculate.ng` (wrong) | 0 |
| `/tax-calculator` | 2 | 14 | `https://calculate.ng` (wrong) | 2 |
| `/inflation-calculator` | 2 | 17 | `https://calculate.ng` (wrong) | 2 |

All four pages reference `og-image.jpg`, which does not exist in `public/`.

## Lighthouse mobile (local production build, simulated throttling, Chrome headless)
| Route | Perf | A11y | Best practices | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| `/` | 78 | 100 | 100 | 100 | 0.8 s | 1,060 ms | 0 |
| `/bmi-calculator` | 99 | 95 | 100 | 100 | 1.7 s | 40 ms | 0 |
| `/inflation-calculator` | 100 | 90 | 100 | 100 | 0.8 s | 60 ms | 0 |
| `/tax-calculator` | 100 | 86 | 100 | 100 | 0.8 s | 30 ms | 0 |

Reading: lab performance is already high on a fast machine; the home page is the outlier (blocking time).
Lighthouse SEO 100 does not catch the wrong canonicals, missing og-image or absent no-JS content, so it is not
evidence the SEO is fine. Real low-end Android performance is still untested. Slimmed results in `lighthouse/`.

## axe (WCAG 2.0/2.1 A + AA, 4 routes × 3 viewports × light/dark) — `screens/axe-summary.json`
112 violating nodes: `color-contrast` 72, `button-name` 18, `label-content-name-mismatch` 16, `aria-valid-attr-value` 6.
Home page overflows horizontally by 37 px at 375 px wide (light and dark).

## Screenshots
`screens/` — 4 routes × 375/768/1440 × light/dark (24 full-page PNGs). Observed: floating labels collide with
placeholders ("Annual Salary (₦) salary"), orange/purple page gradient, dev "Dynamic Theme System" showcase on home.

Note: captured at HEAD `937f3be` (dependency cleanup + tax engine, UI unchanged and engine not wired in), which is
visually identical to the original `a9dac47`.
