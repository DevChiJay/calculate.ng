import { describe, expect, it } from "vitest";
import { calculatorGroups, calculators, getCalculator, groupOf, relatedTo } from "./site";
import { pages } from "./seo";

describe("calculator registry", () => {
  it("has unique paths", () => {
    const paths = calculators.map((c) => c.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("every calculator has an SEO page entry, and every SEO page (bar home and the hub) is a calculator", () => {
    for (const c of calculators) expect(Object.keys(pages), c.path).toContain(c.path);
    const nonCalculators = Object.keys(pages).filter((p) => !getCalculator(p));
    expect(nonCalculators.sort()).toEqual(["/", "/calculators"]);
  });

  it("every related path points at a real calculator", () => {
    for (const c of calculators) for (const r of c.related) expect(getCalculator(r), `${c.path} → ${r}`).toBeDefined();
  });

  it("keeps groups small enough to scan (at most 4 per group)", () => {
    for (const g of calculatorGroups) expect(g.items.length, g.name).toBeLessThanOrEqual(4);
  });

  it("every calculator belongs to exactly one group", () => {
    for (const c of calculators) {
      expect(calculatorGroups.filter((g) => g.items.some((i) => i.path === c.path))).toHaveLength(1);
      expect(groupOf(c.path)).toBeDefined();
    }
  });
});

describe("relatedTo", () => {
  it("never includes the page itself, has no duplicates and respects the limit", () => {
    for (const c of calculators) {
      const r = relatedTo(c.path, 3);
      expect(r.map((x) => x.path)).not.toContain(c.path);
      expect(new Set(r.map((x) => x.path)).size).toBe(r.length);
      expect(r.length).toBeLessThanOrEqual(3);
    }
  });

  it("puts declared related calculators first", () => {
    const withRelated = calculators.find((c) => c.related.length > 0);
    if (withRelated) expect(relatedTo(withRelated.path)[0].path).toBe(withRelated.related[0]);
  });
});
