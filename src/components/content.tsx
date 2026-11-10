import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** A titled block of server-rendered page copy. Every calculator page is built from these. */
export function ContentSection({
  id,
  title,
  children,
  className,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section aria-labelledby={id} className={cn("mt-14 max-w-3xl", className)}>
      <h2 id={id} className="text-2xl font-semibold sm:text-3xl">
        {title}
      </h2>
      <div className="mt-4 space-y-4 leading-relaxed text-muted-foreground [&_strong]:font-semibold [&_strong]:text-foreground">
        {children}
      </div>
    </section>
  );
}

export interface FaqItem {
  question: string;
  /** Plain text, so the same string can feed the FAQPage JSON-LD. */
  answer: string;
}

/** Native <details>: works without JavaScript, and the answers stay in the page HTML for crawlers. */
export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-border rounded-xl border border-border bg-card">
      {items.map((item) => (
        <details key={item.question} className="group px-5">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 font-medium text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
            {item.question}
            <ChevronDown aria-hidden className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <p className="pb-4 text-muted-foreground">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

/** Scroll-safe table wrapper with a visible caption for assistive technology. */
export function DataTable({ caption, children }: { caption: string; children: React.ReactNode }) {
  return (
    // Focusable + labelled so keyboard users can scroll a wide table (WCAG 2.1.1).
    <div
      role="region"
      aria-label={caption}
      tabIndex={0}
      className="overflow-x-auto rounded-xl border border-border bg-card"
    >
      <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        {children}
      </table>
    </div>
  );
}

export const th = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground";
export const td = "num px-4 py-3 text-foreground";
