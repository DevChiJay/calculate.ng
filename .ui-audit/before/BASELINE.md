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

## Not yet captured
- Lighthouse mobile scores and axe counts: need `lighthouse` / Playwright (not installed; PageSpeed API returned HTTP 429). Requires approval to install.
- Screenshots at 375 / 768 / 1440 px, light + dark: same dependency.
