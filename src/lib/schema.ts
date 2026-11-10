import { site } from "@/lib/site";
import { pages, type PagePath } from "@/lib/seo";

const publisher = {
  "@type": "Organization",
  name: site.owner.name,
  url: site.owner.url,
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: site.name,
  url: site.url,
  inLanguage: "en-NG",
  publisher,
};

export function webApplicationSchema(
  path: Exclude<PagePath, "/">,
  name: string,
  category: "FinanceApplication" | "HealthApplication",
) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    url: `${site.url}${path}`,
    description: pages[path].description,
    applicationCategory: category,
    operatingSystem: "Any (web browser)",
    browserRequirements: "Requires JavaScript",
    isAccessibleForFree: true,
    inLanguage: "en-NG",
    dateModified: pages[path].updated,
    offers: { "@type": "Offer", price: "0", priceCurrency: "NGN" },
    publisher,
  };
}

export function breadcrumbSchema(path: Exclude<PagePath, "/">, label: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: site.name, item: site.url },
      { "@type": "ListItem", position: 2, name: label, item: `${site.url}${path}` },
    ],
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.question,
      acceptedAnswer: { "@type": "Answer", text: i.answer },
    })),
  };
}
