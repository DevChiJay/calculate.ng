import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CalculatorItem } from "@/lib/site";
import { cn } from "@/lib/utils";

/** A calculator as a link card. Used by the hub and the home page (inside a section that has an H2). */
export function CalculatorCard({ item, badge }: { item: CalculatorItem; badge?: string }) {
  return (
    <Link
      href={item.path}
      className={cn(
        "group flex h-full flex-col rounded-xl border bg-card p-5 transition-colors hover:border-primary",
        badge ? "border-primary/60" : "border-border",
      )}
    >
      {badge && (
        <span className="mb-3 w-fit rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
          {badge}
        </span>
      )}
      <h3 className="text-lg font-semibold">{item.name}</h3>
      <p className="mt-1.5 flex-1 text-sm text-muted-foreground">{item.blurb}</p>
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
        Open
        <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
