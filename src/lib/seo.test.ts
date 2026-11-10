import { describe, expect, it } from "vitest";
import { pages } from "./seo";

describe("SEO copy limits", () => {
  for (const [path, p] of Object.entries(pages)) {
    it(`${path}: title ≤ 60 characters`, () => {
      expect(p.title.length).toBeLessThanOrEqual(60);
    });
    it(`${path}: description 70–160 characters`, () => {
      expect(p.description.length).toBeGreaterThanOrEqual(70);
      expect(p.description.length).toBeLessThanOrEqual(160);
    });
    it(`${path}: has an ISO "updated" date`, () => {
      expect(p.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  }

  it("titles are unique", () => {
    const titles = Object.values(pages).map((p) => p.title);
    expect(new Set(titles).size).toBe(titles.length);
  });
});
