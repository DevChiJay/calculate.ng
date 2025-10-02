You are refactoring and expanding a Next.js Nigerian financial calculator suite.

Goals:
1. Deduplicate formatting utilities (remove duplicate formatNGN / formatPercentage from tax and inflation modules; create src/lib/utils/format.ts and update imports).
2. Add unit tests for:
   - Tax brackets (edge values around each bracket).
   - Consolidated Relief Allowance computation.
   - Minimum tax logic.
   - Inflation calculation (CPI gaps, short periods < 1 year, identical start/end).
3. Abstract tax calculation logic in src/lib/calculations/tax.ts into:
   - getPersonalIncomeTaxBrackets()
   - calculateConsolidatedReliefAllowance(gross)
   - applyDeductions(inputs)
   so main calculateTaxResult() becomes lean and testable.
4. Create hook useTaxCalculator and useInflationCalculator to encapsulate state + side effects now embedded in Enhanced components.
5. Replace static CPI dataset with:
   - A data access layer: src/lib/data/cpi-source.ts
   - add getLatestCPI(), listYears(), and fallback to static if network fails.
   - (Stub fetch; real endpoint to be added later).
6. Add metadata JSON-LD for calculator pages (tax & inflation) in their page components.
7. Implement new calculator scaffolds (no full UI yet) in src/components/calculators/:
   - VatCalculator.tsx
   - PensionCalculator.tsx
   - LoanAmortizationCalculator.tsx
   Export minimal placeholder with TODO comments.
8. Add navigation entries in Sidebar for new calculators (hidden behind feature flag process.env.NEXT_PUBLIC_EXPERIMENTAL_CALCS).
9. Improve accessibility:
   - Add aria-live="polite" regions for result summaries.
   - Ensure icons have aria-hidden where decorative.
10. Add test configuration (if not present) using Vitest or Jest; prefer Vitest.
11. Add script "test": "vitest run" and "test:watch": "vitest".
12. Document data sources in README section: Tax (FIRS), CPI (NBS), Pension (PenCom).

Constraints:
- Keep existing visual design classes.
- Do not break current exports consumed by pages.
- Keep current route structure.
- Ensure TypeScript strictness passes.

Deliverables:
- Modified files with clear diff.
- New utility + test files.
- Placeholder components for new calculators.
- Updated Sidebar with conditional entries.
- README section appended.

Proceed stepwise: implement shared format util first, then refactor tax, then tests, then CPI abstraction, then hooks, then new calculators, then accessibility.

After each major step, ensure type checks pass.