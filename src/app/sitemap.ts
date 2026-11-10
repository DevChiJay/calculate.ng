import type { MetadataRoute } from "next";
import { pages, type PagePath } from "@/lib/seo";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return (Object.keys(pages) as PagePath[]).map((path) => ({
    url: path === "/" ? site.url : `${site.url}${path}`,
    // Real content dates (bumped when a page's content or rules change), not the build time.
    lastModified: pages[path].updated,
  }));
}
