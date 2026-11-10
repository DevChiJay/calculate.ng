import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { relatedTo } from "@/lib/site";

/** "More calculators" at the end of a calculator page: at most three, then a link to the hub. */
export function RelatedCalculators({ path }: { path: string }) {
  const items = relatedTo(path, 3);
  return (
    <section aria-labelledby="related" className="mt-14 border-t border-border pt-10">
      <h2 id="related" className="text-xl font-semibold">
        More calculators
      </h2>
      <ul className="mt-4 grid gap-3 md:grid-cols-3">
        {items.map((c) => (
          <li key={c.path}>
            <Link
              href={c.path}
              className="block h-full rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary"
            >
              <span className="block font-medium">{c.name}</span>
              <span className="mt-1 block text-sm text-muted-foreground">{c.blurb}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/calculators"
        className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        All calculators <ArrowRight aria-hidden className="size-4" />
      </Link>
    </section>
  );
}
